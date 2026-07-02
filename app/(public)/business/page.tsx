// app/(public)/business/page.tsx

import Link from "next/link";
import { FiCheck, FiBriefcase, FiBarChart2, FiShield } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";

const BUSINESS_SERVICES = [
  {
    name: "Business Checking",
    description: "Streamline operations with integrated tools and zero-fee transactions.",
    icon: FiBriefcase,
  },
  {
    name: "Corporate Cards",
    description: "Custom spending limits and real-time expense tracking for your team.",
    icon: FiBarChart2,
  },
  {
    name: "Business Loans",
    description: "Flexible financing with rates as low as 4.25% APR.",
    icon: FiShield,
  },
];

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
              Business Solutions
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Financial tools and insights your business needs to thrive, from startups to enterprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {BUSINESS_SERVICES.map((service) => (
              <Card key={service.name} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <service.icon className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                <Link href="/register" className="mt-6 inline-block">
                  <Button variant="secondary" size="sm">Learn More</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-primary">Business Advantage</h2>
            <p className="text-5xl font-bold text-primary my-4">2.5x</p>
            <p className="text-sm text-muted-foreground">Higher reward rates on business spending</p>
          </div>
        </div>
      </section>
    </div>
  );
}