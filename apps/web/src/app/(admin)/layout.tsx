"use client";

import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { adminLogout } from "@/app/actions/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileOpenChange={setIsMobileSidebarOpen}
        />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Ouvrir la navigation admin"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Back Office</p>
                  <h1 className="text-lg font-semibold text-slate-900">Le Desk</h1>
                </div>
              </div>

              <form action={adminLogout}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </form>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
