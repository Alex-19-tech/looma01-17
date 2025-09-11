import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Pricing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    // Check if user is authenticated first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to Pro Access.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    toast({
      title: "Payment Integration Removed",
      description: "Payment integration has been completely removed. Please implement a new payment method.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img 
            src="/Looma.svg" 
            alt="Prelix" 
            className="h-12 w-12" 
          />
          <span className="text-white font-semibold text-lg">Prelix</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-white/70 mb-4">
            The most powerful AI optimization platform
          </p>
        </div>

        {/* Free Tier */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white/80 mb-2">Basic</h2>
            <h3 className="text-6xl font-bold mb-4">Free</h3>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              Current Plan
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              "Limited daily prompts",
              "Basic optimization",
              "Single model access",
              "Standard response time",
              "Community support",
              "Basic dashboard"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/70">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Access Tier */}
        <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 relative overflow-hidden mb-16">
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary text-primary-foreground">
              Popular
            </Badge>
          </div>
          
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-white mb-4">Pro Access</CardTitle>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl font-bold text-white">$10.00</span>
              <span className="text-xl text-white/60">/month</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button 
              onClick={handleSubscribe}
              disabled={isProcessing || loading}
              className="w-full bg-white text-black hover:bg-white/90 text-lg py-6 rounded-xl"
            >
              {isProcessing ? 'Processing...' : !user ? 'Sign In to Subscribe' : 'Start Pro Access'}
            </Button>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Unlimited optimized prompts",
                "Multi-model support (Grok, Claude, OpenAI, Lovable.dev)",
                "Credit/usage dashboard",
                "Auto prompt optimization",
                "Research prompt types",
                "Creative prompt types",
                "Instructional prompt types",
                "Analytical prompt types",
                "Problem-solving prompt types",
                "Priority support"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Future Tiers */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Team Tier */}
          <Card className="bg-white/5 border-white/10 opacity-60">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white mb-2">Team</CardTitle>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-white">$75.00</span>
                <span className="text-lg text-white/60">/month per user</span>
              </div>
              <Badge variant="outline" className="border-white/20 text-white/60 mt-2">
                Coming Soon
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Shared chat history",
                  "Team dashboard & analytics", 
                  "Admin controls",
                  "Collaboration tools",
                  "Everything in Pro Access"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/60">
                    <Check className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Tier */}
          <Card className="bg-white/5 border-white/10 opacity-60">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white mb-2">Enterprise</CardTitle>
              <div className="text-2xl font-bold text-white mb-2">Custom pricing</div>
              <Badge variant="outline" className="border-white/20 text-white/60">
                Coming Soon
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Advanced integrations (Notion, Canva, Figma)",
                  "Enterprise analytics dashboard",
                  "Dedicated onboarding & support",
                  "Custom model training",
                  "Everything in Team"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/60">
                    <Check className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-semibold mb-3 text-white">
                Do I need prompt engineering skills?
              </h3>
              <p className="text-white/70">
                No, Prelix handles all the prompt optimization for you. Simply type your request naturally, 
                and our AI will automatically optimize it for the best results across different models.
              </p>
            </div>

            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-semibold mb-3 text-white">
                Which AI models does this work with?
              </h3>
              <p className="text-white/70">
                Prelix works with Grok, Claude, OpenAI (GPT-4, ChatGPT), Lovable.dev, and more. 
                We continuously add support for new models to give you the best AI experience.
              </p>
            </div>

            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-semibold mb-3 text-white">
                What if I cancel?
              </h3>
              <p className="text-white/70">
                Your Pro Access will remain active until the end of your current billing cycle. 
                You can cancel anytime with no penalties or hidden fees.
              </p>
            </div>

            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-semibold mb-3 text-white">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-white/70">
                Yes, you can change your plan at any time. Upgrades take effect immediately, 
                while downgrades will take effect at the start of your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;