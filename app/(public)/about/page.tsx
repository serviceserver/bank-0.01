// app/(public)/about/page.tsx

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <section className="flex-1 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary mb-8">
            About Titan Bank
          </h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-foreground leading-relaxed">
              Titan Bank is a modern financial institution dedicated to providing secure, fast, and transparent banking services for everyone. 
              Founded in 2024, we&apos;ve built a platform that combines traditional banking reliability with cutting-edge technology.
            </p>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Our Mission</h2>
            <p className="text-foreground">
              We believe banking should work for how you live and work—from everyday spending to long-term goals. 
              Our mission is to provide exceptional financial services with no hidden fees, zero-liability protection, 
              and 24/7 customer support.
            </p>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Banking Services</h2>
            <ul className="text-foreground space-y-2">
              <li>High-yield savings accounts with competitive APY</li>
              <li>No-fee checking accounts with real-time tracking</li>
              <li>Premium credit and debit cards with rewards</li>
              <li>Business banking solutions for companies of all sizes</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Security First</h2>
            <p className="text-foreground">
              Your security is our priority. We use advanced encryption, real-time monitoring, and zero-liability 
              protection to keep your money and personal information safe. All deposits are FDIC insured up to $250,000.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}