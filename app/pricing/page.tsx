"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing 💰</h1>
          <p className="text-xl text-muted-foreground">Choose the plan that works best for you</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-card p-8"
          >
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-muted-foreground mb-4">Perfect for getting started</p>
            <div className="text-4xl font-bold mb-6">$0</div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center"><Check className="h-5 w-5 mr-2 text-green-500" /> 100 Screenshots/month</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-2 text-green-500" /> Basic resolution options</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-2 text-green-500" /> Community support</li>
            </ul>
            <Button className="w-full" variant="outline">Get Started Free</Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-gradient-to-b from-purple-600 to-pink-600 p-8 text-white"
          >
            <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-sm">Popular</div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-white/80 mb-4">For professionals and small teams</p>
            <div className="text-4xl font-bold mb-6">$6<span className="text-lg font-normal">/month</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center"><Check className="h-5 w-5 mr-2" /> Unlimited screenshots</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-2" /> All device sizes</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-2" /> Priority support</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-2" /> Custom CSS injection</li>
            </ul>
            <Button className="w-full bg-white text-purple-600 hover:bg-white/90">Subscribe Now</Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-card p-8"
          >
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <p className="text-muted-foreground mb-4">For large organizations</p>
            <div className="text-4xl font-bold mb-6">Custom</div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center"><Check className="h-5 w-5 mr-2 text-green-500" /> Custom volume</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-2 text-green-500" /> API access</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-2 text-green-500" /> 24/7 phone support</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-2 text-green-500" /> Custom features</li>
            </ul>
            <Button className="w-full" variant="outline">Contact Sales</Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}