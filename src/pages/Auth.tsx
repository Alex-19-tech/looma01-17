import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const { user, signIn, signUp, signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password, rememberMe);

    if (error) {
      setError(error.message);
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have been successfully signed in.',
      });
      navigate('/chat');
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });
    }

    setIsLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google') => {
    setIsLoading(true);
    setError('');

    const { error } = await signInWithOAuth(provider);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ 
          backgroundImage: `url(/lovable-uploads/376d787f-3ac3-42bb-8874-163f27a8a992.png)`,
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Get Started Section */}
        <div className={`flex-1 flex items-end transition-all duration-700 ease-in-out ${
          showAuthOptions ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <div className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 pb-12">
            <div className="max-w-sm mx-auto text-center text-white">
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Stop Guessing. Start Producing.
              </h1>
              <p className="text-white/90 mb-8 text-lg leading-relaxed">
                Type anything — Prelix will turn it into expert-level AI results instantly.
              </p>
              
              <Button 
                onClick={() => setShowAuthOptions(true)}
                className="w-full h-14 bg-brand-blue hover:bg-brand-blue/90 text-brand-blue-foreground font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>

        {/* Auth Options Section */}
        <div className={`bg-gray-900 rounded-t-3xl transition-all duration-700 ease-in-out transform ${
          showAuthOptions ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        } ${showAuthOptions ? 'min-h-screen' : ''}`}>
          <div className="p-8 max-w-sm mx-auto">
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-8" />
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img 
                  src="/Looma.svg" 
                  alt="Prelix" 
                  className="h-12 w-12" 
                />
                <span className="text-white font-bold text-xl">Prelix</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">
                Stop Guessing. Start Producing.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Type anything — Prelix will turn it into expert-level AI results instantly.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/30">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-4 mb-8">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('apple')}
                disabled={isLoading}
                className="w-full h-14 bg-white text-black hover:bg-gray-100 border-0 rounded-full font-medium text-base"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </Button>

              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full h-14 bg-gray-800 text-white hover:bg-gray-700 border-gray-600 rounded-full font-medium text-base"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="relative mb-8">
              <Separator className="bg-gray-700" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-4 text-sm text-gray-400">
                Or
              </span>
            </div>

            {/* Email/Password Forms */}
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-800 border-gray-700">
                <TabsTrigger value="signin" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="pl-10 rounded-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        required
                        className="pl-10 pr-10 rounded-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="border-gray-600 data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
                        />
                      <Label htmlFor="remember" className="text-sm text-gray-300">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-brand-blue hover:text-brand-blue/80 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-brand-blue-foreground font-semibold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        required
                        className="pl-10 rounded-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="pl-10 rounded-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        required
                        minLength={6}
                        className="pl-10 pr-10 rounded-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-brand-blue-foreground font-semibold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}