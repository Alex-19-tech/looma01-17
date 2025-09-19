import { MessageCircle, Crown, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ChatInterfaceCounterProps {
  count: number;
  maxCount: number;
  hasUnlimited: boolean;
  className?: string;
}

export function ChatInterfaceCounter({ 
  count, 
  maxCount, 
  hasUnlimited, 
  className = '' 
}: ChatInterfaceCounterProps) {
  if (hasUnlimited) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Unlimited Interfaces</span>
          </div>
          <Badge variant="secondary">Pro</Badge>
        </CardContent>
      </Card>
    );
  }

  const isNearLimit = count >= maxCount * 0.8; // 80% of limit
  const isAtLimit = count >= maxCount;

  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <MessageCircle className={`h-4 w-4 ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-amber-500' : 'text-muted-foreground'}`} />
          <span className="text-sm font-medium">
            Chat Interfaces: {count} / {maxCount}
          </span>
        </div>
        <Badge 
          variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
        >
          {isAtLimit ? 'Limit Reached' : 'Free Plan'}
        </Badge>
      </CardContent>
    </Card>
  );
}