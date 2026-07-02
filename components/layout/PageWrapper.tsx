// components/layout/PageWrapper.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { SidebarContext } from "./sidebar-context";
import { MobileNav } from "./MobileNav";

interface PageWrapperProps {
  children: React.ReactNode;
  role: "CUSTOMER" | "ADMIN";
  userName: string;
}

export function PageWrapper({ children, role, userName }: PageWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session && session.user && !session.user.id) {
      // Session was invalidated (e.g., account blocked or token reset)
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <Sidebar
          role={role}
          userName={userName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 lg:ml-0 min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav role={role} />
    </SidebarContext.Provider>
  );
}