"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { signUpAndCreateProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match! 🔑");
      return;
    }

    setLoading(true);

    try {
      await signUpAndCreateProfile(email, password);
      toast.success(
        <div className="flex flex-col gap-2">
          <div>Account created successfully! 🎉</div>
          <div className="text-sm text-muted-foreground">
            Please check your email to confirm your account.
          </div>
        </div>
      );
      setShowResend(true);
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Email already registered. Please log in instead.</span>
          </div>
        );
        router.push("/login");
      } else {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to create account 😔</span>
          </div>
        );
      }
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setCountdown(60); // Start 1-minute countdown
      toast.success(
        <div className="flex flex-col gap-2">
          <div>Confirmation email resent! 📧</div>
          <div className="text-sm text-muted-foreground">
            Please check your inbox and spam folder.
          </div>
        </div>
      );
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to resend confirmation email 😔</span>
        </div>
      );
      console.error("Resend error:", error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-4"
      >
        <Card className="p-8 backdrop-blur-lg bg-card">
          <h1 className="text-3xl font-bold text-center mb-8">Create Account ✨</h1>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || showResend}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || showResend}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || showResend}
              />
            </div>
            {!showResend ? (
              <Button 
                className="w-full" 
                type="submit" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  Check your email to confirm your account. 
                  Didn't receive the email?
                </div>
                <Button
                  className="w-full"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || countdown > 0}
                  variant="outline"
                >
                  {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {resendLoading ? "Resending..." : 
                   countdown > 0 ? `Resend available in ${countdown}s` : 
                   "Resend Confirmation Email"}
                </Button>
              </div>
            )}
          </form>
          <p className="text-center mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}