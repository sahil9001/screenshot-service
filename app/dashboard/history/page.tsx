"use client";

import React from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Smartphone, Tablet, Monitor, Trash2, X, Search, Download, CheckCircle2, LayoutGrid, List, Filter, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Screenshot {
  id: string;
  url: string;
  device: string;
  imageUrl: string;
  created_at: string;
  storage_path: string;
}

type DeviceType = 'all' | 'desktop' | 'tablet' | 'mobile';

export default function History() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState<Screenshot[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('all');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) fetchScreenshots();
  }, [user]);

  useEffect(() => {
    let filtered = screenshots;

    // Apply device filter
    if (selectedDevice !== 'all') {
      filtered = filtered.filter(screenshot => screenshot.device === selectedDevice);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(screenshot =>
        screenshot.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredScreenshots(filtered);
  }, [searchQuery, screenshots, selectedDevice]);

  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;
    setUser(user);
  };

  const fetchScreenshots = async () => {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const screenshotsWithUrls = await Promise.all((data || []).map(async (screenshot) => {
        const { data: { publicUrl } } = supabase
          .storage
          .from('screenshots')
          .getPublicUrl(screenshot.storage_path);
        
        return { ...screenshot, imageUrl: publicUrl };
      }));

      setScreenshots(screenshotsWithUrls);
      setFilteredScreenshots(screenshotsWithUrls);
    } catch (error) {
      console.error('Error fetching screenshots:', error);
      toast.error('Failed to load screenshots 😔');
    } finally {
      setLoading(false);
    }
  };

  const deleteScreenshots = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const screenshot = screenshots.find(s => s.id === id);
        if (!screenshot) continue;

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
      }
      
      setScreenshots(screenshots.filter(s => !ids.includes(s.id)));
      setFilteredScreenshots(prev => prev.filter(s => !ids.includes(s.id)));
      setSelectedItems(new Set());
      toast.success(`${ids.length} screenshot${ids.length > 1 ? 's' : ''} deleted! 🗑️`);
    } catch (error) {
      console.error('Error deleting screenshots:', error);
      toast.error('Failed to delete screenshots 😔');
    }
  };

  const toggleSelection = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredScreenshots.length) {
      // If all are selected, deselect all
      setSelectedItems(new Set());
    } else {
      // Select all filtered screenshots
      setSelectedItems(new Set(filteredScreenshots.map(s => s.id)));
    }
  };

  const downloadSelectedAsZip = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select screenshots to download 📸');
      return;
    }

    setDownloadingZip(true);
    const zip = new JSZip();

    try {
      const selectedScreenshots = screenshots.filter(s => selectedItems.has(s.id));
      
      for (const screenshot of selectedScreenshots) {
        const response = await fetch(screenshot.imageUrl);
        const blob = await response.blob();
        const filename = `${format(new Date(screenshot.created_at), 'yyyy-MM-dd-HH-mm-ss')}-${screenshot.url.replace(/[^a-z0-9]/gi, '_')}.png`;
        zip.file(filename, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const zipFilename = `screenshots-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.zip`;
      saveAs(content, zipFilename);
      
      toast.success('Screenshots downloaded! 📥');
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error downloading screenshots:', error);
      toast.error('Failed to download screenshots 😔');
    } finally {
      setDownloadingZip(false);
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

  const renderGridView = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredScreenshots.map((screenshot) => (
        <motion.div
          key={screenshot.id}
          whileHover={{ scale: 1.02 }}
          className="group cursor-pointer relative"
          onClick={() => setSelectedScreenshot(screenshot)}
        >
          <Card className="overflow-hidden">
            <div className="aspect-video bg-muted relative group-hover:opacity-75 transition-opacity">
              <img 
                src={screenshot.imageUrl} 
                alt={screenshot.url}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute top-2 left-2 z-10"
                onClick={(e) => toggleSelection(screenshot.id, e)}
              >
                <Button
                  variant={selectedItems.has(screenshot.id) ? "default" : "secondary"}
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <CheckCircle2 className={`h-4 w-4 ${selectedItems.has(screenshot.id) ? 'text-white' : 'text-muted-foreground'}`} />
                </Button>
              </div>
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
                    deleteScreenshots([screenshot.id]);
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
  );

  const renderListView = () => (
    <Card className="overflow-hidden">
      <div className="divide-y">
        {filteredScreenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            className="p-4 flex items-center gap-4 hover:bg-muted/50 cursor-pointer"
            onClick={() => setSelectedScreenshot(screenshot)}
          >
            <div 
              onClick={(e) => toggleSelection(screenshot.id, e)}
              className="flex-shrink-0"
            >
              <Button
                variant={selectedItems.has(screenshot.id) ? "default" : "secondary"}
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <CheckCircle2 className={`h-4 w-4 ${selectedItems.has(screenshot.id) ? 'text-white' : 'text-muted-foreground'}`} />
              </Button>
            </div>
            <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={screenshot.imageUrl} 
                alt={screenshot.url}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-medium truncate">{screenshot.url}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(screenshot.created_at), 'PPp')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getDeviceIcon(screenshot.device)}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteScreenshots([screenshot.id]);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-4xl font-bold mb-4 md:mb-0">Screenshot History 📚</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="flex gap-2 flex-grow md:w-96">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search screenshots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as DeviceType)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center">
                      All Devices
                    </span>
                  </SelectItem>
                  <SelectItem value="desktop">
                    <span className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" /> Desktop
                    </span>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <span className="flex items-center">
                      <Tablet className="h-4 w-4 mr-2" /> Tablet
                    </span>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <span className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" /> Mobile
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
              {selectedItems.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={toggleSelectAll}
                    className="whitespace-nowrap"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    {selectedItems.size === filteredScreenshots.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={downloadSelectedAsZip}
                    disabled={downloadingZip}
                    className="whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloadingZip ? 'Preparing... 📦' : `Download ${selectedItems.size} Selected 📦`}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteScreenshots(Array.from(selectedItems))}
                    className="whitespace-nowrap"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading screenshots... 🔄</div>
        ) : filteredScreenshots.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {screenshots.length === 0 ? "No screenshots yet 📸" : "No matching screenshots found 🔍"}
            </p>
          </Card>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}

        <AnimatePresence>
          {selectedScreenshot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sticky inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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