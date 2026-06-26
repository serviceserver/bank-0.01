// components/layout/MobileNav.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuBanknote, LuArrowUpDown, LuSend, LuSettings } from "react-icons/lu";

const NAV_ITEMS = [
  { href: "/dashboard",        label: "Home",     icon: LuLayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: LuBanknote },
  { href: "/dashboard/transactions", label: "Activity", icon: LuArrowUpDown },
  { href: "/dashboard/transfer", label: "Transfer", icon: LuSend },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-stretch justify-around h-14 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1
                text-[11px] font-medium transition-colors
                ${active ? "text-[#002a5c]" : "text-gray-400 hover:text-gray-600"}
              `}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
