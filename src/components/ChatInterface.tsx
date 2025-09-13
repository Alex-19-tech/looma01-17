import { useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TopNavbar } from "./TopNavbar";
import { ChatSidebar } from "./ChatSidebar";
import { UserProfileDrawer } from "./UserProfileDrawer";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  promptType?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, promptType: string) => void;
}

export function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleUserProfile = () => setUserProfileOpen(!userProfileOpen);
  const closeUserProfile = () => setUserProfileOpen(false);

  return (
    <div className="h-screen bg-black overflow-hidden">
      {/* Mobile navbar - only show on mobile */}
      <div className="lg:hidden">
        <TopNavbar onMenuClick={toggleSidebar} onUserClick={toggleUserProfile} />
      </div>
      
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <ChatSidebar isOpen={sidebarOpen} onClose={closeSidebar} onUserProfileClick={toggleUserProfile} />
      </div>
      
      <UserProfileDrawer isOpen={userProfileOpen} onClose={closeUserProfile} />
      
      {/* Desktop layout - Fixed height grid with no overflow */}
      <div className="hidden lg:grid lg:grid-cols-[320px_1fr] h-screen">
        {/* Fixed 320px sidebar - full height with internal scrolling */}
        <div className="h-full border-r border-border">
          <ChatSidebar isOpen={true} onClose={() => {}} onUserProfileClick={toggleUserProfile} />
        </div>
        
        {/* Chat area - fills remaining width and full height */}
        <div className="h-full flex flex-col">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    promptType={message.promptType}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pinned input bar at bottom */}
          <div className="shrink-0 border-t border-border bg-background">
            <div className="p-4">
              <div className="max-w-4xl mx-auto">
                <ChatInput 
                  isLandingMode={false}
                  onSendMessage={onSendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                promptType={message.promptType}
              />
            ))}
          </div>
        </div>

        {/* Fixed chat input at bottom */}
        <div className="fixed bottom-4 left-0 right-0 bg-black backdrop-blur-sm px-2 pb-2">
          <div className="w-full">
            <ChatInput 
              isLandingMode={false}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}