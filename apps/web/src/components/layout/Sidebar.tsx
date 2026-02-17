"use client";

import Link from "next/link";
import { Compass, UserRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const links = [
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: Compass,
  },
  {
    href: "/bookings",
    label: "Mes Réservations",
    icon: WalletCards,
  },
  {
    href: "/account",
    label: "Mon Compte",
    icon: UserRound,
  },
];

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
