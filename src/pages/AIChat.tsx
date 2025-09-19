import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AIWorkflowChat } from "@/components/AIWorkflowChat";
import { ChatSessionList } from "@/components/ChatSessionList";
import { TopNavbar } from "@/components/TopNavbar";
import { UserProfileDrawer } from "@/components/UserProfileDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useChatInterfaceLimit } from "@/hooks/useChatInterfaceLimit";
import { UpgradeOrReferModal } from "@/components/UpgradeOrReferModal";

export default function AIChat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [showSessions, setShowSessions] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
  const { toast } = useToast();
  const { canCreate, count, maxCount, hasUnlimited } = useChatInterfaceLimit();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    navigate(`/ai-chat/${sessionId}`);
    setShowSessions(false);
  };

  const handleCreateNew = () => {
    // Check if user can create new chat interface
    if (!canCreate && !hasUnlimited) {
      setUpgradeModalOpen(true);
      return;
    }

    setCurrentSessionId(null);
    navigate('/ai-chat');
    setShowSessions(false);
  };

  const toggleSessions = () => {
    setShowSessions(!showSessions);
  };

  const toggleUserProfile = () => {
    setUserProfileOpen(!userProfileOpen);
  };

  if (showSessions) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-80 border-r border-border bg-card">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Chat Sessions</h2>
          </div>
          <ChatSessionList
            onSelectSession={handleSelectSession}
            onCreateNew={handleCreateNew}
            selectedSessionId={currentSessionId || undefined}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <TopNavbar onMenuClick={toggleSessions} onUserClick={toggleUserProfile} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>Select a chat session to continue</p>
              <p className="text-sm">or create a new one</p>
            </div>
          </div>
        </div>
        <UserProfileDrawer isOpen={userProfileOpen} onClose={() => setUserProfileOpen(false)} />
        <UpgradeOrReferModal 
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          currentCount={count}
          maxCount={maxCount}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <AIWorkflowChat />
    </div>
  );
}