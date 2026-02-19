"use client";

import { Menu, Rocket, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUIStore, type UserRole } from "@/lib/stores/useUIStore";

type HeaderProps = {
  onOpenMobileSidebar: () => void;
};

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const userRole = useUIStore((state) => state.userRole);
  const setUserRole = useUIStore((state) => state.setUserRole);
  const openSOSModal = useUIStore((state) => state.openSOSModal);
  const openPublishModal = useUIStore((state) => state.openPublishModal);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Ouvrir le menu"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-lg font-semibold tracking-tight">LesExtras</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {userRole === "CLIENT" ? "ÉTABLISSEMENT" : "FREELANCE"}
          </Badge>

          <Select value={userRole || undefined} onValueChange={(value) => setUserRole(value as UserRole)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLIENT">ÉTABLISSEMENT</SelectItem>
              <SelectItem value="TALENT">FREELANCE</SelectItem>
            </SelectContent>
          </Select>

          {userRole === "CLIENT" ? (
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={openSOSModal}>
              <Siren className="h-4 w-4" />
              RENFORT IMMÉDIAT
            </Button>
          ) : (
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={openPublishModal}>
              <Rocket className="h-4 w-4" />
              PUBLIER OFFRE
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
