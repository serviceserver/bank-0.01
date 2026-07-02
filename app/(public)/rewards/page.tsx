// app/(public)/rewards/page.tsx

import Link from "next/link";
import { FiStar, FiGift, FiGlobe, FiAward } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
              Premium Rewards
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
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

      <section className="border-t border-border bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FiStar className="text-2xl text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Premium rewards on every purchase</h2>
          <p className="mt-2 text-muted-foreground">
            The more you spend, the more you earn. Points never expire.
          </p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg">Apply Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}