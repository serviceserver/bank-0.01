// app/page.tsx

import Link from "next/link";
import { FiCheck, FiLock, FiZap, FiPieChart, FiStar } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import Image from "next/image";

const CARDS = [
  {
    title: "NexBank® Gold",
    meta: "For everyday spending",
    gradient: "from-amber-500 to-yellow-600",
    accent: "text-amber-100",
  },
  {
    title: "NexBank Platinum",
    meta: "Premium travel & perks",
    gradient: "from-slate-800 to-slate-900",
    accent: "text-slate-200",
  },
  {
    title: "NexBank Everyday",
    meta: "No annual fee",
    gradient: "from-[#002a5c] to-[#004080]",
    accent: "text-blue-100",
  },
];

const FEATURES = [
  {
    icon: FiLock,
    title: "Bank-grade security",
    description:
      "Advanced encryption, real-time monitoring, and zero-liability protection keep your money safe.",
  },
  {
    icon: FiZap,
    title: "Instant transfers",
    description:
      "Send and receive funds in seconds with real-time tracking and notifications.",
  },
  {
    icon: FiPieChart,
    title: "Smart insights",
    description:
      "Understand your spending with clear, actionable reports and automated budgets.",
  },
  {
    icon: FiStar,
    title: " premium rewards",
    description:
      "Earn points on every purchase and redeem for travel, shopping, or cash back.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#002a5c] text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#002a5c] via-[#003d80] to-[#002a5c] opacity-90" />
        <Image src="/banner.jpg" alt="Hero background" fill className="object-cover object-center opacity-50 z-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 z-30">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-wider text-blue-200 uppercase mb-4">
                Ranked among the best
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
                Don&rsquo;t live life without it.
              </h1>
              <p className="mt-6 text-lg text-white leading-relaxed">
                Experience the financial services platform built for how you live and work - from everyday spending to long-term goals.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50 border border-white">
                    Apply now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg" className="bg-transparent text-white border-white/30 hover:bg-white/10">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>

            {/* Premium card mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md aspect-[1.586/1]">
                <div className="absolute inset-0 bg-linear-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl shadow-2xl transform rotate-3 opacity-90" />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-white/80 uppercase tracking-widest">
                      NexBank
                    </p>
                    <p className="text-lg font-semibold text-white mt-1">
                      Gold Card
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white tracking-widest">
                      •••• •••• •••• 4289
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-white/80">MEMBER SINCE 2000</p>
                      <p className="text-xs text-white/80">VALID THRU 12/28</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Greatest Cards */}
      <section id="cards" className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
                Our greatest cards.
              </h2>
              <p className="mt-3 text-gray-600 max-w-2xl">
                Choose the card that fits your lifestyle. Every card comes with exceptional benefits and service.
              </p>
            </div>
            <Link href="/register" className="hidden sm:inline-flex text-sm font-semibold text-[#002a5c] hover:underline">
              View all cards
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CARDS.map((card) => (
              <Card
                key={card.title}
                padding="none"
                className="group overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className={`h-40 bg-linear-to-br ${card.gradient} p-6 flex flex-col justify-between`}>
                  <p className={`text-xs font-medium uppercase tracking-widest ${card.accent}`}>
                    {card.meta}
                  </p>
                  <p className={`text-3xl font-semibold ${card.accent}`}>{card.title}</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Earn points on every purchase and enjoy premium benefits tailored to your needs.
                  </p>
                  <Link href="/register">
                    <Button size="sm" className="mt-4 w-full">
                      Learn more
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Banking */}
      <section id="banking" className="border-t border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
                Banking that works as hard as you do.
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                High-yield savings, no-fee checking, and powerful tools to make your money work harder.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "No hidden fees — no minimum balance",
                  "Same-day direct deposit",
                  "FDIC insured up to $250,000",
                  "24/7 customer support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-0.5 text-[#002a5c]"><FiCheck /></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg">Open an account</Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border border-gray-100 p-6 text-center">
                <p className="text-3xl font-semibold text-[#002a5c]">4.25%</p>
                <p className="mt-2 text-sm text-gray-600">APY on High-Yield Savings</p>
              </Card>
              <Card className="bg-white border border-gray-100 p-6 text-center">
                <p className="text-3xl font-semibold text-[#002a5c]">$0</p>
                <p className="mt-2 text-sm text-gray-600">Monthly fees</p>
              </Card>
              <Card className="bg-white border border-gray-100 p-6 text-center">
                <p className="text-3xl font-semibold text-[#002a5c]">70K+</p>
                <p className="mt-2 text-sm text-gray-600">Free ATM withdrawals</p>
              </Card>
              <Card className="bg-white border border-gray-100 p-6 text-center">
                <p className="text-3xl font-semibold text-[#002a5c]">Same day</p>
                <p className="mt-2 text-sm text-gray-600">Direct deposit</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why NexBank */}
      <section id="rewards" className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              The NexBank difference.
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              More than a bank. A partner in your financial life with tools, perks, and service you won’t find anywhere else.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="h-full">
                <f.icon className="text-2xl text-[#002a5c]" />
                <h3 className="mt-4 text-base font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            Ready to join?
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Apply in minutes and get a decision fast. No branch visit required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Apply now</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">Log in</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-sm font-semibold text-gray-900">Company</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-[#002a5c]">About us</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Careers</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Press room</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Investor relations</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Cards</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-[#002a5c]">Credit cards</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Debit cards</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Business cards</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Rewards</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Banking</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-[#002a5c]">Checking</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Savings</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">CDs</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Rates</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Support</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-[#002a5c]">Contact us</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Help center</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Security</Link></li>
                <li><Link href="#" className="hover:text-[#002a5c]">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 NexBank. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/login" className="hover:text-[#002a5c]">Log in</Link>
              <Link href="/register" className="hover:text-[#002a5c]">Apply now</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
