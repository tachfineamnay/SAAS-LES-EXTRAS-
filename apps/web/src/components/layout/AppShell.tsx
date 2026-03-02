"use client";

import { useState } from "react";
import { PublishModal } from "@/components/modals/PublishModal";
import { RenfortModal } from "@/components/modals/RenfortModal";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useUIStore } from "@/lib/stores/useUIStore";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

export function RenfortModalWrapper() {
  const isOpen = useUIStore((state) => state.isRenfortModalOpen);
  if (!isOpen) return null;
  return <RenfortModal />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const { scrollRef, headerOpacity, borderOpacity } = useScrollProgress();

  return (
    <div className="relative flex h-screen w-full flex-col bg-background font-sans text-foreground antialiased md:flex-row overflow-hidden">
      {/* Ambient background — dot grid + soft top gradient */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-0 left-0 right-0 h-80 bg-ambient-top" />
      </div>

      <Sidebar isMobileOpen={isMobileOpen} onMobileOpenChange={setMobileOpen} />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header
          onOpenMobileSidebar={() => setMobileOpen(true)}
          headerOpacity={headerOpacity}
          borderOpacity={borderOpacity}
        />
        <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <RenfortModalWrapper />
      <PublishModal />
      <Toaster
        richColors
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "0.875rem",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 4px 16px hsla(222,47%,11%,0.10)",
          },
        }}
      />
    </div>
  );
}
