"use client";

import React from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Smartphone, Tablet, Monitor, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function History() {
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<any>(null);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get signed URLs for each screenshot
      const screenshotsWithUrls = await Promise.all((data || []).map(async (screenshot) => {
        const { data: { publicUrl } } = supabase
          .storage
          .from('screenshots')
          .getPublicUrl(screenshot.storage_path);
        
        return { ...screenshot, imageUrl: publicUrl };
      }));

      setScreenshots(screenshotsWithUrls);
    } catch (error) {
      console.error('Error fetching screenshots:', error);
      toast.error('Failed to load screenshots 😔');
    } finally {
      setLoading(false);
    }
  };

  const deleteScreenshot = async (id: string) => {
    try {
      const screenshot = screenshots.find(s => s.id === id);
      if (!screenshot) return;

      // Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from('screenshots')
        .remove([screenshot.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('screenshots')
        .delete()
        .match({ id });

      if (dbError) throw dbError;
      
      setScreenshots(screenshots.filter(s => s.id !== id));
      toast.success('Screenshot deleted! 🗑️');
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      toast.error('Failed to delete screenshot 😔');
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8">Screenshot History 📚</h1>

        {loading ? (
          <div className="text-center py-8">Loading screenshots... 🔄</div>
        ) : screenshots.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No screenshots yet 📸</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.map((screenshot) => (
              <motion.div
                key={screenshot.id}
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => setSelectedScreenshot(screenshot)}
              >
                <Card className="overflow-hidden">
                  <div className="aspect-video bg-muted relative group-hover:opacity-75 transition-opacity">
                    <img 
                      src={screenshot.imageUrl} 
                      alt={screenshot.url}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium truncate">{screenshot.url}</h3>
                      {getDeviceIcon(screenshot.device)}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(screenshot.created_at), 'PPp')}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScreenshot(screenshot.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedScreenshot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedScreenshot(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-5xl w-full bg-card rounded-lg shadow-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedScreenshot(null)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="aspect-video overflow-auto">
                  <img 
                    src={selectedScreenshot.imageUrl} 
                    alt={selectedScreenshot.url}
                    className="w-full object-contain"
                  />
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedScreenshot.url}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedScreenshot.created_at), 'PPp')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(selectedScreenshot.device)}
                      <span className="text-sm capitalize">{selectedScreenshot.device}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}