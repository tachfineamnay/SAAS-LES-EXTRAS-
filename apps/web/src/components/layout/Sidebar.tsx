"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
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
  { href: "/dashboard",          label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/marketplace",        label: "Marketplace",     icon: ShoppingBag },
  { href: "/dashboard/packs",    label: "Crédits",         icon: WalletCards },
  { href: "/dashboard/renforts", label: "Mes Renforts",    icon: Briefcase },
  { href: "/dashboard/inbox",    label: "Messagerie",      icon: Mail },
];

const TALENT_LINKS = [
  { href: "/dashboard",      label: "Tableau de bord",   icon: LayoutDashboard },
  { href: "/marketplace",    label: "Offres de Renforts", icon: ShoppingBag },
  { href: "/bookings",       label: "Mon Agenda",         icon: CalendarDays },
  { href: "/dashboard/inbox", label: "Messagerie",        icon: Mail },
];

const BOTTOM_LINKS = [
  { href: "/account",  label: "Mon Profil",   icon: UserRound },
  { href: "/settings", label: "Paramètres",   icon: Settings },
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
  index = 0,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  badge?: number;
  onClick?: () => void;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
          "transition-all duration-200 group min-h-[44px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--teal)/0.5)]",
          isActive
            ? "bg-[hsl(var(--teal-light))] text-[hsl(var(--teal-dim))]"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[hsl(var(--teal))]"
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        )}

        {/* Icon container */}
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            isActive
              ? "bg-[hsl(var(--teal)/0.15)] text-[hsl(var(--teal))]"
              : "bg-muted text-muted-foreground group-hover:bg-[hsl(var(--teal-light))] group-hover:text-[hsl(var(--teal))]"
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>

        <span className="flex-1 text-[13px]">{label}</span>

        {badge !== undefined && badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--coral))] px-1 text-[10px] font-bold text-white"
            aria-label={`${badge} non lus`}
          >
            {badge}
          </motion.span>
        )}
      </Link>
    </motion.div>
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
    <div className="flex h-full flex-col bg-white border-r border-border">
      {/* Logo zone */}
      <div className="px-4 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          {/* Logo blocs inspiré du logo ADEPA */}
          <div className="relative h-8 w-8 shrink-0">
            <div className="absolute top-0 right-0 h-3.5 w-3.5 rounded-[3px] bg-[hsl(var(--logo-gray))]" />
            <div className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-[3px] bg-[hsl(var(--coral))]" />
            <div className="absolute top-0 left-0 h-3.5 w-3.5 rounded-[3px] bg-[hsl(var(--logo-gray)/0.55)]" />
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-[3px] bg-[hsl(var(--coral)/0.50)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none font-[family-name:var(--font-display)]">
              Les Extras
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide uppercase">
              Plateforme
            </p>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Navigation principale">
        {links.map((link, i) => (
          <NavLink
            key={link.href}
            {...link}
            isActive={isLinkActive(link.href)}
            index={i}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-border/60" />

      {/* Liens du bas */}
      <div className="px-3 py-4 space-y-0.5">
        {BOTTOM_LINKS.map((link, i) => (
          <NavLink
            key={link.href}
            {...link}
            isActive={isLinkActive(link.href)}
            index={i}
            onClick={onNavigate}
          />
        ))}
      </div>

      {/* Version tag */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-muted-foreground/60 font-mono">v2026.3</p>
      </div>
    </div>
  );
}

export function Sidebar({ isMobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const userRole = useUIStore((state) => state.userRole);
  const links = userRole === "CLIENT" ? CLIENT_LINKS : TALENT_LINKS;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:shrink-0 z-20">
        <SidebarContent links={links} pathname={pathname} />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-64 p-0 border-r border-border">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Menu de navigation principal</SheetDescription>
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
          ? "bg-teal-100 text-teal-500 border-l-2 border-[hsl(var(--teal))] rounded-l-none pl-[10px] font-semibold"
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
