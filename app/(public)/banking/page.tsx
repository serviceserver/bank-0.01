// app/(public)/banking/page.tsx

import Link from "next/link";
import { FiCheck, FiShield, FiZap, FiPieChart } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
              Banking Products
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
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

      <section className="border-t border-border bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-primary">Banking that works as hard as you do</h2>
              <p className="mt-3 text-muted-foreground">
                From everyday spending to long-term savings, we provide the tools and services you need to achieve your financial goals.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Same-day direct deposit available",
                  "Over 70,000 fee-free ATMs worldwide",
                  "24/7 customer support",
                  "FDIC insured up to $250,000",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <FiCheck className="text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FiShield className="text-3xl text-primary" />
                <FiZap className="text-3xl text-primary" />
                <FiPieChart className="text-3xl text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Secure. Fast. Smart.</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Advanced encryption, real-time monitoring, and zero-liability protection keep your money safe.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}