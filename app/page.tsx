"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            NexBank
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Open account</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-black" />
          <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-6">
                ✦ Trusted by 100,000+ customers
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Banking built for the <span className="text-blue-600 dark:text-blue-400">way you live</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Send money, track spending, and grow your savings - all from one beautifully simple app. No hidden fees, no fine print.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">Open a free account</Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">Sign in</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="h-full">
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bank-grade security</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your money and data are protected with end-to-end encryption and proactive fraud monitoring.
                </p>
              </Card>

              <Card className="h-full">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Instant transfers</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Send and receive money in seconds, not days. Real-time balances and notifications keep you in control.
                </p>
              </Card>

              <Card className="h-full">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Smart insights</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Categorize spending, set budgets, and see where your money goes with clear, actionable reports.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Designed around your money
                </h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  From daily spending to long-term goals, NexBank gives you the tools to manage every part of your financial life.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Unlimited instant transfers",
                    "Virtual and physical cards",
                    "Automated savings goals",
                    "Detailed transaction history",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-0.5 text-green-600 dark:text-green-400">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link href="/register">
                    <Button size="lg">Get started</Button>
                  </Link>
                </div>
              </div>
              <Card padding="lg" className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Total balance</span>
                    <span className="text-xs rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-gray-200">Main Account</span>
                  </div>
                  <p className="text-4xl font-semibold tracking-tight">$24,562.00</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                      <p className="text-xs text-gray-400">Income</p>
                      <p className="text-lg font-medium mt-1 text-green-400">+$8,240.00</p>
                    </div>
                    <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                      <p className="text-xs text-gray-400">Expenses</p>
                      <p className="text-lg font-medium mt-1 text-red-400">-$3,120.00</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    {[
                      { name: "Spotify", amount: "-$14.99", time: "Today" },
                      { name: "Salary deposit", amount: "+$8,240.00", time: "Yesterday" },
                      { name: "Grocery store", amount: "-$142.50", time: "Yesterday" },
                    ].map((tx) => (
                      <div key={tx.name} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-100">{tx.name}</p>
                          <p className="text-xs text-gray-400">{tx.time}</p>
                        </div>
                        <span className={tx.amount.startsWith("+") ? "text-green-400" : "text-gray-200"}>
                          {tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Ready to take control?
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Open your account in minutes. No paperwork, no branch visits - just a better way to bank.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">Open account now</Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">I already have an account</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 NexBank. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-slate-900 dark:hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
