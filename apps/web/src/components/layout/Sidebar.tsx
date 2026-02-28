"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  UserRound,
  WalletCards,
  LayoutDashboard,
  ShoppingBag,
  Briefcase,
  Settings,
  CalendarDays,
  Mail,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUIStore } from "@/lib/stores/useUIStore";
import { cn } from "@/lib/utils";

const CLIENT_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/dashboard/packs", label: "Crédits", icon: WalletCards },
  { href: "/dashboard/renforts", label: "Mes Renforts", icon: Briefcase },
  { href: "/dashboard/inbox", label: "Messagerie", icon: Mail },
];

const TALENT_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/marketplace", label: "Offres de Renforts", icon: ShoppingBag },
  { href: "/bookings", label: "Mon Agenda", icon: CalendarDays },
  { href: "/dashboard/inbox", label: "Messagerie", icon: Mail },
];

const BOTTOM_LINKS = [
  { href: "/account", label: "Mon Profil", icon: UserRound },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

type SidebarProps = {
  isMobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "min-h-[44px]",
        isActive
          ? "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none pl-[10px]"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground"
          aria-label={`${badge} non lus`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({
  links,
  pathname,
  onNavigate,
}: {
  links: typeof CLIENT_LINKS;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isLinkActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col">
      {/* Logo zone */}
      <div className="px-4 py-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Compass className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">LesExtras</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Plateforme</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navigation principale">
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            isActive={isLinkActive(link.href)}
            badge={link.href === "/dashboard/inbox" ? 3 : undefined}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 pb-4 pt-2 border-t border-border/40 space-y-1">
        {BOTTOM_LINKS.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            isActive={isLinkActive(link.href)}
            onClick={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ isMobileOpen, onMobileOpenChange }: SidebarProps) {
  const userRole = useUIStore((state) => state.userRole);
  const pathname = usePathname();
  const links = userRole === "TALENT" ? TALENT_LINKS : CLIENT_LINKS;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 md:block h-screen sticky top-0">
        <div className="h-full glass-surface rounded-none border-l-0 border-t-0 border-b-0 border-r border-border/40">
          <SidebarContent links={links} pathname={pathname} />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[280px] p-0 glass-surface">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Accès rapide à vos espaces.</SheetDescription>
          </SheetHeader>
          <SidebarContent
            links={links}
            pathname={pathname}
            onNavigate={() => onMobileOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
