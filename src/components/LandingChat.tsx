import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Loader2 } from "lucide-react";
import { ChatInput } from "./ChatInput";
import { StarterPrompts } from "./StarterPrompts";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileDrawer } from "./UserProfileDrawer";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  promptType?: string;
}

export function LandingChat() {
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatInputRef = useRef<HTMLInputElement>(null);

  const handleFirstMessage = (message: string, promptType: string) => {
    if (!user) {
      setIsLoading(true);
      
      // Show loading for 1 second then redirect to auth
      setTimeout(() => {
        navigate('/auth');
      }, 1000);
    } else {
      // Navigate to chat with AI workflow
      navigate('/chat', { state: { initialInput: message, initialPromptType: promptType } });
    }
  };

  const handleSendMessage = (message: string, promptType: string) => {
    setIsLoading(true);
    
    // Show loading for 1 second then redirect to auth
    setTimeout(() => {
      navigate('/auth');
    }, 1000);
  };

  const handlePromptSelect = (prompt: string, promptType: string) => {
    setInputMessage(prompt);
    // Focus the input after a brief delay to ensure the message is set
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder*="How can I help"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
      }
    }, 100);
  };

  return (
    <div 
      className="min-h-screen flex flex-col animate-fade-in relative"
      style={{
        backgroundImage: `url('/lovable-uploads/16b37a1e-b532-49c4-9222-db3317266194.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000'
      }}
    >
      {/* Header with Logo and User Icons */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <img 
            src="/Looma.svg" 
            alt="Prelix" 
            className="h-14 w-14" 
          />
          <span className="text-white font-bold text-4xl">Prelix</span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 rounded-full"
            onClick={() => setIsUserProfileOpen(true)}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Header Section - Positioned lower */}
      <div className="px-4 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Work Smarter with Prelix
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            From idea to flawless results — Prelix makes AI deliver its best
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 px-4">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="ml-3 text-white">Redirecting to sign in...</span>
              </div>
            ) : (
              <>
                <ChatInput 
                  isLandingMode={true}
                  onFirstMessage={handleFirstMessage}
                  defaultMessage={inputMessage}
                  onMessageChange={setInputMessage}
                />
                <StarterPrompts onPromptSelect={handlePromptSelect} />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* User Profile Drawer */}
      <UserProfileDrawer 
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
      />
    </div>
  );
}