import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AIWorkflowChat } from "@/components/AIWorkflowChat";
import { supabase } from "@/integrations/supabase/client";

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  // Get initial input from navigation state
  const initialInput = location.state?.initialInput;
  const initialPromptType = location.state?.initialPromptType;
  const sessionId = location.state?.sessionId;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <AIWorkflowChat 
        initialInput={initialInput}
        initialPromptType={initialPromptType}
        sessionId={sessionId}
      />
    </div>
  );
}