// components/layout/PageWrapper.tsx

"use client";

import { useState } from "react";

import { Sidebar } from "./Sidebar";
import { SidebarContext } from "./sidebar-context";

interface PageWrapperProps {
  children: React.ReactNode;
  role: "CUSTOMER" | "ADMIN";
  userName: string;
}

export function PageWrapper({ children, role, userName }: PageWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          role={role}
          userName={userName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 w-full min-w-0">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
