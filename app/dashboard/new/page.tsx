"use client";

import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Tablet, Monitor, Camera, Settings2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CustomSize {
  width: number;
  height: number;
}

const PRESET_SIZES = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

export default function NewScreenshot() {
  const [url, setUrl] = useState("");
  const [device, setDevice] = useState("desktop");
  const [isCapturing, setIsCapturing] = useState(false);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [customSize, setCustomSize] = useState<CustomSize>({ width: 1920, height: 1080 });
  const [followRedirects, setFollowRedirects] = useState(true);

  const captureScreenshot = async () => {
    if (!url) {
      toast.error("Please enter a URL 🔗");
      return;
    }
  
    setIsCapturing(true);
    try {
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
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          url,
          device: useCustomSize ? 'custom' : device,
          width: useCustomSize ? customSize.width : PRESET_SIZES[device as keyof typeof PRESET_SIZES].width,
          height: useCustomSize ? customSize.height : PRESET_SIZES[device as keyof typeof PRESET_SIZES].height,
          followRedirects,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to capture screenshot');
      }
  
      toast.success('Screenshot captured successfully! 🎉');
    } catch (error: any) {
      toast.error('Failed to capture screenshot: ' + error.message);
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">New Screenshot 📸</h1>
          
          <Card className="overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <Label className="text-lg font-semibold mb-2">Website URL 🌐</Label>
                <div className="mt-2">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2">Device & Size 📱</Label>
                <div className="mt-2">
                  <Tabs defaultValue={useCustomSize ? "custom" : device} className="w-full">
                    <TabsList className="grid grid-cols-4 gap-4 h-full">
                      <TabsTrigger 
                        value="desktop" 
                        onClick={() => { setDevice("desktop"); setUseCustomSize(false); }}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Monitor className="mr-2 h-5 w-5" />
                        <div>
                          <div>Desktop</div>
                          <div className="text-xs text-muted-foreground">1920×1080</div>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tablet" 
                        onClick={() => { setDevice("tablet"); setUseCustomSize(false); }}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Tablet className="mr-2 h-5 w-5" />
                        <div>
                          <div>Tablet</div>
                          <div className="text-xs text-muted-foreground">768×1024</div>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="mobile" 
                        onClick={() => { setDevice("mobile"); setUseCustomSize(false); }}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Smartphone className="mr-2 h-5 w-5" />
                        <div>
                          <div>Mobile</div>
                          <div className="text-xs text-muted-foreground">375×667</div>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="custom" 
                        onClick={() => setUseCustomSize(true)}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Settings2 className="mr-2 h-5 w-5" />
                        <div>
                          <div>Custom</div>
                          <div className="text-xs text-muted-foreground">Any size</div>
                        </div>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="custom" className="mt-4">
                      <Card className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label>Width (px)</Label>
                            <Input
                              type="number"
                              value={customSize.width}
                              onChange={(e) => setCustomSize({ ...customSize, width: parseInt(e.target.value) || 0 })}
                              min="1"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-center pt-6">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <Label>Height (px)</Label>
                            <Input
                              type="number"
                              value={customSize.height}
                              onChange={(e) => setCustomSize({ ...customSize, height: parseInt(e.target.value) || 0 })}
                              min="1"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="follow-redirects"
                    checked={followRedirects}
                    onCheckedChange={setFollowRedirects}
                  />
                  <Label htmlFor="follow-redirects" className="text-sm">Follow redirects</Label>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300"
                onClick={captureScreenshot}
                disabled={isCapturing}
              >
                <Camera className="mr-2 h-5 w-5" />
                {isCapturing ? 'Capturing... 📸' : 'Capture Screenshot 📸'}
              </Button>
            </div>
          </Card>

          <div className="mt-8">
            <Card className="p-6 bg-muted/50">
              <h3 className="text-sm font-medium mb-2">Pro Tips 💡</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Use custom size for exact dimensions</li>
                <li>• Toggle "Follow redirects" for landing pages</li>
                <li>• Supports secure HTTPS websites</li>
              </ul>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}