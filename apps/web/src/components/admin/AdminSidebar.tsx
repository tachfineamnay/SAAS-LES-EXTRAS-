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
    label: "Missions SOS",
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
    <nav className="space-y-1.5">
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
              "flex items-center gap-2.5 rounded-md border border-transparent px-3 py-2 text-sm transition-colors",
              "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
              isActive &&
                "border-slate-700 bg-slate-800 text-slate-50 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]",
            )}
          >
            <Icon className="h-4 w-4" />
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
      <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-900 text-slate-100 md:block">
        <div className="px-5 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Super Admin</p>
          <p className="mt-1 text-xl font-semibold">Le Desk</p>
        </div>
        <div className="px-3 pb-4">
          <AdminNav />
        </div>
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[290px] border-slate-800 bg-slate-900 text-slate-100">
          <SheetHeader>
            <SheetTitle className="text-slate-100">Le Desk</SheetTitle>
            <SheetDescription className="text-slate-400">
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
