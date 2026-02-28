"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const links = [
  {
    href: "/admin",
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: Users,
  },
  {
    href: "/admin/missions",
    label: "Missions Renforts",
    icon: TriangleAlert,
  },
  {
    href: "/admin/services",
    label: "Ateliers",
    icon: GraduationCap,
  },
  {
    href: "/admin/finance",
    label: "Finance",
    icon: Wallet,
  },
];

type AdminSidebarProps = {
  isMobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

type AdminNavProps = {
  onNavigate?: () => void;
};

function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Administration">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium",
              "transition-all duration-200",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "min-h-[44px]",
              isActive &&
              "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ isMobileOpen, onMobileOpenChange }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop sidebar — glass surface */}
      <aside className="hidden w-60 shrink-0 md:block">
        <div className="sticky top-0 h-screen overflow-y-auto glass-surface rounded-none border-l-0 border-t-0 border-b-0">
          <div className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Super Admin
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground">Le Desk</p>
          </div>
          <div className="px-3 pb-4">
            <AdminNav />
          </div>
        </div>
      </aside>

      {/* Mobile sidebar — Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[280px] glass-surface">
          <SheetHeader>
            <SheetTitle>Le Desk</SheetTitle>
            <SheetDescription>
              Navigation administration.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <AdminNav onNavigate={() => onMobileOpenChange(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
