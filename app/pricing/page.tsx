"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Camera, Zap, Globe, Shield, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = {
  free: [
    "100 Screenshots/month",
    "Basic resolution options",
    "Community support",
    "Standard quality",
    "Public websites only"
  ],
  pro: [
    "Unlimited screenshots",
    "All device sizes",
    "Priority support",
    "Custom CSS injection",
    "API access",
    "Premium quality",
    "Custom viewport sizes",
    "Bulk capture"
  ],
  enterprise: [
    "Custom volume",
    "API access",
    "24/7 phone support",
    "Custom features",
    "SLA guarantee",
    "Dedicated account manager",
    "Custom integration",
    "Training sessions"
  ]
};

export default function Pricing() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient">
              Simple, Transparent Pricing 💰
            </h1>
          </motion.div>
          <p className="text-xl text-muted-foreground mb-4">
            Start capturing for free, upgrade when you need more
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>30-day money-back guarantee</span>
          </div>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Card className="p-8 h-full backdrop-blur-sm bg-card/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Camera className="h-6 w-6" />
                <h3 className="text-2xl font-bold">Free</h3>
              </div>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-muted-foreground mb-6">Perfect for getting started</p>
              <Button 
                className="w-full mb-8" 
                variant="outline"
                onClick={() => !user && router.push('/signup')}
              >
                {user ? 'Current Plan' : 'Get Started Free'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <ul className="space-y-4">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <span className="z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <Card className="p-8 h-full border-primary bg-gradient-to-b from-primary/10 to-transparent backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="h-6 w-6" />
                <h3 className="text-2xl font-bold">Pro</h3>
              </div>
              <div className="text-4xl font-bold mb-2">$6</div>
              <p className="text-muted-foreground mb-6">Billed monthly</p>
              <Button 
                className="w-full mb-8 bg-primary hover:bg-primary/90"
                onClick={() => user ? router.push('/dashboard/billing') : router.push('/signup')}
              >
                {user ? 'Upgrade Now' : 'Get Pro'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <ul className="space-y-4">
                {features.pro.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Card className="p-8 h-full backdrop-blur-sm bg-card/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="h-6 w-6" />
                <h3 className="text-2xl font-bold">Enterprise</h3>
              </div>
              <div className="text-4xl font-bold mb-2">Custom</div>
              <p className="text-muted-foreground mb-6">For large organizations</p>
              <Button 
                className="w-full mb-8" 
                variant="outline"
              >
                Contact Sales
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <ul className="space-y-4">
                {features.enterprise.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Frequently Asked Questions 🤔</h2>
          <div className="grid gap-8 text-left">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade at any time?</h3>
              <p className="text-muted-foreground">Yes! You can upgrade, downgrade, or cancel your subscription at any time. Pro-rated refunds are available for unused time.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">We accept all major credit cards, including Visa, Mastercard, and American Express. Enterprise customers can also pay via invoice.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is there a long-term contract?</h3>
              <p className="text-muted-foreground">No! All plans are month-to-month with no long-term commitment required. You can cancel anytime.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}