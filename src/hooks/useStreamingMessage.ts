import { useState, useCallback } from "react";

interface StreamingMessage {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  selected_model?: string;
  isStreaming?: boolean;
  streamingText?: string;
}

export function useStreamingMessage() {
  const [streamingMessages, setStreamingMessages] = useState<Map<string, string>>(new Map());

  const startStreaming = useCallback((messageId: string, initialText: string = "") => {
    setStreamingMessages(prev => new Map(prev.set(messageId, initialText)));
  }, []);

  const appendToStream = useCallback((messageId: string, chunk: string) => {
    setStreamingMessages(prev => {
      const current = prev.get(messageId) || "";
      return new Map(prev.set(messageId, current + chunk));
    });
  }, []);

  const completeStream = useCallback((messageId: string) => {
    setStreamingMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(messageId);
      return newMap;
    });
  }, []);

  const getStreamingText = useCallback((messageId: string) => {
    return streamingMessages.get(messageId) || "";
  }, [streamingMessages]);

  const isStreaming = useCallback((messageId: string) => {
    return streamingMessages.has(messageId);
  }, [streamingMessages]);

  return {
    startStreaming,
    appendToStream,
    completeStream,
    getStreamingText,
    isStreaming
  };
}