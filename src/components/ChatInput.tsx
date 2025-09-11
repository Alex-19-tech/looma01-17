import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Send, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  isLandingMode?: boolean;
  onFirstMessage?: (message: string, promptType: string) => void;
  onSendMessage?: (message: string, promptType: string) => void;
  disabled?: boolean;
  placeholder?: string;
  defaultMessage?: string;
  onMessageChange?: (message: string) => void;
}

export function ChatInput({ isLandingMode = false, onFirstMessage, onSendMessage, disabled = false, placeholder = "How can I help you today?", defaultMessage, onMessageChange }: ChatInputProps) {
  const [message, setMessage] = useState(defaultMessage || "");
  const [promptType, setPromptType] = useState("Auto");
  
  const promptTypes = [
    { value: "Auto", label: "Auto" },
    { value: "Research", label: "Research" },
    { value: "Creative", label: "Creative" },
    { value: "Instructional", label: "Instructional" },
    { value: "Analytical", label: "Analytical" },
    { value: "Problem-Solving", label: "Problem-Solving" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = defaultMessage !== undefined ? defaultMessage : message;
    if (currentMessage.trim()) {
      const taggedMessage = promptType === "Auto" ? currentMessage : `[${promptType}] ${currentMessage}`;
      
      if (isLandingMode && onFirstMessage) {
        onFirstMessage(taggedMessage, promptType);
      } else if (onSendMessage) {
        onSendMessage(taggedMessage, promptType);
      }
      
      if (defaultMessage !== undefined && onMessageChange) {
        onMessageChange("");
      } else {
        setMessage("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <form onSubmit={handleSubmit} className="relative">
          <div className="bg-[#2A2A2A] backdrop-blur-sm rounded-2xl px-3 py-4 flex flex-col gap-3">
            {/* Input field */}
            <div className="mb-2">
              <Input
                value={defaultMessage !== undefined ? defaultMessage : message}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (defaultMessage !== undefined && onMessageChange) {
                    onMessageChange(newValue);
                  } else {
                    setMessage(newValue);
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full bg-transparent border-none text-white text-base font-medium placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-0 py-0 disabled:opacity-50"
              />
            </div>
            
            {/* Controls row */}
            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 shrink-0"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Select value={promptType} onValueChange={setPromptType}>
                  <SelectTrigger className="h-10 px-3 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 border-none focus:ring-0 focus:ring-offset-0 min-w-fit">
                    <div className="flex items-center gap-2">
                      <Send className="h-3 w-3" />
                      <SelectValue className="text-xs" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-white/20 rounded-xl">
                    {promptTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Right control - Dynamic icon */}
              <Button
                type={(defaultMessage !== undefined ? defaultMessage.trim() : message.trim()) ? "submit" : "button"}
                size="icon"
                className="h-10 w-10 bg-white hover:bg-white/90 text-black rounded-full shrink-0 transition-colors disabled:opacity-50"
                aria-label={(defaultMessage !== undefined ? defaultMessage.trim() : message.trim()) ? "Send message" : "Voice input"}
                disabled={disabled || !(defaultMessage !== undefined ? defaultMessage.trim() : message.trim())}
              >
                {(defaultMessage !== undefined ? defaultMessage.trim() : message.trim()) ? (
                  <Send className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}