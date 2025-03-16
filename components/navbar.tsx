"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Camera, Moon, Sun, LogOut, Globe, Sparkles, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home", icon: Globe },
  { href: "/pricing", label: "Pricing", icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: BarChart, protected: true }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully! 👋");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out 😔");
      console.error("Sign out error:", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg shadow-sm" 
          : "bg-background/50 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur group-hover:blur-md transition-all" />
              <Camera className="h-8 w-8 relative" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Web-Capture
            </span>
          </Link>
          
          <div className="flex items-center space-x-1 ml-6">
            {navItems.map((item) => {
              if (item.protected && !user) return null;
              
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                >
                  <Button
                    variant="ghost"
                    className={`relative ${
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary/10 rounded-md"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user ? (
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="group"
              >
                <LogOut className="h-5 w-5 mr-2 group-hover:text-red-500 transition-colors" />
                <span className="group-hover:text-red-500 transition-colors">Sign out</span>
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-primary/5">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 