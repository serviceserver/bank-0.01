// components/layout/TopBar.tsx

"use client";

import { LuMenu } from "react-icons/lu";
import { useSidebar } from "./sidebar-context";

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  const { openSidebar } = useSidebar();

  return (
    <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg text-muted hover:bg-muted/10"
          aria-label="Open menu"
        >
          <LuMenu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  );
}
