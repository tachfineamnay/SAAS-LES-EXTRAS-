"use client";

import { useState } from "react";
import { PublishModal } from "@/components/modals/PublishModal";
import { SOSModal } from "@/components/modals/SOSModal";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileOpenChange={setIsMobileSidebarOpen}
        />
        <main className="min-h-[calc(100vh-8rem)] flex-1">{children}</main>
      </div>

      <SOSModal />
      <PublishModal />
      <Toaster richColors position="top-right" />
    </div>
  );
}
