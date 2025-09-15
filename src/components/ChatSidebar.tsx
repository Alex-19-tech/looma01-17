import { useState, useEffect, useRef } from "react";
import { Plus, MessageSquare, Trash2, Edit3, Search, User, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onUserProfileClick: () => void;
}

export function ChatSidebar({ isOpen, onClose, onUserProfileClick }: ChatSidebarProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadChatSessions();
    }
  }, [isOpen]);

  const loadChatSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('chat_sessions') as any)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setChatSessions((data || []) as unknown as ChatSession[]);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAIChat = () => {
    // Reset any existing session state and navigate to a fresh chat
    navigate('/chat', { replace: true, state: { sessionId: null, initialInput: null, forceNewSession: true } });
    onClose();
  };

  const handleNewRegularChat = () => {
    navigate('/chat');
    onClose();
  };

  const handleSelectSession = (sessionId: string) => {
    navigate(`/chat`, { state: { sessionId } });
    onClose();
  };

  const deleteSession = async (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      const { error } = await (supabase
        .from('chat_sessions') as any)
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      setChatSessions(chatSessions.filter(session => session.id !== sessionId));
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
      
      toast({
        title: "Success",
        description: "Chat session deleted"
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive"
      });
    }
  };

  const handleLongPressStart = (sessionId: string) => {
    longPressTimer.current = setTimeout(() => {
      setSessionToDelete(sessionId);
      setDeleteDialogOpen(true);
    }, 800); // 800ms for long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full lg:h-screen min-h-0 overflow-hidden">
          {/* Fixed Top Section - Logo & Header */}
          <div className="flex-shrink-0">
            {/* Logo */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <img 
                  src="/Looma.svg" 
                  alt="Prelix" 
                  className="h-14 w-14" 
                />
                <h1 className="text-2xl font-semibold text-foreground">Prelix</h1>
              </div>
            </div>
            
            {/* Header */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start gap-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground" 
                  variant="default"
                  onClick={handleNewAIChat}
                >
                  <Sparkles className="h-4 w-4" />
                  New AI Chat
                </Button>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Scrollable Chat History - Only this section scrolls */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group flex items-center gap-2 p-3 rounded-lg hover:bg-brand-primary/10 cursor-pointer border border-transparent hover:border-brand-primary/20"
                    onClick={() => handleSelectSession(session.id)}
                    onMouseDown={() => handleLongPressStart(session.id)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(session.id)}
                    onTouchEnd={handleLongPressEnd}
                  >
                    <Sparkles className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => deleteSession(session.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No AI chats yet</p>
                  <p className="text-xs">Start a new AI workflow to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Fixed Bottom Section - User Profile */}
          <div className="flex-shrink-0 p-4 border-t border-border">
            <div 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
              onClick={onUserProfileClick}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt="User profile" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  S
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Alex Mwangi</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chat session? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteDialogOpen(false);
                setSessionToDelete(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => sessionToDelete && deleteSession(sessionToDelete)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}