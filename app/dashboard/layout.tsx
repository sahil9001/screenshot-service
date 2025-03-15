"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Camera, History, CreditCard, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";

const tabs = [
  { name: "New Screenshot", href: "/dashboard/new", icon: Camera },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4">
        <Card className="my-8 p-4 overflow-x-auto">
          <nav className="flex space-x-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              
              return (
                <motion.button
                  key={tab.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(tab.href)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </Card>
        {children}
      </div>
    </div>
  );
}