import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PaystackCheckout } from "@/components/PaystackCheckout";

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

        {/* Pricing Cards - Professional Layout */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-16 max-w-7xl mx-auto">
          {/* Free Tier */}
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="text-center pt-12 pb-6">
              <CardTitle className="text-2xl text-white mb-4">Free</CardTitle>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-lg text-white/60">/month</span>
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                Current Plan
              </Badge>
              <p className="text-white/60 text-sm mt-2">Get started for free</p>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-3 mb-6">
                {[
                  "Limited daily prompts",
                  "Basic optimization", 
                  "Single model access",
                  "Standard response time",
                  "Community support",
                  "Basic dashboard"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/60">
                    <Check className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button disabled className="w-full bg-white/10 text-white/60 py-3 rounded-xl">
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Access Tier - Featured */}
          <div className="relative">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/30 relative overflow-hidden h-full transform scale-105 shadow-2xl">
              <div className="absolute top-6 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 text-sm font-semibold">
                  Most Popular
                </Badge>
              </div>
              
              <CardHeader className="text-center pt-16 pb-8">
                <CardTitle className="text-3xl font-bold text-white mb-4">Pro Access</CardTitle>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">$10</span>
                  <span className="text-xl text-white/60">/month</span>
                </div>
                <p className="text-white/60 text-xs mb-2">Billed in Kenyan Shillings (KES) at current rate</p>
                <p className="text-white/70 text-sm">Perfect for professionals</p>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-white/90 text-sm text-center">
                    You will be charged <strong>KES 1,292.02</strong> (≈$10) via Paystack
                  </p>
                </div>
                
                <PaystackCheckout
                  plan="pro"
                  amount={10}
                  description={!user ? 'Sign In to Subscribe' : 'Get Pro Access'}
                  className="w-full bg-white text-black hover:bg-white/90 text-lg py-4 rounded-xl font-semibold shadow-lg mb-8"
                  disabled={!user || loading}
                />

                <div className="space-y-4">
                  {[
                    "Unlimited optimized prompts",
                    "Multi-model support (Grok, Claude, OpenAI, Lovable.dev)",
                    "Credit/usage dashboard",
                    "Auto prompt optimization",
                    "Research & creative prompt types",
                    "Advanced analytical features",
                    "Priority support"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-white text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Tier */}
          <Card className="bg-white/5 border-white/10 opacity-75 hover:opacity-90 transition-opacity h-full">
            <CardHeader className="text-center pt-12 pb-6">
              <CardTitle className="text-2xl text-white mb-4">Team</CardTitle>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-white">$75</span>
                <span className="text-lg text-white/60">/month per user</span>
              </div>
              <Badge variant="outline" className="border-white/20 text-white/60 bg-white/5">
                Coming Soon
              </Badge>
              <p className="text-white/60 text-sm mt-2">For growing teams</p>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-3 mb-6">
                {[
                  "Everything in Pro Access",
                  "Shared chat history",
                  "Team dashboard & analytics", 
                  "Admin controls",
                  "Collaboration tools"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/60">
                    <Check className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button disabled className="w-full bg-white/10 text-white/60 py-3 rounded-xl">
                Notify Me
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Tier */}
          <Card className="bg-white/5 border-white/10 opacity-75 hover:opacity-90 transition-opacity h-full lg:col-start-3 lg:row-start-1">
            <CardHeader className="text-center pt-12 pb-6">
              <CardTitle className="text-2xl text-white mb-4">Enterprise</CardTitle>
              <div className="text-2xl font-bold text-white mb-2">Custom</div>
              <Badge variant="outline" className="border-white/20 text-white/60 bg-white/5">
                Coming Soon
              </Badge>
              <p className="text-white/60 text-sm mt-2">For large organizations</p>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-3 mb-6">
                {[
                  "Everything in Team",
                  "Advanced integrations (Notion, Canva, Figma)",
                  "Enterprise analytics dashboard",
                  "Dedicated onboarding & support",
                  "Custom model training"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/60">
                    <Check className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button disabled className="w-full bg-white/10 text-white/60 py-3 rounded-xl">
                Contact Sales
              </Button>
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