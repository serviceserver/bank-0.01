// app/(public)/rewards/page.tsx

import Link from "next/link";
import { FiStar, FiGift, FiGlobe, FiAward } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

const REWARDS = [
  {
    name: "Travel Benefits",
    description: "Redeem points for flights, hotels, and vacation packages.",
    icon: FiGlobe,
  },
  {
    name: "Shopping Rewards",
    description: "Shop with points at millions of retailers.",
    icon: FiGift,
  },
  {
    name: "Cash Back",
    description: "Flexible redemption for statement credits or direct deposit.",
    icon: FiAward,
  },
];

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <section className="flex-1 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
              Premium Rewards
            </h1>
            <p className="mt-3 text-foreground max-w-2xl mx-auto">
              Earn points on every purchase and redeem for travel, shopping, or cash back.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {REWARDS.map((reward) => (
              <Card key={reward.name} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <reward.icon className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{reward.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{reward.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}