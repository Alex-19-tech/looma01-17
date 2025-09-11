import { User, Settings, LogOut, BarChart3, X, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "./ui/drawer";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useState } from "react";

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileDrawer({ isOpen, onClose }: UserProfileDrawerProps) {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleSignIn = () => {
    window.location.href = '/auth';
    onClose();
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  // If no user is signed in, show sign-in interface
  if (!user) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[80vh]">
          <div className="absolute right-4 top-4 z-10">
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          
          <DrawerHeader className="pb-6">
            <DrawerTitle className="text-center text-2xl font-bold">Account</DrawerTitle>
          </DrawerHeader>

          <div className="px-6 pb-8 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-muted text-muted-foreground text-xl font-semibold">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Not signed in
                </h2>
                <p className="text-muted-foreground">Sign in to access your account</p>
              </div>
              <Button 
                onClick={handleSignIn}
                className="w-full max-w-sm"
              >
                Sign In
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[80vh]">
          <div className="absolute right-4 top-4 z-10">
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          
          <DrawerHeader className="pb-6">
            <DrawerTitle className="text-center text-2xl font-bold">Account</DrawerTitle>
          </DrawerHeader>

          <div className="px-6 pb-8 space-y-6">
            {/* User Info Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || ""} alt="User avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {profile?.full_name || user?.email}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {profile?.plan || 'Free'} Plan
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsManageOpen(true)}>
                Manage
              </Button>
            </div>

            <Separator />

            {/* Language Setting */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Language</span>
              </div>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Español</SelectItem>
                  <SelectItem value="French">Français</SelectItem>
                  <SelectItem value="German">Deutsch</SelectItem>
                  <SelectItem value="Italian">Italiano</SelectItem>
                  <SelectItem value="Portuguese">Português</SelectItem>
                  <SelectItem value="Chinese">中文</SelectItem>
                  <SelectItem value="Japanese">日本語</SelectItem>
                  <SelectItem value="Korean">한국어</SelectItem>
                  <SelectItem value="Arabic">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Model Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Use Model Mode Selector</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose between individual models or simplified mode selection
              </p>
            </div>

            <Separator />

            {/* Settings & Logout */}
            <div className="space-y-3 pt-4">
              <Link to="/profile">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                  onClick={onClose}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = '/pricing'}
              >
                <BarChart3 className="h-4 w-4" />
                Usage & Billing
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Manage Profile Dialog */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Manage Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || ""} alt="User avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">
                {profile?.full_name || user?.email}
              </h3>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <Badge variant="secondary" className="mt-1">
                {profile?.plan || 'Free'} Plan
              </Badge>
            </div>
            <Button 
              variant="destructive" 
              className="w-full gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}