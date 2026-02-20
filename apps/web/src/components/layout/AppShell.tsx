"use client";

import { useState } from "react";
import { PublishModal } from "@/components/modals/PublishModal";
import { RenfortModal } from "@/components/modals/RenfortModal";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useUIStore } from "@/lib/stores/useUIStore";

export function RenfortModalWrapper() {
  const isOpen = useUIStore((state) => state.isRenfortModalOpen);
  if (!isOpen) return null;
  return <RenfortModal />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const userRole = useUIStore((state) => state.userRole);

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40 font-sans text-foreground antialiased md:flex-row">
      <Sidebar isMobileOpen={isMobileOpen} onMobileOpenChange={setMobileOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <RenfortModalWrapper />
      <PublishModal />
      <Toaster richColors position="top-right" />
    </div>
  );
}
