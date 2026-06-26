// components/layout/DashboardHeader.tsx

"use client";

import Link from "next/link";
import { FiBell, FiSearch } from "react-icons/fi";

interface DashboardHeaderProps {
  name?: string | null;
}

export function DashboardHeader({ name }: DashboardHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Greeting */}
      <div className="flex items-center gap-3">
      <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
        Hi {name?.split(" ")[0] ?? "there"}
      </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Search">
          <FiSearch size={18} />
        </button>
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors relative" aria-label="Notifications">
          <FiBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
        </button>
      </div>
    </header>
  );
}
