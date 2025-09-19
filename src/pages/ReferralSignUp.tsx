import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Eye, EyeOff, ChevronDown } from 'lucide-react';

export default function ReferralSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState('');
  const { user, signUp, signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

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

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');

    const { error } = await signInWithOAuth('google');

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Centered Hero Branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/Looma.svg" 
              alt="Prelix" 
              className="h-16 w-16" 
            />
            <span className="text-foreground font-bold text-3xl">Prelix</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Join Prelix
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Start producing expert-level AI results instantly
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sign-up Options */}
        <div className="space-y-4 mb-8">
          {/* Google Sign Up */}
          <Button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full h-14 bg-white text-black hover:bg-gray-100 border border-input rounded-lg font-medium text-base"
            variant="outline"
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
            Sign up with Google
          </Button>

          {/* Email Sign Up - Expandable */}
          <div className="space-y-4">
            <Button
              onClick={() => setShowEmailForm(!showEmailForm)}
              disabled={isLoading}
              className="w-full h-14 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-input rounded-lg font-medium text-base"
              variant="outline"
            >
              <Mail className="mr-3 h-5 w-5" />
              Sign up with Email
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${showEmailForm ? 'rotate-180' : ''}`} />
            </Button>

            {/* Email Form - Expandable */}
            <div className={`space-y-4 transition-all duration-300 ease-in-out overflow-hidden ${
              showEmailForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <form onSubmit={handleSignUp} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      className="pl-10 h-12 rounded-lg bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="pl-10 h-12 rounded-lg bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      required
                      minLength={6}
                      className="pl-10 pr-10 h-12 rounded-lg bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
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
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center text-muted-foreground mb-8">
          Already have an account?{" "}
          <Link to="/auth" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>

        {/* Terms */}
        <div className="text-center text-sm text-muted-foreground leading-relaxed">
          By continuing, you agree to Prelix's{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}