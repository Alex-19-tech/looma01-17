import { User } from "lucide-react";
import { Button } from "./ui/button";

interface TopNavbarProps {
  onMenuClick: () => void;
  onUserClick: () => void;
}

export function TopNavbar({ onMenuClick, onUserClick }: TopNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10 hover:bg-accent/50 transition-all duration-200"
        >
          <img 
            src="/burger-menu-left-svgrepo-com.svg" 
            alt="Menu" 
            className="h-6 w-6 brightness-0 invert" 
          />
        </Button>
        
        {/* Center: Logo and Name */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center">
            <img 
              src="/Looma.svg" 
              alt="Prelix" 
              className="h-10 w-10" 
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Prelix</h1>
        </div>
        
        {/* Right: User Profile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onUserClick}
          className="h-10 w-10 hover:bg-accent/50 transition-all duration-200"
        >
          <User className="h-6 w-6 text-foreground" />
        </Button>
      </div>
    </header>
  );
}