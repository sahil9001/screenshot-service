"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings2, Bell, Shield, Download } from "lucide-react";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save settings logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully! ⚙️');
    } catch (error) {
      toast.error('Failed to save settings 😔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8">Settings ⚙️</h1>

        <div className="space-y-6 max-w-2xl">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Settings2 className="h-6 w-6" />
              <h2 className="text-xl font-semibold">General Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Default Device</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred device type</p>
                </div>
                <select className="bg-background border rounded-md p-2">
                  <option value="desktop">Desktop 🖥️</option>
                  <option value="tablet">Tablet 📱</option>
                  <option value="mobile">Mobile 📱</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Bell className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about your screenshots</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Download className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Downloads</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Download</Label>
                  <p className="text-sm text-muted-foreground">Automatically download screenshots after capture</p>
                </div>
                <Switch
                  checked={autoDownload}
                  onCheckedChange={setAutoDownload}
                />
              </div>
            </div>
          </Card>

          <Button 
            className="w-full" 
            onClick={saveSettings}
            disabled={loading}
          >
            {loading ? 'Saving... ⚙️' : 'Save Settings ⚙️'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}