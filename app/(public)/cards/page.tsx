// app/(public)/cards/page.tsx

import Link from "next/link";
import { FiCheck, FiStar, FiShield, FiCreditCard, FiZap } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";

const CARD_TYPES = [
  {
    name: "Titan Bank Gold",
    tagline: "For everyday spending",
    benefits: [
      "Earn 3x points on dining and groceries",
      "No foreign transaction fees",
      "Airport lounge access",
    ],
    annualFee: "$95",
    apr: "19.49%",
  },
  {
    name: "Titan Bank Platinum",
    tagline: "Premium travel & perks",
    benefits: [
      "Earn 5x points on travel",
      "Complimentary hotel nights",
      "$200 annual travel credit",
    ],
    annualFee: "$550",
    apr: "17.24%",
  },
  {
    name: "Titan Bank Everyday",
    tagline: "No annual fee",
    benefits: [
      "Earn 2x points on everything",
      "No annual fee",
      "Intro bonus offer",
    ],
    annualFee: "$0",
    apr: "19.99%",
  },
];

export default function CardsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
              Credit Cards
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Choose the card that fits your lifestyle. Every card comes with exceptional benefits and service.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {CARD_TYPES.map((card) => (
              <Card key={card.name} className="flex flex-col h-full">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">{card.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{card.tagline}</p>
                  
                  <ul className="mt-6 space-y-2">
                    {card.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm">
                        <FiCheck className="text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Fee</span>
                    <span className="font-medium text-foreground">{card.annualFee}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">APR</span>
                    <span className="font-medium text-foreground">{card.apr}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Link href="/register" className="flex-1">
                    <Button size="sm" className="w-full">Apply Now</Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">Learn More</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-xl font-semibold text-foreground">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">Apply in minutes with our quick online application.</p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg">Apply for a Card</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}