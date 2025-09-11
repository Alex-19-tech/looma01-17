import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  promptType?: string;
  isStreaming?: boolean;
  streamingText?: string;
  onStreamComplete?: () => void;
}

export function ChatMessage({ 
  message, 
  isUser, 
  promptType, 
  isStreaming = false,
  streamingText = "",
  onStreamComplete 
}: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (isStreaming) {
      // During streaming, show streaming text
      setDisplayedText(streamingText || "");
      setShowCursor(true);
    } else {
      // When streaming stops, show final message or keep last streamed text
      setDisplayedText(message || streamingText || "");
      setShowCursor(false);
    }
  }, [isStreaming, streamingText, message]);

  // Cursor blinking animation - only when streaming and text exists
  useEffect(() => {
    if (!isStreaming || !streamingText) {
      setShowCursor(false);
      return;
    }

    // Start with cursor visible
    setShowCursor(true);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(cursorInterval);
      setShowCursor(false);
    };
  }, [isStreaming, streamingText]);

  // Handle stream completion
  useEffect(() => {
    if (!isStreaming && streamingText && displayedText === streamingText) {
      // Stream just completed, call completion callback
      setShowCursor(false);
      onStreamComplete?.();
    }
  }, [isStreaming, streamingText, displayedText, onStreamComplete]);

  return (
    <div className={cn(
      "flex w-full animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 mb-4",
        isUser 
          ? "bg-user-message text-user-message-foreground ml-12" 
          : "bg-ai-message text-ai-message-foreground mr-12"
      )}>
        {promptType && promptType !== "Auto" && (
          <div className="text-xs opacity-70 mb-1 font-medium">
            {promptType}
          </div>
        )}
        <div className="text-sm leading-relaxed">
          {displayedText}
          {isStreaming && !isUser && (
            <span className={cn(
              "inline-block w-0.5 h-4 ml-1 bg-current",
              showCursor ? "opacity-100" : "opacity-0"
            )}>
              |
            </span>
          )}
        </div>
      </div>
    </div>
  );
}