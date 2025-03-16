"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Download, BarChart, Zap, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Payment from "@/components/payment";

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Successfully subscribed to Pro plan! 🎉");
    }
    if (searchParams.get("canceled")) {
      toast.error("Payment canceled 😔");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserAndSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setUser(session.user);
      
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      setSubscription(subscriptionData);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      setProfile(profileData);
    };

    fetchUserAndSubscription();
  }, []);

  const isPro = subscription?.status === "active";
  const screenshotsLimit = isPro ? "Unlimited" : "10";
  const screenshotsUsed = profile?.total_screenshots || 0;
  const usagePercentage = isPro ? 0 : (screenshotsUsed / 10) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-8">Billing & Usage 💳</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Plan 📊</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{isPro ? "Pro Plan 🚀" : "Free Plan"}</span>
                {!isPro && <Payment />}
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{screenshotsUsed}/{screenshotsLimit} screenshots used</span>
                  {!isPro && <span>{usagePercentage}%</span>}
                </div>
                {!isPro && <Progress value={usagePercentage} />}
              </div>
              {isPro && subscription?.next_billed_at && (
                <p className="text-sm text-muted-foreground">
                  Next billing date: {new Date(subscription.next_billed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Plan Features ✨</h2>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /><span>{isPro ? "Unlimited" : "10"} screenshots per month</span></div>
                <div className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /><span>Multiple device sizes</span></div>
                <div className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /><span>Full page screenshots</span></div>
                {isPro && (
                  <>
                    <div className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /><span>Priority support</span></div>
                    <div className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /><span>API access</span></div>
                    <div className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /><span>Custom CSS injection</span></div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 flex items-center space-x-4">
            <Download className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Screenshots</p>
              <p className="text-2xl font-bold">{screenshotsUsed}</p>
            </div>
          </Card>
            
          <Card className="p-6 flex items-center space-x-4">
            <Zap className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold">{isPro ? "∞" : Math.max(10 - screenshotsUsed, 0)}</p>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
