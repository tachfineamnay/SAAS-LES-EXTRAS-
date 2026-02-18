"use client";

import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const CLIENT_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/bookings", label: "Mes Missions", icon: Briefcase },
  { href: "/network", label: "Mon Réseau", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

const TALENT_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/marketplace", label: "Offres de Renforts", icon: ShoppingBag },
  { href: "/bookings", label: "Mon Agenda", icon: CalendarDays },
  { href: "/network", label: "Mon Réseau", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

// The original 'links' array is removed as per the instruction's implied replacement.
// For now, we'll use CLIENT_LINKS as a default, assuming the component will be updated
// to accept a prop to choose between CLIENT_LINKS and TALENT_LINKS.
// If the instruction intended to replace the existing 'links' array with one of these,
// it would need to specify which one, or how to select.
// Given the instruction only provides the new definitions, and the original `links`
// array is not explicitly removed, but the new ones are inserted, I will assume
// the intent is to replace the old `links` with one of the new ones, or to
// introduce a prop to select. For now, I'll use CLIENT_LINKS as the default
// to keep the component functional, as the instruction didn't specify how to choose.
// However, the instruction snippet shows `links.map` still being used.
// This implies that the `links` variable itself should be updated.
// Since the instruction provides two sets of links, and doesn't specify which to use,
// or how to choose, I will assume the intent is to replace the original `links`
// with `CLIENT_LINKS` for now, as it's the first one provided.
// This is a best guess based on the limited scope of the instruction.

// To make the component functional with the new data, I'll replace the original `links`
// with `CLIENT_LINKS`. If the user intended to use `TALENT_LINKS` or a dynamic choice,
// further instructions would be needed.
const links = CLIENT_LINKS; // Replacing the original links with CLIENT_LINKS

type SidebarProps = {
  isMobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function Sidebar({ isMobileOpen, onMobileOpenChange }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 md:block">
        <nav className="space-y-2 rounded-xl border bg-card p-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Button key={link.label} variant="ghost" asChild className="w-full justify-start">
                <Link href={link.href}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[280px]">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Accès rapide à vos espaces.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.label}
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                  onClick={() => onMobileOpenChange(false)}
                >
                  <Link href={link.href}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
