import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { 
  Crown, 
  Users, 
  Copy, 
  MessageCircle, 
  Zap,
  Gift,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface UpgradeOrReferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  maxCount: number;
}

export function UpgradeOrReferModal({ 
  isOpen, 
  onClose, 
  currentCount, 
  maxCount 
}: UpgradeOrReferModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const [selectedOption, setSelectedOption] = useState<'upgrade' | 'referral' | null>(null);
  const [showReferralDetails, setShowReferralDetails] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (profile?.referral_code) {
      setReferralLink(`${window.location.origin}/signup?ref=${profile.referral_code}`);
    }
  }, [profile]);

  const progressPercentage = profile ? Math.min((profile.active_referrals_count / 4) * 100, 100) : 0;
  const remainingReferrals = 4 - (profile?.active_referrals_count || 0);

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const handleReferral = () => {
    if (showReferralDetails) {
      navigate('/referrals');
      onClose();
    } else {
      setShowReferralDetails(true);
    }
  };

  const copyReferralLink = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copied!",
        description: "Share this link with friends to start earning rewards.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const goBack = () => {
    setShowReferralDetails(false);
    setSelectedOption(null);
  };

  if (showReferralDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Refer & Unlock Unlimited</DialogTitle>
                  <DialogDescription className="text-sm">
                    Share your link and earn free weeks
                  </DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={goBack}>
                Back
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {remainingReferrals === 0 ? (
                    <>
                      <Crown className="h-5 w-5 text-amber-500" />
                      Unlimited Unlocked!
                    </>
                  ) : (
                    <>
                      <Gift className="h-5 w-5 text-blue-500" />
                      {remainingReferrals} more to unlimited
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {remainingReferrals === 0 
                    ? "You've earned unlimited chat interfaces!"
                    : `Refer ${remainingReferrals} more active friend${remainingReferrals === 1 ? '' : 's'} to unlock unlimited access`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Active Referrals</span>
                      <span className="font-medium">{profile?.active_referrals_count || 0} / 4</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-lg font-bold text-blue-500">{profile?.active_referrals_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Active Referrals</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-lg font-bold text-green-500">{profile?.referral_rewards_weeks || 0}</div>
                      <div className="text-xs text-muted-foreground">Free Weeks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Link */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Referral Link</CardTitle>
                <CardDescription className="text-sm">
                  Share this link with friends to start earning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    value={referralLink}
                    readOnly
                    className="flex-1 text-sm"
                    placeholder="Loading..."
                  />
                  <Button onClick={copyReferralLink} size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-500 text-white min-w-[20px] h-5 text-xs">1</Badge>
                    <span className="text-sm">Friend signs up with your link</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500 text-white min-w-[20px] h-5 text-xs">2</Badge>
                    <span className="text-sm">They create their first chat interface</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500 text-white min-w-[20px] h-5 text-xs">3</Badge>
                    <span className="text-sm">You earn +1 free Pro week</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-500 text-white min-w-[20px] h-5 text-xs">4</Badge>
                    <span className="text-sm">4 active referrals = Unlimited forever!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleReferral}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              Continue to Full Referrals Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold">You've Reached Your Limit</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Free users can create up to <span className="font-medium text-foreground">{maxCount} chat interfaces</span>. 
              You've used <span className="font-medium text-foreground">{currentCount}</span>.
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-3">
              Upgrade to Pro for unlimited access—or refer friends to earn free weeks and unlock unlimited chat interfaces.
            </p>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-6">
          {/* Upgrade Option */}
          <Card 
            className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
              selectedOption === 'upgrade' 
                ? 'border-primary bg-primary/5 shadow-elegant' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedOption('upgrade')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-amber-500" />
                <span>Upgrade to Pro</span>
                <Badge className="bg-green-500 text-white">Instant</Badge>
              </CardTitle>
              <CardDescription>
                Get unlimited chat interfaces and premium features immediately
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited interfaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Advanced features</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">No referral required</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Option */}
          <Card 
            className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
              selectedOption === 'referral' 
                ? 'border-blue-500 bg-blue-500/5 shadow-elegant' 
                : 'border-border hover:border-blue-500/50'
            }`}
            onClick={() => setSelectedOption('referral')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Refer Friends</span>
                <Badge variant="outline" className="border-blue-500 text-blue-500">Free</Badge>
              </CardTitle>
              <CardDescription>
                Unlock unlimited access by referring {4 - (profile?.active_referrals_count || 0)} more active friend{4 - (profile?.active_referrals_count || 0) === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Progress</span>
                  <span className="font-medium">{profile?.active_referrals_count || 0} / 4 referrals</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-blue-500" />
                    <span>1 week per referral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>Unlimited at 4 referrals</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button 
            onClick={selectedOption === 'upgrade' ? handleUpgrade : handleReferral}
            disabled={!selectedOption}
            className={`flex-1 ${
              selectedOption === 'referral' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : ''
            }`}
          >
            {selectedOption === 'upgrade' && (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Upgrade – $10/month
              </>
            )}
            {selectedOption === 'referral' && (
              <>
                <Users className="h-4 w-4 mr-2" />
                Start Referring
              </>
            )}
            {!selectedOption && 'Select an option'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}