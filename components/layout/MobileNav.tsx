// components/layout/MobileNav.tsx

"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuBanknote, LuArrowUpDown, LuSend, LuUsers, LuListChecks, LuClipboardList, LuLogOut, LuSettings } from "react-icons/lu";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LuLayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: LuBanknote },
  { href: "/dashboard/transactions", label: "Activity", icon: LuArrowUpDown },
  { href: "/dashboard/transfer", label: "Transfer", icon: LuSend },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LuLayoutDashboard },
  { href: "/admin/users", label: "Users", icon: LuUsers },
  { href: "/admin/recognized-accounts", label: "Accounts", icon: LuListChecks },
  { href: "/admin/transactions", label: "Transactions", icon: LuArrowUpDown },
  { href: "/admin/settings", label: "Settings", icon: LuSettings },
  { href: "/admin/audit-logs", label: "Audit", icon: LuClipboardList },
];

interface MobileNavProps {
  role: "CUSTOMER" | "ADMIN";
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? adminNav : customerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border lg:hidden">
      <div className={`flex items-stretch h-14 pb-[env(safe-area-inset-bottom)] ${role === "ADMIN" || navItems.length + 1 > 4 ? "overflow-x-auto px-1 gap-1" : "justify-around"}`}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1
                text-[11px] font-medium transition-colors whitespace-nowrap
                ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              `}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
        {/* Logout button for customers */}
        {role === "CUSTOMER" && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            <LuLogOut size={18} strokeWidth={1.8} />
            <span className="leading-none">Log out</span>
          </button>
        )}
      </div>
    </nav>
  );
}
