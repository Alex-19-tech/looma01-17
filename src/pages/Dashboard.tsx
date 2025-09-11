import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare, User, Settings, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.full_name || user?.email}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {profile && (
            <>
              <Badge variant="outline">{profile.plan}</Badge>
              <Badge variant="secondary">{profile.role}</Badge>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat Interface</span>
            </CardTitle>
            <CardDescription>
              Start a conversation with Prelix AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">Start Chatting</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/profile">
              <Button variant="outline" className="w-full">View Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription>
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {profile?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Admin Panel</span>
              </CardTitle>
              <CardDescription>
                Administrative tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'Unknown'
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Login</p>
              <p className="text-sm text-muted-foreground">
                {profile?.last_login 
                  ? new Date(profile.last_login).toLocaleString()
                  : 'Never'
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Plan</p>
              <Badge variant="outline" className="mt-1">
                {profile?.plan || 'Free'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}