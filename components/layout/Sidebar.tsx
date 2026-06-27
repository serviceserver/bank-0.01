// components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LuLayoutDashboard, LuBanknote, LuArrowUpDown, LuSend, LuUsers, LuListChecks, LuClipboardList, LuX, LuLogOut } from "react-icons/lu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const customerNav: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",             icon: <LuLayoutDashboard size={18} /> },
  { label: "Accounts",      href: "/dashboard/accounts",    icon: <LuBanknote size={18} /> },
  { label: "Transactions",  href: "/dashboard/transactions", icon: <LuArrowUpDown size={18} /> },
  { label: "Transfer",      href: "/dashboard/transfer",    icon: <LuSend size={18} /> },
];

const adminNav: NavItem[] = [
  { label: "Overview",      href: "/admin",                 icon: <LuLayoutDashboard size={18} /> },
  { label: "Users",         href: "/admin/users",           icon: <LuUsers size={18} /> },
  { label: "Transactions",  href: "/admin/transactions",    icon: <LuArrowUpDown size={18} /> },
  { label: "Recognized Accounts", href: "/admin/recognized-accounts", icon: <LuListChecks size={18} /> },
  { label: "Audit Logs",    href: "/admin/audit-logs",      icon: <LuClipboardList size={18} /> },
];

interface SidebarProps {
  role: "CUSTOMER" | "ADMIN";
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, userName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const nav = role === "ADMIN" ? adminNav : customerNav;
  const firstName = userName?.split(" ")[0] ?? "";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#081628]
          flex flex-col transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Bank Brand */}
        <div className="px-5 h-16 flex items-center border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-[#081628] font-bold text-base leading-none">N</span>
            </div>
            <div className="leading-tight">
              <p className="text-white font-semibold text-sm tracking-wide">TitanBank</p>
              <p className="text-blue-200/80 text-[10px] uppercase tracking-widest">Premium Banking</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-[2px] overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px]
                  font-medium transition-colors duration-100
                  ${active
                    ? "bg-white/10 text-white"
                    : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <span className="text-base opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-white text-[13px] font-medium truncate">{firstName}</p>
              <p className="text-blue-200/60 text-[11px]">Member</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 w-full text-left text-[12px] text-blue-200/60 hover:text-white transition-colors duration-100 px-2 py-1.5 rounded-md hover:bg-white/5"
          >
            <LuLogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
