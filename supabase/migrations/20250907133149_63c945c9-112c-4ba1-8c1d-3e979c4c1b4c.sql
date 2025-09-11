-- Add new columns to chat_messages table for adaptive clarification
ALTER TABLE chat_messages ADD COLUMN confidence_score INTEGER DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN missing_parameters JSONB DEFAULT '[]'::jsonb;
ALTER TABLE chat_messages ADD COLUMN clarification_stage TEXT DEFAULT 'initial';

-- Update the message_type check constraint to include new types
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_message_type_check 
CHECK (message_type IN ('user_input', 'ai_understanding', 'confirmation', 'model_selection', 'ai_response', 'ai_question', 'clarification_answer'));

-- Create index for efficient querying by clarification stage
CREATE INDEX IF NOT EXISTS idx_chat_messages_clarification_stage ON chat_messages(clarification_stage);
CREATE INDEX IF NOT EXISTS idx_chat_messages_confidence_score ON chat_messages(confidence_score);