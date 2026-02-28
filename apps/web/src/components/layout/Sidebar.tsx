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
  Users,
  Settings,
  CalendarDays,
  Mail,
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
  { href: "/dashboard/packs", label: "Acheter des crédits", icon: WalletCards },
  { href: "/dashboard/renforts", label: "Mes Renforts", icon: Briefcase },
  { href: "/dashboard/inbox", label: "Boîte de réception", icon: Mail },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

const TALENT_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/marketplace", label: "Offres de Renforts", icon: ShoppingBag },
  { href: "/bookings", label: "Mon Agenda", icon: CalendarDays },
  { href: "/dashboard/inbox", label: "Boîte de réception", icon: Mail },
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
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start min-h-[44px] transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive && "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none"
      )}
      onClick={onClick}
    >
      <Link href={href}>
        <Icon className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-medium"
            aria-label={`${badge} non lus`}
          >
            {badge}
          </span>
        )}
      </Link>
    </Button>
  );
}

export function Sidebar({ isMobileOpen, onMobileOpenChange }: SidebarProps) {
  const userRole = useUIStore((state) => state.userRole);
  const pathname = usePathname();
  const links = userRole === "TALENT" ? TALENT_LINKS : CLIENT_LINKS;

  const isLinkActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 md:block">
        <nav className="sticky top-[57px] space-y-1 rounded-lg glass-surface p-3" aria-label="Navigation principale">
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              isActive={isLinkActive(link.href)}
              badge={link.href === "/dashboard/inbox" ? 3 : undefined}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[280px] glass-surface">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Accès rapide à vos espaces.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 space-y-1" aria-label="Navigation principale">
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                isActive={isLinkActive(link.href)}
                badge={link.href === "/dashboard/inbox" ? 3 : undefined}
                onClick={() => onMobileOpenChange(false)}
              />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
