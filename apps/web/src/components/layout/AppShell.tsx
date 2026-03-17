"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApplyMissionModal } from "@/components/modals/ApplyMissionModal";
import { PublishModal } from "@/components/modals/PublishModal";
import { RenfortModal } from "@/components/modals/RenfortModal";
import { BookServiceModal } from "@/components/modals/BookServiceModal";
import { QuoteRequestModal } from "@/components/modals/QuoteRequestModal";
import { QuoteEditorModal } from "@/components/modals/QuoteEditorModal";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav, BottomNavItem } from "@/components/ui/mobile-bottom-nav";
import { useUIStore } from "@/lib/stores/useUIStore";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";
import { LayoutDashboard, ShoppingBag, CalendarDays, Mail, UserRound } from "lucide-react";

export function RenfortModalWrapper() {
  const isOpen = useUIStore((state) => state.isRenfortModalOpen);
  const userRole = useUIStore((state) => state.userRole);
  const closeRenfortModal = useUIStore((state) => state.closeRenfortModal);

  useEffect(() => {
    if (isOpen && userRole !== "ESTABLISHMENT") {
      closeRenfortModal();
    }
  }, [closeRenfortModal, isOpen, userRole]);

  if (!isOpen || userRole !== "ESTABLISHMENT") return null;
  return <RenfortModal />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const { scrollRef, headerOpacity, borderOpacity } = useScrollProgress();
  const pathname = usePathname();
  const router = useRouter();
  const userRole = useUIStore((state) => state.userRole);
  const openRenfortModal = useUIStore((state) => state.openRenfortModal);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const bottomNavItems: BottomNavItem[] =
    userRole === "FREELANCE"
      ? [
          { id: "dashboard", label: "Accueil", icon: LayoutDashboard, active: isActive("/dashboard"), onClick: () => router.push("/dashboard") },
          { id: "marketplace", label: "Missions", icon: ShoppingBag, active: isActive("/marketplace"), onClick: () => router.push("/marketplace") },
          { id: "fab", label: "", icon: LayoutDashboard }, // placeholder for FAB slot
          { id: "bookings", label: "Agenda", icon: CalendarDays, active: isActive("/bookings"), onClick: () => router.push("/bookings") },
          { id: "account", label: "Profil", icon: UserRound, active: isActive("/account"), onClick: () => router.push("/account") },
        ]
      : [
          { id: "dashboard", label: "Accueil", icon: LayoutDashboard, active: isActive("/dashboard"), onClick: () => router.push("/dashboard") },
          { id: "marketplace", label: "Catalogue", icon: ShoppingBag, active: isActive("/marketplace"), onClick: () => router.push("/marketplace") },
          { id: "fab", label: "", icon: LayoutDashboard }, // placeholder for FAB slot
          { id: "inbox", label: "Messages", icon: Mail, active: isActive("/dashboard/inbox"), onClick: () => router.push("/dashboard/inbox") },
          { id: "account", label: "Profil", icon: UserRound, active: isActive("/account"), onClick: () => router.push("/account") },
        ];

  return (
    <div className="relative flex h-screen w-full flex-col bg-background font-sans text-foreground antialiased md:flex-row overflow-hidden">
      {/* Ambient background — subtle top gradient */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[hsl(var(--teal-light)/0.3)] via-background to-background" />
      </div>

      <Sidebar isMobileOpen={isMobileOpen} onMobileOpenChange={setMobileOpen} />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header
          onOpenMobileSidebar={() => setMobileOpen(true)}
          headerOpacity={headerOpacity}
          borderOpacity={borderOpacity}
        />
        <main ref={scrollRef as React.RefCallback<HTMLElement>} className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:pb-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <RenfortModalWrapper />
      <PublishModal />
      <ApplyMissionModal />
      <BookServiceModal />
      <QuoteRequestModal />
      <QuoteEditorModal />
      <MobileBottomNav
        items={bottomNavItems}
        useFab
        onFabClick={userRole === "FREELANCE" ? () => router.push("/marketplace") : openRenfortModal}
        fabLabel={userRole === "FREELANCE" ? "Chercher des missions" : "Publier un renfort"}
      />
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
