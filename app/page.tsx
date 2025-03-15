"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Smartphone, Tablet, Monitor, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [url, setUrl] = useState("");
  const [device, setDevice] = useState("desktop");
  const [isCapturing, setIsCapturing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const captureScreenshot = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    if (!user) {
      toast.error("Please log in to capture screenshots 🔒");
      router.push("/login");
      return;
    }

    setIsCapturing(true);
    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          device,
          followRedirects: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to capture screenshot');
      }

      toast.success('Screenshot captured successfully! 🎉');
    } catch (error) {
      toast.error('Failed to capture screenshot. Please try again. 😔');
      console.error('Screenshot error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block animate-float"
          >
            <h1 className="text-6xl font-bold mb-4">
              Capture the Web ✨
            </h1>
          </motion.div>
          <p className="text-xl text-muted-foreground mb-8">
            Generate beautiful screenshots of any website in seconds 📸
          </p>

          <Card className="p-6 max-w-2xl mx-auto border-2 hover:border-primary transition-all duration-300">
            <div className="space-y-4">
              <Input
                type="url"
                placeholder="Enter website URL... (e.g., https://example.com) 🌐"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-lg p-6"
              />

              <Tabs defaultValue="desktop" className="w-full">
                <TabsList className="grid w-full grid-cols-3 gap-4">
                  <TabsTrigger value="desktop" onClick={() => setDevice("desktop")}>
                    <Monitor className="mr-2" /> Desktop 🖥️
                  </TabsTrigger>
                  <TabsTrigger value="tablet" onClick={() => setDevice("tablet")}>
                    <Tablet className="mr-2" /> Tablet 📱
                  </TabsTrigger>
                  <TabsTrigger value="mobile" onClick={() => setDevice("mobile")}>
                    <Smartphone className="mr-2" /> Mobile 📱
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button 
                size="lg" 
                className="w-full hover:scale-105 transition-transform"
                onClick={captureScreenshot}
                disabled={isCapturing}
              >
                <Camera className="mr-2" />
                {isCapturing ? 'Capturing... 📸' : 'Capture Screenshot 📸'}
              </Button>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="p-6 rounded-xl bg-card border-2 hover:border-primary transition-all duration-300"
            >
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                <Zap className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast ⚡</h3>
              <p className="text-muted-foreground">Screenshots in milliseconds</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="p-6 rounded-xl bg-card border-2 hover:border-primary transition-all duration-300"
            >
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">High Quality 🎨</h3>
              <p className="text-muted-foreground">Crystal clear every time</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="p-6 rounded-xl bg-card border-2 hover:border-primary transition-all duration-300"
            >
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                <Monitor className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Device 📱</h3>
              <p className="text-muted-foreground">Any screen size</p>
            </motion.div>
          </div>

          <div className="mt-20 mb-20">
            <h2 className="text-4xl font-bold mb-12">Simple Pricing 💰</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -1 }}
                className="p-8 rounded-xl bg-card border-2 hover:border-primary transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-4">Free 🎁</h3>
                <div className="text-4xl font-bold mb-6">$0</div>
                <ul className="space-y-4 mb-8 text-left">
                  <li>✨ 100 Screenshots</li>
                  <li>🎯 Basic Features</li>
                  <li>🤝 Standard Support</li>
                </ul>
                <Button variant="outline" className="w-full hover:scale-105 transition-transform" onClick={() => !user && router.push('/signup')}>
                  {user ? 'Current Plan' : 'Get Started'}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="p-8 rounded-xl bg-primary text-primary-foreground border-2 border-primary"
              >
                <h3 className="text-2xl font-bold mb-4">Pro 🚀</h3>
                <div className="text-4xl font-bold mb-6">$6</div>
                <ul className="space-y-4 mb-8 text-left">
                  <li>✨ Unlimited Screenshots</li>
                  <li>🎯 Advanced Features</li>
                  <li>🤝 Priority Support</li>
                </ul>
                <Button 
                  className="w-full bg-background text-foreground hover:bg-secondary hover:scale-105 transition-transform"
                  onClick={() => user ? router.push('/dashboard/billing') : router.push('/signup')}
                >
                  {user ? 'Upgrade Now' : 'Subscribe Now'}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, rotate: -1 }}
                className="p-8 rounded-xl bg-card border-2 hover:border-primary transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-4">Enterprise 🏢</h3>
                <div className="text-4xl font-bold mb-6">Custom</div>
                <ul className="space-y-4 mb-8 text-left">
                  <li>✨ Custom Volume</li>
                  <li>🎯 API Access</li>
                  <li>🤝 Dedicated Support</li>
                </ul>
                <Button variant="outline" className="w-full hover:scale-105 transition-transform">Contact Sales</Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}