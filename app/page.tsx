"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Smartphone, Tablet, Monitor, Sparkles, Zap, Globe, Code, Shield, Rocket, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const features = [
  {
    icon: Globe,
    title: "Any Website 🌐",
    description: "Capture screenshots from any public website with ease"
  },
  {
    icon: Zap,
    title: "Lightning Fast ⚡",
    description: "Get your screenshots in milliseconds, not minutes"
  },
  {
    icon: Code,
    title: "API Access 🔧",
    description: "Integrate screenshots into your workflow with our API"
  },
  {
    icon: Shield,
    title: "Secure & Private 🔒",
    description: "Your data is encrypted and protected at all times"
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Designer",
    content: "Web-Capture has revolutionized our design workflow. The quality is outstanding! 🎨",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
  },
  {
    name: "Michael Chen",
    role: "Developer",
    content: "The API is a game-changer for our automated testing pipeline. Love it! 💻",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
  },
  {
    name: "Emily Davis",
    role: "Marketing Lead",
    content: "Perfect for capturing our campaign results across different devices! 📱",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
  }
];

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
      toast.error('Failed to capture screenshot.');
      console.error('Screenshot error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Camera className="h-12 w-12" />
                <h1 className="text-6xl font-bold">Web-Capture</h1>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient">
                Capture the Web in Style ✨
              </h2>
            </motion.div>
            <p className="text-xl text-muted-foreground mb-12">
              Professional screenshots of any website, in any size, in seconds 📸
            </p>

            <Card className="p-8 max-w-2xl mx-auto backdrop-blur-sm bg-background/95 border-2">
              <div className="space-y-6">
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="Enter any website URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-12 h-14 text-lg"
                  />
                </div>

                <Tabs defaultValue="desktop" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 gap-4">
                    <TabsTrigger value="desktop" onClick={() => setDevice("desktop")} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Monitor className="mr-2" /> Desktop
                    </TabsTrigger>
                    <TabsTrigger value="tablet" onClick={() => setDevice("tablet")} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Tablet className="mr-2" /> Tablet
                    </TabsTrigger>
                    <TabsTrigger value="mobile" onClick={() => setDevice("mobile")} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Smartphone className="mr-2" /> Mobile
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
                  onClick={captureScreenshot}
                  disabled={isCapturing}
                >
                  <Camera className="mr-2" />
                  {isCapturing ? 'Capturing... 📸' : 'Capture Screenshot 📸'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose Web-Capture? 🚀</h2>
            <p className="text-xl text-muted-foreground">Powerful features for your screenshot needs</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-card border-2 hover:border-primary transition-all duration-300"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Loved by Professionals 💝</h2>
            <p className="text-xl text-muted-foreground">See what our users have to say</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-card border"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Simple Pricing 💰</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you need more</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-xl bg-card border-2 hover:border-primary transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-2">Free 🎁</h3>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>10 Screenshots/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Basic Features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Community Support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => !user && router.push('/signup')}>
                {user ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-xl bg-primary text-primary-foreground border-2 border-primary relative"
            >
              <div className="absolute top-0 right-0 bg-primary-foreground text-primary px-4 py-1 rounded-bl-lg rounded-tr-xl text-sm font-medium">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro 🚀</h3>
              <div className="text-4xl font-bold mb-6">$6</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Unlimited Screenshots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Advanced Features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Priority Support</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => user ? router.push('/dashboard/billing') : router.push('/signup')}
              >
                {user ? 'Upgrade Now' : 'Get Pro'}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-xl bg-card border-2 hover:border-primary transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-2">Enterprise 🏢</h3>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Custom Volume</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>API Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>24/7 Support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Start Capturing? 🚀</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who trust Web-Capture for their screenshot needs
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              onClick={() => router.push('/signup')}
            >
              Get Started Now <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}