"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Camera, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Camera className="h-6 w-6" />
            <span className="font-bold">ScreenshotPro</span>
          </Link>
          
          <div className="flex items-center space-x-6 ml-6">
            <Link 
              href="/"
              className={`text-sm ${pathname === "/" ? "text-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground`}
            >
              Home
            </Link>
            <Link 
              href="/pricing"
              className={`text-sm ${pathname === "/pricing" ? "text-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground`}
            >
              Pricing
            </Link>
            {user && (
              <Link 
                href="/dashboard"
                className={`text-sm ${pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user ? (
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}