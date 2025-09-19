import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Crown, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  maxCount: number;
}

export function UpgradeModal({ isOpen, onClose, currentCount, maxCount }: UpgradeModalProps) {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<'upgrade' | 'referral' | null>(null);

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const handleReferral = () => {
    navigate('/referrals');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Chat Interface Limit Reached
          </DialogTitle>
          <DialogDescription>
            You've used {currentCount} of {maxCount} free chat interfaces. Choose how to unlock unlimited access:
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card 
            className={`cursor-pointer transition-all border-2 ${
              selectedOption === 'upgrade' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedOption('upgrade')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Upgrade to Pro
                <Badge variant="secondary">Instant</Badge>
              </CardTitle>
              <CardDescription>
                Get unlimited chat interfaces and premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Unlimited chat interfaces
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Advanced features
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all border-2 ${
              selectedOption === 'referral' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedOption('referral')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Refer Friends
                <Badge variant="outline">Free</Badge>
              </CardTitle>
              <CardDescription>
                Unlock unlimited access by referring 4 active friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Earn 1 free week per active referral
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Get unlimited interfaces after 4 referrals
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Help friends discover Prelix
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={selectedOption === 'upgrade' ? handleUpgrade : handleReferral}
            disabled={!selectedOption}
            className="flex-1"
          >
            {selectedOption === 'upgrade' ? 'Upgrade Now' : 'Start Referring'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}