// components/layout/DashboardHeader.tsx

"use client";

import Link from "next/link";
import { FiBell, FiSearch } from "react-icons/fi";

interface DashboardHeaderProps {
  name?: string | null;
}

export function DashboardHeader({ name }: DashboardHeaderProps) {
  return (
    <header className="h-14 bg-(--surface) border-b border-(--border) flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Greeting */}
      <div className="flex items-center gap-3">
      <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
        Hi {name?.split(" ")[0] ?? "there"}
      </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full text-muted-foreground hover:bg-secondary transition-colors" aria-label="Search">
          <FiSearch size={18} />
        </button>
        <button className="p-2 rounded-full text-muted-foreground hover:bg-secondary transition-colors relative" aria-label="Notifications">
          <FiBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border border-(--surface)" />
        </button>
      </div>
    </header>
  );
}
