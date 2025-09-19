import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const availableModels = [
  { id: 'gpt-4o', name: 'GPT-4o (OpenAI)', provider: 'openai' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Anthropic)', provider: 'anthropic' },
  { id: 'grok-beta', name: 'Grok (xAI)', provider: 'xai' },
  { id: 'lovable-dev', name: 'Lovable.dev', provider: 'lovable' },
  { id: 'midjourney', name: 'MidJourney', provider: 'midjourney' }
];

const promptFrameworks = {
  'Research': 'Focus on comprehensive analysis, fact-checking, and providing well-sourced information with multiple perspectives.',
  'Creative': 'Emphasize originality, imagination, and innovative thinking. Use vivid language and creative approaches.',
  'Instructional': 'Structure content for clear learning outcomes with step-by-step guidance and practical examples.',
  'Analytical': 'Break down complex topics systematically with logical reasoning and data-driven insights.',
  'Problem-Solving': 'Apply structured problem-solving methodologies like root cause analysis and solution evaluation.',
  'Auto': 'Adapt the approach based on the context and requirements of the specific request.'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, chatSessionId, userInput, promptType, selectedModel, confirmed, clarificationMessage, contextHistory, selectedTemplate, templateValues } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    console.log(`AI Workflow Action: ${action} for user: ${user.id}`);

    switch (action) {
      case 'create_session':
        return await createChatSession(user.id, userInput, promptType);
        
      case 'understand_input':
        return await generateUnderstanding(user.id, chatSessionId, userInput, promptType, contextHistory);
        
      case 'get_models':
        return new Response(JSON.stringify({ models: availableModels }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      case 'optimize_prompt':
        return await optimizePrompt(user.id, chatSessionId, selectedModel, confirmed, selectedTemplate, templateValues);
        
      case 'generate_response':
        return await generateFinalResponse(user.id, chatSessionId);
        
      case 'process_clarification':
        return await processClarification(user.id, chatSessionId, clarificationMessage, contextHistory);
        
      case 'simple_conversation':
        return await handleSimpleConversation(user.id, chatSessionId, userInput, contextHistory);
        
      case 'get_filtered_templates':
        return await getFilteredTemplates(user.id, chatSessionId, selectedModel, userInput, promptType);
        
      case 'get_type_templates':
        return await getTypeTemplates(user.id, req.json().then(body => body.typeId));
        
      case 'execute_prompt':
        return await executeOptimizedPrompt(user.id, chatSessionId);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in ai-workflow:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createChatSession(userId: string, userInput: string, promptType: string) {
  // First check if user can create new chat interface
  const { data: canCreate, error: limitError } = await supabase.rpc('can_create_chat_interface', {
    _user_id: userId
  });

  if (limitError) {
    console.error('Error checking chat interface limit:', limitError);
    throw new Error('Failed to check chat interface limits');
  }

  if (!canCreate) {
    return new Response(JSON.stringify({ 
      error: 'CHAT_LIMIT_REACHED',
      message: 'You have reached your chat interface limit. Please upgrade or refer friends to unlock unlimited interfaces.' 
    }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create new chat session
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : '')
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Increment chat interface count for users who don't have unlimited
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_unlimited_interfaces')
    .eq('id', userId)
    .single();

  if (!profile?.has_unlimited_interfaces) {
    await supabase.rpc('increment_chat_interface_count', {
      _user_id: userId
    });
  }

  // Store user input for analytics
  await supabase
    .from('user_inputs')
    .insert({
      user_id: userId,
      raw_input: userInput,
      prompt_type: promptType
    });

  // Store initial user message
  await supabase
    .from('chat_messages')
    .insert({
      chat_session_id: session.id,
      user_id: userId,
      content: userInput,
      message_type: 'user_input',
      prompt_type: promptType,
      raw_input: userInput
    });

  console.log(`Created chat session: ${session.id}`);
  
  return new Response(JSON.stringify({ chatSessionId: session.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateUnderstanding(userId: string, chatSessionId: string, userInput: string, promptType: string, contextHistory?: string[]) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const framework = promptFrameworks[promptType as keyof typeof promptFrameworks] || promptFrameworks.Auto;
  
  // Get relevant templates for this category and user input
  // This mapping determines template categories based on prompt type
  const categoryMap: Record<string, string> = {
    'Research': 'Research & Knowledge Work',
    'Creative': 'Creative & Design', 
    'Instructional': 'Development & Code Execution',
    'Analytical': 'Research & Knowledge Work',
    'Problem-Solving': 'Development & Code Execution',
    'Auto': 'Research & Knowledge Work'
  };
  
  const templateCategory = categoryMap[promptType] || 'Research & Knowledge Work';
  
  // Initialize matchingTemplates at function scope
  let matchingTemplates: any[] = [];
  
  try {
    // Use new type_templates system
    const { data: templatesData, error: templateError } = await supabase
      .from('type_templates')
      .select(`
        id,
        template_text,
        tags,
        priority,
        effectiveness_score,
        usage_count,
        metadata
      `)
      .eq('is_active', true)
      .order('effectiveness_score', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(5);

    if (templateError) {
      console.error('Error fetching type templates:', templateError);
    } else {
      matchingTemplates = templatesData || [];
    }

    console.log(`Found ${matchingTemplates.length} active type templates`);
  } catch (error) {
    console.error('Type template matching failed:', error);
  }
  
  // Get session messages for context
  const { data: sessionMessages, error: sessionError } = await supabase
    .from('chat_messages')
    .select('content, message_type')
    .eq('chat_session_id', chatSessionId)
    .order('created_at', { ascending: true });

  if (sessionError) throw sessionError;

  const conversationContext = sessionMessages?.map(msg => `[${msg.message_type}]: ${msg.content}`).join('\n') || '';
  const userContext = contextHistory?.join(' | ') || '';
  
  const systemPrompt = `You are an AI assistant that analyzes user requests for completeness and generates targeted clarifying questions. Focus on essential parameters only.

Framework: ${framework}
Previous context: ${userContext}
Conversation history: ${conversationContext}

Analyze this user request and provide a JSON response with:
1. "understanding": Comprehensive draft understanding incorporating ALL available information
2. "confidence": Score 0-100 based on completeness of ESSENTIAL parameters only
3. "missing_parameters": Array of only CRITICAL missing information (not nice-to-have details)
4. "clarification_question": If critical parameters missing, generate ONE specific question about the MOST important gap
5. "ready_for_confirmation": true if all essential parameters are present (confidence >= 85%), false otherwise

Essential Parameters (score confidence based on these only):
- Target output format/type (40%)
- Core subject/topic (30%)
- Purpose/intended use (20%)
- Critical constraints or requirements (10%)

Non-Essential Parameters (don't reduce confidence for missing):
- Tone preferences, style details, length preferences, minor formatting

Confidence Thresholds:
- 85+ = Ready for confirmation (has all essential info)
- 70-84 = One critical parameter missing
- <70 = Multiple essential parameters missing

For clarification questions:
- Ask ONLY about missing essential parameters
- Be specific and actionable
- Avoid asking about tone, style, or minor preferences
- Stop asking questions once essential parameters are covered

Return valid JSON only.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `NEW REQUEST: "${userInput}"\nPrompt type: ${promptType}` }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content.trim());
      
      // Store AI understanding message with metadata - only show user-facing content
      const userFacingContent = result.clarification_question || result.understanding;
      
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatSessionId,
          user_id: userId,
          content: userFacingContent,
          message_type: result.ready_for_confirmation ? 'ai_understanding' : 'ai_question',
          raw_input: userInput,
          confidence_score: result.confidence,
          missing_parameters: result.missing_parameters,
          clarification_stage: result.ready_for_confirmation ? 'ready_for_confirmation' : 'questioning'
        });

      console.log(`Generated understanding for session: ${chatSessionId}, confidence: ${result.confidence}`);
      
      // Return only user-facing content - not the full internal JSON structure
      const responseWithTemplates = {
        clarification_question: result.clarification_question,
        ready_for_confirmation: result.ready_for_confirmation,
        confidence: result.confidence,
        missing_parameters: result.missing_parameters,
        suggested_templates: matchingTemplates || []
      };
      
      return new Response(JSON.stringify(responseWithTemplates), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      
      // Extract just the text content if it's malformed JSON
      let cleanContent = content;
      try {
        // Try to extract just the clarification_question from malformed JSON
        const questionMatch = content.match(/"clarification_question":\s*"([^"]+)"/);
        const understandingMatch = content.match(/"understanding":\s*"([^"]+)"/);
        if (questionMatch) {
          cleanContent = questionMatch[1];
        } else if (understandingMatch) {
          cleanContent = understandingMatch[1];
        }
      } catch (extractError) {
        // If extraction fails, use a generic message
        cleanContent = "I need more information to help you effectively. Could you provide more details about what you're looking for?";
      }
      
      // Store the fallback message - this is the ONLY message insertion for parse errors
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatSessionId,
          user_id: userId,
          content: cleanContent,
          message_type: 'ai_question',
          raw_input: userInput,
          confidence_score: 50,
          missing_parameters: ["More details needed"],
          clarification_stage: 'questioning'
        });

      return new Response(JSON.stringify({
        clarification_question: cleanContent,
        ready_for_confirmation: false,
        confidence: 50,
        missing_parameters: ["More details needed"],
        suggested_templates: matchingTemplates || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error generating understanding:', error);
    throw new Error('Failed to generate understanding');
  }
}

async function optimizePrompt(userId: string, chatSessionId: string, selectedModel: string, confirmed: string, selectedTemplate?: any, templateValues?: Record<string, string>) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get the original user input and prompt type
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('raw_input, prompt_type')
    .eq('chat_session_id', chatSessionId)
    .eq('message_type', 'user_input')
    .order('created_at', { ascending: true })
    .limit(1);

  if (error || !messages?.length) {
    throw new Error('Could not find original user input');
  }

  const { raw_input, prompt_type } = messages[0];
  const framework = promptFrameworks[prompt_type as keyof typeof promptFrameworks] || promptFrameworks.Auto;
  const modelInfo = availableModels.find(m => m.id === selectedModel);

  let optimizedPrompt = confirmed;
  let templateId = null;

  // If a template was selected, use it instead of generating from scratch
  if (selectedTemplate && templateValues) {
    console.log(`Using selected template: ${selectedTemplate.id}`);
    
    // Fill template with provided values
    optimizedPrompt = selectedTemplate.template_text;
    Object.entries(templateValues).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'gi');
      optimizedPrompt = optimizedPrompt.replace(regex, value);
    });
    
    templateId = selectedTemplate.id;
    
    // Update template usage
    try {
      await supabase.rpc('update_template_usage', {
        _template_id: templateId
      });
    } catch (error) {
      console.error('Failed to update template usage:', error);
    }
  } else {
    // Original optimization logic
    const systemPrompt = `You are an expert prompt engineer. Your job is to optimize prompts for different AI models.

Context:
- Original user request: "${raw_input}"
- User confirmed understanding: "${confirmed}"
- Target model: ${modelInfo?.name || selectedModel}
- Prompt type: ${prompt_type}
- Framework: ${framework}

Create an optimized prompt that:
1. Incorporates the confirmed user intent
2. Uses best practices for the target model
3. Applies the appropriate framework approach
4. Maximizes the chance of getting high-quality output

Return ONLY the optimized prompt, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the optimized prompt now.' }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    const data = await response.json();
    optimizedPrompt = data.choices[0].message.content;
  }

  // Store model selection and optimized prompt
  await supabase
    .from('chat_messages')
    .insert({
      chat_session_id: chatSessionId,
      user_id: userId,
      content: selectedTemplate 
        ? `Perfect, I'll use the "${selectedTemplate.category}" template for ${modelInfo?.name || selectedModel}.`
        : `Perfect, I'll optimize your prompt for ${modelInfo?.name || selectedModel}.`,
      message_type: 'model_selection',
      selected_model: selectedModel,
      optimized_prompt: optimizedPrompt,
      template_id: templateId,
      template_applied: !!selectedTemplate
    });

  console.log(`Optimized prompt for session: ${chatSessionId}, model: ${selectedModel}, template: ${templateId || 'none'}`);
  
  return new Response(JSON.stringify({ optimizedPrompt, selectedModel, templateUsed: !!selectedTemplate }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateFinalResponse(userId: string, chatSessionId: string) {
  // Get the optimized prompt and metadata
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('optimized_prompt, selected_model, template_id')
    .eq('chat_session_id', chatSessionId)
    .eq('message_type', 'model_selection')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !messages?.length) {
    throw new Error('Could not find optimized prompt');
  }

  const { optimized_prompt, selected_model, template_id } = messages[0];
  
  // Get prompt category from template if available
  let prompt_category = null;
  if (template_id) {
    const { data: templateData } = await supabase
      .from('prompt_templates')
      .select('category')
      .eq('id', template_id)
      .single();
    prompt_category = templateData?.category;
  }

  // Store the optimized prompt as the final AI response
  await supabase
    .from('chat_messages')
    .insert({
      chat_session_id: chatSessionId,
      user_id: userId,
      content: optimized_prompt,
      message_type: 'ai_response',
      optimized_prompt: optimized_prompt,
      selected_model: selected_model,
      template_id: template_id
    });

  console.log(`Generated optimized prompt for session: ${chatSessionId}`);
  
  return new Response(JSON.stringify({ 
    optimizedPrompt: optimized_prompt,
    selectedModel: selected_model,
    templateId: template_id,
    promptCategory: prompt_category
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processClarification(userId: string, chatSessionId: string, clarificationMessage: string, contextHistory?: string[]) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get all previous messages in the conversation for context
  const { data: allMessages, error } = await supabase
    .from('chat_messages')
    .select('content, message_type, raw_input, prompt_type')
    .eq('chat_session_id', chatSessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Could not load conversation history');
  }

  // Build all user inputs for context merging
  const allUserInputs = allMessages?.filter(msg => 
    ['user_input', 'confirmation', 'clarification_answer'].includes(msg.message_type)
  ).map(msg => msg.content) || [];
  
  const mergedUserContext = [...(contextHistory || []), ...allUserInputs, clarificationMessage].join(' ');

  // Get the current framework from the session
  const originalMessage = allMessages?.find(msg => msg.message_type === 'user_input');
  const framework = originalMessage?.prompt_type || 'Auto';

  const systemPrompt = `You are an AI assistant that evaluates user requests for completeness after receiving clarifications. Focus on essential parameters only.

Framework: ${framework}
Complete user context: ${mergedUserContext}
Latest clarification: ${clarificationMessage}

Analyze the COMPLETE request (including all clarifications) and provide a JSON response with:
1. "understanding": Updated comprehensive understanding incorporating ALL information as a cohesive draft
2. "confidence": Score 0-100 based on completeness of ESSENTIAL parameters only
3. "missing_parameters": Array of only CRITICAL still-missing information
4. "clarification_question": If critical parameters still missing, generate ONE specific follow-up question
5. "ready_for_confirmation": true if all essential parameters covered (confidence >= 85%), false otherwise

Essential Parameters for Confidence Scoring:
- Target output format/type (40%)
- Core subject/topic (30%) 
- Purpose/intended use (20%)
- Critical constraints or requirements (10%)

Clarification Processing Rules:
- Be generous with confidence scoring when users provide good clarifications
- Only ask follow-up questions about truly essential missing information
- Stop questioning once all essential parameters are covered
- Compose a complete, cohesive understanding draft when ready

Confidence Thresholds:
- 85+ = Ready for confirmation (stop asking questions)
- 70-84 = One essential parameter may be missing
- <70 = Multiple essential parameters missing

Return valid JSON only.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please evaluate this complete request: ${mergedUserContext}` }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      
      // Store the updated understanding with metadata
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatSessionId,
          user_id: userId,
          content: result.clarification_question || result.understanding,
          message_type: result.ready_for_confirmation ? 'ai_understanding' : 'ai_question',
          model_response: result.understanding,
          confidence_score: result.confidence,
          missing_parameters: result.missing_parameters,
          clarification_stage: result.ready_for_confirmation ? 'ready_for_confirmation' : 'questioning'
        });

      console.log(`Processed clarification for session: ${chatSessionId}, confidence: ${result.confidence}`);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      // Fallback response
      const fallbackResult = {
        understanding: content,
        confidence: 80,
        missing_parameters: [],
        ready_for_confirmation: true
      };
      
      await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatSessionId,
          user_id: userId,
          content: content,
          message_type: 'ai_understanding',
          model_response: content,
          confidence_score: 80,
          missing_parameters: [],
          clarification_stage: 'ready_for_confirmation'
        });
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in processClarification:', error);
    throw new Error('Failed to process clarification');
  }
}

async function handleSimpleConversation(userId: string, chatSessionId: string, message: string, contextHistory?: string[]) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get all conversation messages for complete context
  const { data: allMessages, error } = await supabase
    .from('chat_messages')
    .select('content, message_type, created_at')
    .eq('chat_session_id', chatSessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Could not load conversation history');
  }

  // Build comprehensive conversation context
  const conversationHistory = allMessages?.map(msg => {
    const role = ['user_input', 'confirmation'].includes(msg.message_type) ? 'User' : 'Assistant';
    return `${role}: ${msg.content}`;
  }).join('\n') || '';

  // Include persistent context from the entire session
  const fullContext = contextHistory && contextHistory.length > 0 ? 
    `Persistent session context:\n${contextHistory.join('\n')}\n\nFull conversation:\n${conversationHistory}` :
    `Full conversation:\n${conversationHistory}`;

  const systemPrompt = `You are a helpful AI assistant maintaining a natural conversation. You have complete awareness of our conversation history and can reference any previous topics or context.

${fullContext}

User's latest message: "${message}"

Respond naturally while being aware of our entire conversation. Reference previous topics when relevant to show continuity. Be helpful, engaging, and conversational. Maintain the flow of our discussion.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 600
      }),
    });

    const data = await response.json();
    const simpleResponse = data.choices?.[0]?.message?.content || "I apologize, but I couldn't process your message. Please try again.";

    // Store simple AI response
    await supabase
      .from('chat_messages')
      .insert({
        chat_session_id: chatSessionId,
        user_id: userId,
        content: simpleResponse,
        message_type: 'ai_response',
        model_response: simpleResponse
      });

    console.log(`Generated simple conversation response for session: ${chatSessionId}`);
    
    return new Response(JSON.stringify({ response: simpleResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in simple conversation:', error);
    throw new Error('Failed to generate conversation response');
  }
}

// New function to get filtered templates based on selected model
async function getFilteredTemplates(userId: string, chatSessionId: string, selectedModel: string, userInput: string, promptType: string) {
  console.log(`Getting filtered templates for model: ${selectedModel}`);
  
  // Get the original prompt type or use a default category
  const categoryMap: Record<string, string> = {
    'Research': 'Research & Knowledge Work',
    'Creative': 'Creative & Design', 
    'Instructional': 'Development & Code Execution',
    'Analytical': 'Research & Knowledge Work',
    'Problem-Solving': 'Development & Code Execution',
    'Auto': 'Research & Knowledge Work'
  };
  
  const templateCategory = categoryMap[promptType] || 'Research & Knowledge Work';
  
  try {
    // Use enhanced template matching with model-based filtering
    const { data: matchingTemplates, error: templateError } = await supabase
      .rpc('match_templates_to_input', {
        _user_input: userInput,
        _category: templateCategory,
        _limit: 5, // Get more templates since we're filtering by model
        _model: selectedModel // Pass the selected model for filtering
      });

    if (templateError) {
      console.error('Error fetching filtered templates:', templateError);
      throw templateError;
    }

    console.log(`Found ${matchingTemplates?.length || 0} filtered templates for model ${selectedModel}`);
    
    return new Response(JSON.stringify({ 
      filtered_templates: matchingTemplates || [],
      model: selectedModel,
      category: templateCategory
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error getting filtered templates:', error);
    throw new Error('Failed to get filtered templates');
  }
}

async function executeOptimizedPrompt(userId: string, chatSessionId: string) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get the optimized prompt from the last ai_response message
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('content, selected_model')
    .eq('chat_session_id', chatSessionId)
    .eq('message_type', 'ai_response')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !messages?.length) {
    throw new Error('Could not find optimized prompt');
  }

  const { content: optimized_prompt, selected_model } = messages[0];
  
  try {
    // Execute the optimized prompt using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selected_model?.includes('gpt') ? selected_model : 'gpt-4o-mini',
        messages: [
          { role: 'user', content: optimized_prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    const data = await response.json();
    const executedResponse = data.choices[0].message.content;

    // Store executed response as a new message
    await supabase
      .from('chat_messages')
      .insert({
        chat_session_id: chatSessionId,
        user_id: userId,
        content: executedResponse,
        message_type: 'executed_response',
        model_response: executedResponse,
        selected_model: selected_model
      });

    console.log(`Executed prompt for session: ${chatSessionId}`);
    
    return new Response(JSON.stringify({ response: executedResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error executing prompt:', error);
    throw new Error('Failed to execute prompt');
  }
}

async function getTypeTemplates(userId: string, typeId: string) {
  try {
    const { data: templates, error } = await supabase
      .from('type_templates')
      .select(`
        id,
        template_text,
        tags,
        priority,
        effectiveness_score,
        usage_count,
        is_active,
        created_at,
        metadata
      `)
      .eq('type_id', typeId)
      .eq('is_active', true)
      .order('effectiveness_score', { ascending: false })
      .order('usage_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`Retrieved ${templates?.length || 0} templates for type: ${typeId}`);
    
    return new Response(JSON.stringify({ templates: templates || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting type templates:', error);
    throw new Error('Failed to get type templates');
  }
}