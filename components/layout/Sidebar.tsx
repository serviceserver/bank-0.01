// components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LuLayoutDashboard, LuBanknote, LuArrowUpDown, LuSend, LuUsers, LuListChecks, LuClipboardList } from "react-icons/lu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const customerNav: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",             icon: <LuLayoutDashboard size={20} /> },
  { label: "Accounts",      href: "/dashboard/accounts",    icon: <LuBanknote size={20} /> },
  { label: "Transactions",  href: "/dashboard/transactions",icon: <LuArrowUpDown size={20} /> },
  { label: "Transfer",      href: "/dashboard/transfer",    icon: <LuSend size={20} /> },
];

const adminNav: NavItem[] = [
  { label: "Overview",      href: "/admin",                 icon: <LuLayoutDashboard size={20} /> },
  { label: "Users",         href: "/admin/users",           icon: <LuUsers size={20} /> },
  { label: "Transactions",  href: "/admin/transactions",    icon: <LuArrowUpDown size={20} /> },
  { label: "Audit Logs",    href: "/admin/audit-logs",      icon: <LuClipboardList size={20} /> },
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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 transform bg-white border-r border-gray-200
          flex flex-col transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <span className="text-base font-bold text-slate-900 tracking-tight">NexBank</span>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                  font-medium transition-colors duration-100
                  ${active
                    ? "bg-slate-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-slate-900"
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate mb-2">{userName}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left text-sm text-red-600 hover:text-red-700
                       font-medium px-2 py-1.5 rounded-lg hover:bg-red-50
                       transition-colors duration-100"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
