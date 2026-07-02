// components/layout/PublicFooter.tsx

import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <p className="text-sm font-semibold text-foreground">Company</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About us</Link></li>
              <li><Link href="#" className="hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary">Press room</Link></li>
              <li><Link href="#" className="hover:text-primary">Investor relations</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Cards</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cards" className="hover:text-primary">Credit cards</Link></li>
              <li><Link href="/cards" className="hover:text-primary">Debit cards</Link></li>
              <li><Link href="/business" className="hover:text-primary">Business cards</Link></li>
              <li><Link href="/rewards" className="hover:text-primary">Rewards</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Banking</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/banking" className="hover:text-primary">Checking</Link></li>
              <li><Link href="/banking" className="hover:text-primary">Savings</Link></li>
              <li><Link href="/banking" className="hover:text-primary">CDs</Link></li>
              <li><Link href="/banking" className="hover:text-primary">Rates</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Support</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Contact us</Link></li>
              <li><Link href="#" className="hover:text-primary">Help center</Link></li>
              <li><Link href="#" className="hover:text-primary">Security</Link></li>
              <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Titan Bank. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-primary">Log in</Link>
            <Link href="/register" className="hover:text-primary">Apply now</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}