"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Shield className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>

          <Card className="p-8">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                  <p className="text-muted-foreground">
                    Welcome to Web-Capture ("we," "our," or "us"). By accessing or using our website and services, you agree to these Terms of Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Services</h2>
                  <p className="text-muted-foreground">
                    Web-Capture provides screenshot capture services for websites. Our services include capturing, storing, and managing screenshots according to your subscription plan.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                  <p className="text-muted-foreground">
                    You must create an account to use our services. You are responsible for maintaining the security of your account and any activities that occur under it.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Privacy Policy</h2>
                  <p className="text-muted-foreground">
                    Our Privacy Policy describes how we handle your personal information. By using our services, you agree to our privacy practices.
                  </p>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-medium">4.1 Data Collection</h3>
                    <p className="text-muted-foreground">
                      We collect information necessary to provide our services, including but not limited to email addresses, usage data, and captured screenshots.
                    </p>
                    <h3 className="text-lg font-medium">4.2 Data Usage</h3>
                    <p className="text-muted-foreground">
                      We use collected data to provide and improve our services, communicate with users, and ensure security.
                    </p>
                    <h3 className="text-lg font-medium">4.3 Data Protection</h3>
                    <p className="text-muted-foreground">
                      We implement security measures to protect your data and comply with applicable data protection laws.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Refund Policy</h2>
                  <p className="text-muted-foreground">
                    We offer a 30-day money-back guarantee for our Pro plan. If you're not satisfied with our services, you can request a refund within 30 days of your initial purchase.
                  </p>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-medium">5.1 Eligibility</h3>
                    <p className="text-muted-foreground">
                      Refunds are available for first-time purchases only. Renewal payments are not eligible for refunds.
                    </p>
                    <h3 className="text-lg font-medium">5.2 Process</h3>
                    <p className="text-muted-foreground">
                      To request a refund, contact our support team with your account details and reason for the refund.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
                  <p className="text-muted-foreground">
                    You agree not to misuse our services or help anyone else do so. You must comply with all applicable laws and regulations.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Modifications</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time. We will notify users of significant changes via email.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
                  <p className="text-muted-foreground">
                    For questions about these terms, please contact us at support@web-capture.com
                  </p>
                </section>
              </div>
            </ScrollArea>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}