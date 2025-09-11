import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProfile } from '@/hooks/useProfile';
import { usePreferences } from '@/hooks/usePreferences';
import { useActivity } from '@/hooks/useActivity';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Settings, Activity, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { profile, loading, updateProfile } = useProfile();
  const { preferences, updatePreferences } = usePreferences();
  const { activities, loading: activitiesLoading } = useActivity();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!fullName.trim()) return;

    setIsLoading(true);
    const { error } = await updateProfile({ full_name: fullName });

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      setIsEditing(false);
    }
    setIsLoading(false);
  };

  const handleEdit = () => {
    setFullName(profile?.full_name || '');
    setIsEditing(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'default';
      case 'guest':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'destructive';
      case 'pro':
        return 'default';
      case 'free':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-10">
        <Alert>
          <AlertDescription>
            Unable to load profile information. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Button onClick={signOut} variant="outline">
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          {profile.role === 'admin' && (
            <TabsTrigger value="admin">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(profile.role)}>
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </Badge>
                    <Badge 
                      variant={getPlanBadgeVariant(profile.plan)}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => window.location.href = '/pricing'}
                    >
                      {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/pricing'}
                    className="text-xs"
                  >
                    Manage Billing & Plans
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                      <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{profile.full_name || 'Not set'}</span>
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile.last_login
                      ? new Date(profile.last_login).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience with Prelix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Theme</Label>
                    <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <select 
                    className="px-3 py-1 text-sm border rounded-md"
                    value={preferences.theme}
                    onChange={(e) => updatePreferences({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Language</Label>
                    <p className="text-xs text-muted-foreground">Select your preferred language</p>
                  </div>
                  <select 
                    className="px-3 py-1 text-sm border rounded-md"
                    value={preferences.language}
                    onChange={(e) => updatePreferences({ language: e.target.value as 'english' | 'spanish' | 'french' })}
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive email updates</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={preferences.email_notifications}
                    onChange={(e) => updatePreferences({ email_notifications: e.target.checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Auto-save Chats</Label>
                    <p className="text-xs text-muted-foreground">Automatically save your conversations</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={preferences.auto_save_chats}
                    onChange={(e) => updatePreferences({ auto_save_chats: e.target.checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                View your recent activity and sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${activity.metadata?.prompt_type ? 
                          (() => {
                            switch (activity.metadata.prompt_type) {
                              case 'research': return 'bg-blue-500';
                              case 'writing': return 'bg-green-500';
                              case 'analysis': return 'bg-purple-500';
                              case 'brainstorming': return 'bg-orange-500';
                              default: return 'bg-gray-500';
                            }
                          })() : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs">Start using Prelix to see your activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {profile.role === 'admin' && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>
                  Administrative tools and user management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Admin features will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}