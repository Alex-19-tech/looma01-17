import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TopNavbar } from "./TopNavbar";
import { ChatSidebar } from "./ChatSidebar";
import { UserProfileDrawer } from "./UserProfileDrawer";
import { TemplateSelector } from "./TemplateSelector";
import { TemplatePreview } from "./TemplatePreview";
import { TypingDots } from "./TypingDots";
import { useStreamingMessage } from "@/hooks/useStreamingMessage";
import { Loader2, Sparkles, Copy, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  selected_model?: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

interface Template {
  id: string;
  template_text: string;
  placeholders: string[];
  priority: number;
  category: string;
  subcategory?: string;
  tags?: string[];
  usage_count?: number;
  effectiveness_score?: number;
  match_score?: number;
}

interface AIWorkflowChatProps {
  initialInput?: string;
  initialPromptType?: string;
  sessionId?: string;
}

// Model categories configuration
const modelCategories = {
  development: {
    label: "Development & Code Execution",
    models: [
      { id: 'lovable-dev', name: 'Lovable.dev', provider: 'Lovable' },
      { id: 'cursor', name: 'Cursor.sh', provider: 'Cursor' },
      { id: 'replit-ghostwriter', name: 'Replit Ghostwriter', provider: 'Replit' }
    ]
  },
  research: {
    label: "Research & Knowledge Work",
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
      { id: 'claude-3-5', name: 'Claude 3.5', provider: 'Anthropic' },
      { id: 'perplexity', name: 'Perplexity', provider: 'Perplexity' }
    ]
  },
  creative: {
    label: "Creative & Design",
    models: [
      { id: 'midjourney', name: 'MidJourney', provider: 'MidJourney' },
      { id: 'stable-diffusion', name: 'Stable Diffusion', provider: 'Stability AI' },
      { id: 'runwayml', name: 'RunwayML', provider: 'Runway' }
    ]
  },
  business: {
    label: "Business & Marketing",
    models: [
      { id: 'jasper', name: 'Jasper', provider: 'Jasper' },
      { id: 'copy-ai', name: 'Copy.ai', provider: 'Copy.ai' },
      { id: 'crave-ai', name: 'Crave AI', provider: 'Crave' }
    ]
  }
};

// Model-to-Template Category Mapping
// This mapping determines which template categories are shown for each AI model
const modelToTemplateCategoryMap: Record<string, string> = {
  // Development & Code Execution templates for coding-focused models
  'lovable-dev': 'Development & Code Execution',
  'cursor': 'Development & Code Execution',
  'replit-ghostwriter': 'Development & Code Execution',
  
  // Research & Knowledge Work templates for analysis models  
  'gpt-4o': 'Research & Knowledge Work',
  'claude-3-5': 'Research & Knowledge Work',
  'perplexity': 'Research & Knowledge Work',
  
  // Creative & Design templates for creative models
  'midjourney': 'Creative & Design',
  'stable-diffusion': 'Creative & Design', 
  'runwayml': 'Creative & Design',
  
  // Business & Marketing templates for business models
  'jasper': 'Business & Marketing',
  'copy-ai': 'Business & Marketing',
  'crave-ai': 'Business & Marketing',
};

// Map prompt types to categories for adaptive pre-selection
const promptTypeToCategoryMap: Record<string, string> = {
  'research': 'research',
  'analytical': 'research',
  'creative': 'creative',
  'instructional': 'development',
  'problem-solving': 'development',
  'auto': 'research' // default
};

export function AIWorkflowChat({ initialInput, initialPromptType, sessionId }: AIWorkflowChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<'input' | 'understanding' | 'model_selection' | 'generating' | 'complete'>('input');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<string>('');
  const [showClarifyButton, setShowClarifyButton] = useState(false);
  const [isInputAlwaysActive, setIsInputAlwaysActive] = useState(true);
  const [isRequestingClarification, setIsRequestingClarification] = useState(false);
  const [contextMemory, setContextMemory] = useState<string[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [messageBeingProcessed, setMessageBeingProcessed] = useState<string | null>(null);
  
  // New state for adaptive clarification loop
  const [clarificationStage, setClarificationStage] = useState<'initial' | 'questioning' | 'ready_for_confirmation'>('initial');
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [missingParameters, setMissingParameters] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  
  // Template integration state
  const [suggestedTemplates, setSuggestedTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  
  // Prompt execution state
  const [isExecutingPrompt, setIsExecutingPrompt] = useState(false);
  
  // Streaming functionality
  const { startStreaming, appendToStream, completeStream, getStreamingText, isStreaming } = useStreamingMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate streaming for AI responses
  const simulateStreamingResponse = (messageId: string, fullText: string) => {
    startStreaming(messageId, "");
    
    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        // Add 1-3 characters at a time for more natural typing
        const charsToAdd = Math.min(Math.floor(Math.random() * 3) + 1, fullText.length - currentIndex);
        const nextChunk = fullText.slice(currentIndex, currentIndex + charsToAdd);
        appendToStream(messageId, nextChunk);
        currentIndex += charsToAdd;
      } else {
        clearInterval(streamInterval);
        setTimeout(() => completeStream(messageId), 500); // Brief pause before completing
      }
    }, 50); // Adjust speed here

    return () => clearInterval(streamInterval);
  };

  useEffect(() => {
    if (sessionId) {
      // Load existing session
      setChatSessionId(sessionId);
      loadMessages(sessionId);
      setCurrentStep('complete');
    } else {
      // Reset to fresh state for new session
      setChatSessionId(null);
      setMessages([]);
      setCurrentStep('input');
      setSelectedModel('');
      setPendingConfirmation('');
      setShowClarifyButton(false);
      setIsRequestingClarification(false);
      setContextMemory([]);
      setLastMessageId(null);
      setMessageBeingProcessed(null);
      setClarificationStage('initial');
      setConfidenceScore(0);
      setMissingParameters([]);
      setCurrentQuestion('');
      setSuggestedTemplates([]);
      setSelectedTemplate(null);
      setShowTemplatePreview(false);
      setTemplateValues({});
      setShowTemplateSelection(false);
      setIsExecutingPrompt(false);
      
      if (initialInput && initialPromptType) {
        // Start new workflow with initial input
        handleInitialInput(initialInput, initialPromptType);
      }
    }
    loadAvailableModels();
  }, [initialInput, initialPromptType, sessionId]);

  const loadAvailableModels = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-workflow', {
        body: { action: 'get_models' }
      });

      if (error) throw error;
      setAvailableModels(data.models);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Error",
        description: "Failed to load available AI models",
        variant: "destructive"
      });
    }
  };

  const handleInitialInput = async (userInput: string, promptType: string) => {
    setIsLoading(true);
    try {
      // Create chat session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('ai-workflow', {
        body: {
          action: 'create_session',
          userInput,
          promptType
        }
      });

      if (sessionError) throw sessionError;
      
      setChatSessionId(sessionData.chatSessionId);
      
      // Load initial messages
      await loadMessages(sessionData.chatSessionId);
      
      // Generate AI understanding
      const { data: understandingData, error: understandingError } = await supabase.functions.invoke('ai-workflow', {
        body: {
          action: 'understand_input',
          chatSessionId: sessionData.chatSessionId,
          userInput,
          promptType
        }
      });

      if (understandingError) throw understandingError;
      
      // Update clarification state based on AI response
      if (understandingData.clarification_question) {
        setClarificationStage('questioning');
        setCurrentQuestion(understandingData.clarification_question);
      } else if (understandingData.ready_for_confirmation) {
        setClarificationStage('ready_for_confirmation');
      }
      
      setConfidenceScore(understandingData.confidence || 0);
      setMissingParameters(understandingData.missing_parameters || []);
      
      // Handle template suggestions
      if (understandingData.suggested_templates && understandingData.suggested_templates.length > 0) {
        setSuggestedTemplates(understandingData.suggested_templates);
        setShowTemplateSelection(understandingData.ready_for_confirmation && !understandingData.clarification_question);
      }
      
      // Reload messages to include AI understanding, but mask its content before streaming begins
      await loadMessages(sessionData.chatSessionId, { maskLatestAI: true });
      
      // Start streaming animation for the latest AI message
      const latestMessages = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', sessionData.chatSessionId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (latestMessages.data?.[0]?.message_type?.includes('ai')) {
        simulateStreamingResponse(latestMessages.data[0].id, latestMessages.data[0].content);
      }
      
      setCurrentStep('understanding');
      
    } catch (error) {
      console.error('Error processing initial input:', error);
      toast({
        title: "Error",
        description: "Failed to process your input",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string, options?: { maskLatestAI?: boolean }) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const rawMessages = data || [];
      
      // Transform messages to show user-friendly content
      let transformedMessages = rawMessages.map(msg => {
        // For AI messages, extract user-facing content from JSON or raw text
        if (msg.message_type === 'ai_understanding' || msg.message_type === 'ai_question') {
          let userFacingContent = msg.content;
          
          // Try to parse as JSON and extract user-facing fields
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed.clarification_question) {
              userFacingContent = parsed.clarification_question;
            } else if (parsed.ready_for_confirmation && parsed.understanding) {
              userFacingContent = "I think I understand. Can you confirm this is correct?";
            } else if (parsed.understanding) {
              userFacingContent = parsed.understanding;
            } else {
              // Fallback for any other JSON structure
              userFacingContent = "Prelix is processing your request...";
            }
          } catch (parseError) {
            // If it's not JSON, use the content as-is
            // But filter out obvious JSON artifacts
            if (userFacingContent.includes('"understanding":') || 
                userFacingContent.includes('"confidence":') ||
                userFacingContent.includes('"missing_parameters":')) {
              userFacingContent = "Prelix is processing your request...";
            }
          }
          
          return { ...msg, content: userFacingContent };
        }
        
        return msg;
      });

      // Optionally mask the latest AI message content to prevent pre-render before streaming starts
      if (options?.maskLatestAI) {
        for (let i = transformedMessages.length - 1; i >= 0; i--) {
          const m = transformedMessages[i];
          if (m.message_type && m.message_type.includes('ai')) {
            transformedMessages[i] = { ...m, content: "" };
            break;
          }
        }
      }
      
      // Safely merge transformed database messages with any existing temporary messages
      setMessages(prev => {
        // Keep temporary messages that haven't been persisted yet
        const tempMessages = prev.filter(msg => msg.id.startsWith('temp-'));
        // Remove any temp messages that are now in the database
        const filteredTempMessages = tempMessages.filter(tempMsg => 
          !transformedMessages.some(dbMsg => dbMsg.content === tempMsg.content && 
                           dbMsg.message_type === tempMsg.message_type)
        );
        // Combine transformed database messages with remaining temp messages
        return [...transformedMessages, ...filteredTempMessages];
      });
      
      // Update context memory with all user messages for AI reference
      const userMessages = rawMessages
        .filter(msg => ['user_input', 'confirmation'].includes(msg.message_type))
        .map(msg => msg.content);
      setContextMemory(userMessages);
      
      // Track last message for immediate display
      if (rawMessages.length > 0) {
        setLastMessageId(rawMessages[rawMessages.length - 1].id);
      }
      
      // Clear any processing state
      setMessageBeingProcessed(null);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessageBeingProcessed(null);
    }
  };

  const handleConfirmUnderstanding = async (confirmed: string) => {
    if (!chatSessionId) return;
    
    setIsLoading(true);
    try {
      // Store user confirmation
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatSessionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content: confirmed,
          message_type: 'confirmation'
        });

      setPendingConfirmation(confirmed);
      await loadMessages(chatSessionId);
      setCurrentStep('model_selection');
      
    } catch (error) {
      console.error('Error confirming understanding:', error);
      toast({
        title: "Error",
        description: "Failed to confirm understanding",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelection = async (modelId: string) => {
    if (!chatSessionId || !pendingConfirmation) return;
    
    setSelectedModel(modelId);
    setIsLoading(true);
    
    // Fetch filtered templates for the selected model first
    if (suggestedTemplates && suggestedTemplates.length > 0) {
      try {
        const response = await supabase.functions.invoke('ai-workflow', {
          body: {
            action: 'get_filtered_templates',
            chatSessionId,
            selectedModel: modelId,
            userInput: messages.find(m => m.message_type === 'user_input')?.content || '',
            promptType: 'Auto' // Use Auto as default since we don't store prompt type in messages
          }
        });

        if (response.data?.filtered_templates) {
          setSuggestedTemplates(response.data.filtered_templates);
          // Show template selection if we have filtered templates
          if (response.data.filtered_templates.length > 0) {
            setShowTemplateSelection(true);
            setCurrentStep('model_selection'); // Stay in model selection to show templates
            setIsLoading(false);
            return; // Don't proceed to optimization yet - wait for template selection
          }
        }
      } catch (error) {
        console.error('Error fetching filtered templates:', error);
        // Continue with optimization even if template filtering fails
      }
    }
    
    setCurrentStep('generating');
    
    try {
      // Optimize prompt for selected model
      const { data: optimizeData, error: optimizeError } = await supabase.functions.invoke('ai-workflow', {
        body: {
          action: 'optimize_prompt',
          chatSessionId,
          selectedModel: modelId,
          confirmed: pendingConfirmation,
          selectedTemplate,
          templateValues
        }
      });

      if (optimizeError) throw optimizeError;
      
      await loadMessages(chatSessionId);
      
      // Generate final response
      const { data: responseData, error: responseError } = await supabase.functions.invoke('ai-workflow', {
        body: {
          action: 'generate_response',
          chatSessionId
        }
      });

      if (responseError) throw responseError;
      
      await loadMessages(chatSessionId);
      setCurrentStep('complete');
      
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to generate response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to detect if input requires structured workflow
  const requiresWorkflow = (input: string): boolean => {
    const workflowKeywords = [
      'create', 'generate', 'write', 'design', 'build', 'make', 'develop',
      'help me with', 'i need', 'can you', 'please', 'prompt for',
      'write a prompt', 'create a prompt', 'generate a prompt'
    ];
    
    const lowerInput = input.toLowerCase();
    return workflowKeywords.some(keyword => lowerInput.includes(keyword)) ||
           input.length > 50; // Longer inputs likely need structured processing
  };

  const handleNewMessage = async (message: string, promptType: string) => {
    if (!message.trim() || messageBeingProcessed === message) return;
    
    // Set processing state to prevent duplicate submissions
    setMessageBeingProcessed(message);
    
    // Add message to context memory immediately for persistence
    setContextMemory(prev => [...prev, message]);
    
    // Create temporary message for immediate UI display
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: message,
      message_type: 'user_input',
      created_at: new Date().toISOString()
    };
    
    // Show message immediately while processing
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      // If we're in clarifying mode, handle clarification
      if (isRequestingClarification) {
        await handleClarificationInput(message);
        return;
      }
      
      // If no session exists, start new workflow
      if (!chatSessionId) {
        await handleInitialInput(message, promptType);
        return;
      }
      
      // Determine if this input requires a structured workflow or is regular conversation
      if (requiresWorkflow(message)) {
        // Start new structured workflow in the same session
        await handleContinuationInput(message, promptType);
      } else {
        // Handle as regular conversation
        await handleRegularConversation(message);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessageBeingProcessed(null);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClarificationInput = async (message: string) => {
    if (!chatSessionId) return;
    
    setIsLoading(true);
    setIsRequestingClarification(false);
    
    try {
      // Add clarification message to current session
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatSessionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content: message,
          message_type: 'user_input'
        });

      await loadMessages(chatSessionId);
      
      // Process the clarification with full context
      const { data: responseData, error: responseError } = await supabase.functions.invoke('ai-workflow', {
        body: {
          action: 'process_clarification',
          chatSessionId,
          clarificationMessage: message,
          contextHistory: contextMemory // Send context for better understanding
        }
      });

      if (responseError) throw responseError;
      
      // Update clarification state based on AI response
      if (responseData.clarification_question) {
        setClarificationStage('questioning');
        setCurrentQuestion(responseData.clarification_question);
      } else if (responseData.ready_for_confirmation) {
        setClarificationStage('ready_for_confirmation');
      }
      
      setConfidenceScore(responseData.confidence || 0);
      setMissingParameters(responseData.missing_parameters || []);
      
      // Handle updated template suggestions
      if (responseData.suggested_templates && responseData.suggested_templates.length > 0) {
        setSuggestedTemplates(responseData.suggested_templates);
        setShowTemplateSelection(responseData.ready_for_confirmation && !responseData.clarification_question);
      }
      
      await loadMessages(chatSessionId);
      
      // ALWAYS stay in understanding step after clarification
      // Only move to model selection when user explicitly clicks "Yes, Correct"
      setCurrentStep('understanding');
      
    } catch (error) {
      console.error('Error processing clarification:', error);
      // Don't remove temp messages on error - keep them visible for retry
      setIsRequestingClarification(true); // Allow retry
      toast({
        title: "Error",
        description: "Failed to process clarification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinuationInput = async (message: string, promptType: string) => {
    if (!chatSessionId) return;
    
    setIsLoading(true);
    setCurrentStep('input');
    
    try {
      // Add user message to current session
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatSessionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content: message,
          message_type: 'user_input',
          prompt_type: promptType,
          raw_input: message
        });

      await loadMessages(chatSessionId);
      
      // Generate AI understanding for new input with context
      const { data: understandingData, error: understandingError } = await supabase.functions.invoke('ai-workflow', {
        body: {
          action: 'understand_input',
          chatSessionId,
          userInput: message,
          promptType,
          contextHistory: contextMemory
        }
      });

      if (understandingError) throw understandingError;
      
      // Update clarification state based on AI response
      if (understandingData.clarification_question) {
        setClarificationStage('questioning');
        setCurrentQuestion(understandingData.clarification_question);
      } else if (understandingData.ready_for_confirmation) {
        setClarificationStage('ready_for_confirmation');
      }
      
      setConfidenceScore(understandingData.confidence || 0);
      setMissingParameters(understandingData.missing_parameters || []);
      
      // Handle template suggestions for continuation
      if (understandingData.suggested_templates && understandingData.suggested_templates.length > 0) {
        setSuggestedTemplates(understandingData.suggested_templates);
        setShowTemplateSelection(understandingData.ready_for_confirmation && !understandingData.clarification_question);
      }
      
      await loadMessages(chatSessionId);
      setCurrentStep('understanding');
      
    } catch (error) {
      console.error('Error processing continuation input:', error);
      // Don't remove temp messages on error - keep them visible for retry
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Template handling functions
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplatePreview(true);
  };

  // Filter templates based on selected model's category
  const getFilteredTemplates = () => {
    if (!selectedModel || !suggestedTemplates) return suggestedTemplates;
    
    const modelTemplateCategory = modelToTemplateCategoryMap[selectedModel];
    if (!modelTemplateCategory) return suggestedTemplates;
    
    // Filter templates to only show those matching the model's category
    const filtered = suggestedTemplates.filter(template => 
      template.category === modelTemplateCategory
    );
    
    console.log(`Filtered templates for model ${selectedModel}: ${filtered.length}/${suggestedTemplates.length} templates`);
    return filtered;
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplatePreview(true);
  };

  const handleConfirmTemplate = (template: Template, filledTemplate: string, placeholderValues: Record<string, string>) => {
    setSelectedTemplate(template);
    setTemplateValues(placeholderValues);
    setShowTemplatePreview(false);
    setShowTemplateSelection(false);
    
    // Auto-proceed to model selection since template is confirmed
    setCurrentStep('model_selection');
  };

  const handleSkipTemplates = () => {
    setSelectedTemplate(null);
    setTemplateValues({});
    setShowTemplateSelection(false);
    setCurrentStep('model_selection');
  };

  const handleCopyPrompt = async (promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to copy prompt",
        variant: "destructive"
      });
    }
  };

  const handleExecutePrompt = async () => {
    if (!chatSessionId) return;
    
    setIsExecutingPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workflow', {
        body: {
          action: 'execute_prompt',
          chatSessionId
        }
      });

      if (error) throw error;
      
      await loadMessages(chatSessionId);
      toast({
        title: "Success!",
        description: "Prompt executed successfully",
      });
    } catch (error) {
      console.error('Error executing prompt:', error);
      toast({
        title: "Error",
        description: "Failed to execute prompt",
        variant: "destructive"
      });
    } finally {
      setIsExecutingPrompt(false);
    }
  };

  const handleRegularConversation = async (message: string) => {
    if (!chatSessionId) return;
    
    setIsLoading(true);
    
    try {
      // Add user message to current session
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatSessionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content: message,
          message_type: 'user_input'
        });

      await loadMessages(chatSessionId);
      
      // Generate simple AI response with context awareness
      const { data: responseData, error: responseError } = await supabase.functions.invoke('ai-workflow', {
        body: {
          action: 'simple_conversation',
          chatSessionId,
          message,
          contextHistory: contextMemory
        }
      });

      if (responseError) throw responseError;
      
      await loadMessages(chatSessionId);
      
    } catch (error) {
      console.error('Error in regular conversation:', error);
      // Don't remove temp messages on error - keep them visible for retry
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleClarifyRequest = () => {
    setIsRequestingClarification(true);
    setShowClarifyButton(false);
    setClarificationStage('questioning');
    // Stay in current step to maintain flow context
  };

  const handleProceedAnyway = () => {
    handleConfirmUnderstanding("User chose to proceed with current understanding");
  };

  const getLastAIMessage = async () => {
    if (!chatSessionId) return null;
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', chatSessionId)
        .in('message_type', ['ai_understanding', 'ai_response'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting last AI message:', error);
      return null;
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatSessionId(null);
    setCurrentStep('input');
    setSelectedModel('');
    setPendingConfirmation('');
    setShowClarifyButton(false);
    setContextMemory([]);
    setLastMessageId(null);
    setIsRequestingClarification(false);
    setMessageBeingProcessed(null);
    
    // Reset clarification state
    setClarificationStage('initial');
    setConfidenceScore(0);
    setMissingParameters([]);
    setCurrentQuestion('');
  };

  const renderModelSelection = () => {
    if (currentStep !== 'model_selection') return null;
    
    // Determine which category to auto-expand based on prompt type
    const defaultExpandedCategory = promptTypeToCategoryMap[initialPromptType || 'auto'] || 'research';
    
    return (
      <div className="bg-surface/50 rounded-lg p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4">Choose your AI model:</h3>
        <Accordion 
          type="single" 
          collapsible 
          defaultValue={defaultExpandedCategory}
          className="w-full space-y-2"
        >
          {Object.entries(modelCategories).map(([categoryKey, category]) => (
            <AccordionItem 
              key={categoryKey} 
              value={categoryKey}
              className="border border-border rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{category.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.models.length} models
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 gap-2">
                  {category.models.map((model) => (
                    <Button
                      key={model.id}
                      variant="outline"
                      className="justify-start h-auto p-4 text-left hover:bg-accent/50"
                      onClick={() => handleModelSelection(model.id)}
                      disabled={isLoading}
                    >
                      <div className="flex flex-col items-start">
                        <div className="font-medium text-foreground">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.provider}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  const getMessageType = (message: Message) => {
    switch (message.message_type) {
      case 'user_input':
      case 'confirmation':
      case 'clarification':
      case 'conversation':
        return 'user';
      case 'ai_understanding':
      case 'ai_response':
      case 'ai_clarification_response':
      case 'simple_response':
      case 'model_selection':
        return 'assistant';
      default:
        return 'assistant';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background relative">
      <TopNavbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        onUserClick={() => setUserProfileOpen(!userProfileOpen)} 
      />
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onUserProfileClick={() => setUserProfileOpen(!userProfileOpen)} 
      />
      <UserProfileDrawer 
        isOpen={userProfileOpen} 
        onClose={() => setUserProfileOpen(false)} 
      />

      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* New Chat Button */}
          {messages.length > 0 && (
            <div className="mb-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleNewChat}
                className="mb-4"
              >
                Start New Chat
              </Button>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id}>
              <ChatMessage
                message={message.content}
                isUser={getMessageType(message) === 'user'}
                isStreaming={isStreaming(message.id)}
                streamingText={getStreamingText(message.id)}
                onStreamComplete={() => {
                  const finalText = getStreamingText(message.id);
                  if (finalText) {
                    setMessages(prev => prev.map(m => 
                      m.id === message.id ? { ...m, content: finalText } : m
                    ));
                  }
                  completeStream(message.id);
                }}
              />
              
              {/* Show confirmation buttons ONLY when ready for confirmation */}
              {message.message_type === 'ai_understanding' && 
               clarificationStage === 'ready_for_confirmation' && 
               currentStep === 'understanding' && (
                <div className="flex gap-2 mb-4 justify-end mr-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfirmUnderstanding("Yes, that's exactly what I want to do.")}
                    disabled={isLoading}
                  >
                    ✅ Yes, Correct
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClarifyRequest}
                    disabled={isLoading}
                  >
                    ✏️ Let Me Clarify
                  </Button>
                </div>
              )}
              
              {/* Show only copy button for completed responses */}
              {message.message_type === 'ai_response' && currentStep === 'complete' && (
                <div className="flex gap-2 mb-4 justify-end mr-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyPrompt(message.content)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Prompt
                  </Button>
                </div>
              )}

              {/* Show confirmation buttons for clarification responses - ALWAYS stay in Step 2 */}
              {message.message_type === 'ai_clarification_response' && currentStep === 'understanding' && (
                <div className="flex gap-2 mb-4 justify-end mr-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfirmUnderstanding("Yes, correct")}
                    disabled={isLoading}
                  >
                    Yes, Correct
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClarifyRequest}
                    disabled={isLoading}
                  >
                    Let Me Clarify
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {renderModelSelection()}

          {/* Template Selection - Show after model is selected */}
          {currentStep === 'model_selection' && selectedModel && showTemplateSelection && suggestedTemplates && (
            <div className="mb-6 p-4 border rounded-lg bg-card">
              <TemplateSelector 
                templates={getFilteredTemplates()}
                onSelectTemplate={handleSelectTemplate}
                onPreviewTemplate={handlePreviewTemplate}
                userInput={messages.find(m => m.message_type === 'user_input')?.content || ''}
                selectedModel={selectedModel}
                modelTemplateCategory={selectedModel ? modelToTemplateCategoryMap[selectedModel] : undefined}
              />
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleSkipTemplates}
                  className="text-sm"
                >
                  Skip Templates & Continue
                </Button>
              </div>
            </div>
          )}
          
          {/* Typing dots animation in chat bubble when AI is processing */}
          {isLoading && (currentStep === 'understanding' || currentStep === 'generating' || currentStep === 'input') && (
            <div className="flex w-full animate-fade-in justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 mb-4 bg-ai-message text-ai-message-foreground mr-12">
                <TypingDots />
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background backdrop-blur-sm p-2 border-t">
        <div className="w-full">
          <ChatInput 
            isLandingMode={false}
            onSendMessage={handleNewMessage}
            disabled={isLoading && currentStep === 'generating'}
            placeholder={isRequestingClarification ? "Please provide more details..." : "How can I help you today?"}
          />
        </div>
      </div>
      
      {/* Template Preview Modal */}
      <TemplatePreview
        template={selectedTemplate}
        userInput={messages.find(m => m.message_type === 'user_input')?.content || ''}
        isOpen={showTemplatePreview}
        onClose={() => setShowTemplatePreview(false)}
        onConfirm={handleConfirmTemplate}
      />
    </div>
  );
}