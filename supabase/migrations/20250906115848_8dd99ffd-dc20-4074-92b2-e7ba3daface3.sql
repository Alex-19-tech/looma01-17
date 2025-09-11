-- Create chat_sessions table for managing individual chat interfaces
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" 
ON public.chat_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
ON public.chat_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
ON public.chat_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
ON public.chat_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create chat_messages table for storing all messages in chat sessions
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user_input', 'ai_understanding', 'ai_response', 'model_selection', 'confirmation')),
  prompt_type TEXT CHECK (prompt_type IN ('Auto', 'Research', 'Creative', 'Instructional', 'Analytical', 'Problem-Solving')),
  selected_model TEXT,
  raw_input TEXT,
  optimized_prompt TEXT,
  model_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages
CREATE POLICY "Users can view their own chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" 
ON public.chat_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" 
ON public.chat_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user_inputs table for analytics
CREATE TABLE public.user_inputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  raw_input TEXT NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('Auto', 'Research', 'Creative', 'Instructional', 'Analytical', 'Problem-Solving')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_inputs
ALTER TABLE public.user_inputs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_inputs
CREATE POLICY "Users can view their own inputs" 
ON public.user_inputs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inputs" 
ON public.user_inputs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();