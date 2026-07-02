// app/(public)/banking/page.tsx

import Link from "next/link";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

const ACCOUNT_TYPES = [
  {
    type: "Checking",
    apy: "0.01%",
    features: ["No monthly maintenance fee", "Free ATM network", "Mobile check deposit"],
  },
  {
    type: "Savings",
    apy: "4.25%",
    features: ["High-yield rates", "No minimum balance", "FDIC insured"],
  },
  {
    type: "Money Market",
    apy: "4.30%",
    features: ["Premium rates", "Check-writing", "Higher limits"],
  },
  {
    type: "CD",
    apy: "4.50%",
    features: ["Fixed rates", "Term options", "Guaranteed returns"],
  },
];

export default function BankingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <section className="flex-1 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
              Banking Products
            </h1>
            <p className="mt-3 text-foreground max-w-2xl mx-auto">
              High-yield savings, no-fee checking, and powerful tools to make your money work harder.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ACCOUNT_TYPES.map((account) => (
              <Card key={account.type} className="text-center">
                <h3 className="text-lg font-semibold text-foreground">{account.type}</h3>
                <p className="text-3xl font-bold text-primary mt-2">{account.apy}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">APY</p>
                
                <ul className="mt-6 space-y-2 text-left">
                  {account.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <FiCheck className="text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/register" className="mt-6 block">
                  <Button variant="secondary" size="sm" className="w-full">Open Account</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}