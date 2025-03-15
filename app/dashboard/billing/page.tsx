"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Download, BarChart, Zap, Check } from "lucide-react";
import { toast } from "sonner";
import { createCheckout } from "@/lib/lemonsqueezy";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

interface Subscription {
  status: string;
  current_period_end: string;
  plan_id: string;
}

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success('Successfully subscribed to Pro plan! 🎉');
    }
    if (searchParams.get('canceled')) {
      toast.error('Payment canceled 😔');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserAndSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        setSubscription(subscriptionData);
      }
    };

    fetchUserAndSubscription();
  }, []);

  const handleUpgrade = async (variantId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      await createCheckout(variantId, user.id);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start upgrade process 😔');
    } finally {
      setLoading(false);
    }
  };

  const isPro = subscription?.status === 'active';
  const screenshotsLimit = isPro ? 'Unlimited' : '100';
  const screenshotsUsed = 76; // This should come from your database
  const usagePercentage = isPro ? 0 : (screenshotsUsed / 100) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8">Billing & Usage 💳</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Plan 📊</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{isPro ? 'Pro Plan 🚀' : 'Free Plan'}</span>
                {!isPro && (
                  <div className="space-x-2">
                    <Button 
                      onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_MONTHLY!)} 
                      disabled={loading}
                    >
                      Monthly $9
                    </Button>
                    <Button 
                      onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_YEARLY!)} 
                      disabled={loading}
                      variant="outline"
                    >
                      Yearly $90
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{screenshotsUsed}/{screenshotsLimit} screenshots used</span>
                  {!isPro && <span>{usagePercentage}%</span>}
                </div>
                {!isPro && <Progress value={usagePercentage} />}
              </div>
              {isPro && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Your subscription renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Plan Features ✨</h2>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{isPro ? 'Unlimited' : '100'} screenshots per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Multiple device sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Full page screenshots</span>
                </div>
                {isPro && (
                  <>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>API access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Custom CSS injection</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Screenshots</p>
                <p className="text-2xl font-bold">76</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">{isPro ? '∞' : '24'}</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}