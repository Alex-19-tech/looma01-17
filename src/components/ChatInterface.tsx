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
    <div className="flex flex-col h-screen bg-black relative">
      <TopNavbar onMenuClick={toggleSidebar} onUserClick={toggleUserProfile} />
      <ChatSidebar isOpen={sidebarOpen} onClose={closeSidebar} onUserProfileClick={toggleUserProfile} />
      <UserProfileDrawer isOpen={userProfileOpen} onClose={closeUserProfile} />
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
  );
}