import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Gift, Crown, MessageCircle } from 'lucide-react';
import { TopNavbar } from '@/components/TopNavbar';
import { UserProfileDrawer } from '@/components/UserProfileDrawer';

export default function Referrals() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (profile?.referral_code) {
      setReferralLink(`${window.location.origin}/signup?ref=${profile.referral_code}`);
    }
  }, [profile]);

  const copyReferralLink = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copied!",
        description: "Your referral link has been copied to the clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const progressPercentage = profile ? Math.min((profile.active_referrals_count / 4) * 100, 100) : 0;
  const isUnlimited = profile?.has_unlimited_interfaces;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavbar onMenuClick={() => {}} onUserClick={() => setUserProfileOpen(true)} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading referral data...</p>
          </div>
        </div>
        <UserProfileDrawer isOpen={userProfileOpen} onClose={() => setUserProfileOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar onMenuClick={() => {}} onUserClick={() => setUserProfileOpen(true)} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Refer & Earn</h1>
          <p className="text-muted-foreground">
            Invite friends to unlock unlimited chat interfaces and earn free Pro weeks!
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isUnlimited ? (
                  <>
                    <Crown className="h-5 w-5 text-amber-500" />
                    Unlimited Unlocked!
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Progress to Unlimited
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isUnlimited 
                  ? "You've unlocked unlimited chat interfaces through referrals!"
                  : `Refer 4 active friends to unlock unlimited chat interfaces forever.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Active Referrals</span>
                    <span>{profile?.active_referrals_count || 0} / 4</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile?.active_referrals_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Active Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{profile?.referral_rewards_weeks || 0}</div>
                    <div className="text-sm text-muted-foreground">Free Weeks Earned</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Link Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link with friends to start earning rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  value={referralLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyReferralLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-500" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-500 text-white min-w-[24px] h-6 flex items-center justify-center">1</Badge>
                  <div>
                    <h4 className="font-medium">Share Your Link</h4>
                    <p className="text-sm text-muted-foreground">Send your referral link to friends via email, social media, or messaging apps.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-500 text-white min-w-[24px] h-6 flex items-center justify-center">2</Badge>
                  <div>
                    <h4 className="font-medium">Friends Sign Up</h4>
                    <p className="text-sm text-muted-foreground">Your friends create an account and verify their email address.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-500 text-white min-w-[24px] h-6 flex items-center justify-center">3</Badge>
                  <div>
                    <h4 className="font-medium">They Become Active</h4>
                    <p className="text-sm text-muted-foreground">Each friend becomes "active" by creating their first chat interface.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-amber-500 text-white min-w-[24px] h-6 flex items-center justify-center">4</Badge>
                  <div>
                    <h4 className="font-medium">Earn Rewards</h4>
                    <p className="text-sm text-muted-foreground">Get 1 free Pro week per active referral. After 4 active referrals, unlock unlimited chat interfaces permanently!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <UserProfileDrawer isOpen={userProfileOpen} onClose={() => setUserProfileOpen(false)} />
    </div>
  );
}