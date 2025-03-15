"use client";

import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Tablet, Monitor, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function NewScreenshot() {
  const [url, setUrl] = useState("");
  const [device, setDevice] = useState("desktop");
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    if (!url) {
      toast.error("Please enter a URL 🔗");
      return;
    }
  
    setIsCapturing(true);
    try {
      // Get the user session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to capture a screenshot 🚀");
        setIsCapturing(false);
        return;
      }
  
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // Include token
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
      toast.error('Failed to capture screenshot 😔');
      console.error('Screenshot error:', error);
    } finally {
      setIsCapturing(false);
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8">New Screenshot 📸</h1>
        
        <Card className="p-8 max-w-2xl">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Website URL 🌐</h2>
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-lg"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Device Type 📱</h2>
              <Tabs defaultValue="desktop" className="w-full">
                <TabsList className="grid w-full grid-cols-3 gap-4">
                  <TabsTrigger value="desktop" onClick={() => setDevice("desktop")}>
                    <Monitor className="mr-2" /> Desktop
                  </TabsTrigger>
                  <TabsTrigger value="tablet" onClick={() => setDevice("tablet")}>
                    <Tablet className="mr-2" /> Tablet
                  </TabsTrigger>
                  <TabsTrigger value="mobile" onClick={() => setDevice("mobile")}>
                    <Smartphone className="mr-2" /> Mobile
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Button 
              size="lg" 
              className="w-full"
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
  );
}