"use client";

import { Menu, Rocket, Siren, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUIStore, type UserRole } from "@/lib/stores/useUIStore";

type HeaderProps = {
  onOpenMobileSidebar: () => void;
};

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const userRole = useUIStore((state) => state.userRole);
  const setUserRole = useUIStore((state) => state.setUserRole);
  const openRenfortModal = useUIStore((state) => state.openRenfortModal);
  const openPublishModal = useUIStore((state) => state.openPublishModal);

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-[12px] border-b border-border/40 shadow-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px]"
            aria-label="Ouvrir le menu"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              LesExtras
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative min-h-[44px] min-w-[44px]"
                aria-label="Notifications (1 nouvelle)"
              >
                <Bell className="h-5 w-5" />
                <span
                  className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-surface">
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">Nouveau message</span>
                  <span className="text-xs text-muted-foreground">
                    Jean Dupont vous a envoyé un message.
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-center text-xs text-muted-foreground">
                Voir toutes les notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Badge variant="quiet" className="hidden sm:inline-flex">
            {userRole === "CLIENT" ? "ÉTABLISSEMENT" : "FREELANCE"}
          </Badge>

          <Select value={userRole || undefined} onValueChange={(value) => setUserRole(value as UserRole)}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLIENT">ÉTABLISSEMENT</SelectItem>
              <SelectItem value="TALENT">FREELANCE</SelectItem>
            </SelectContent>
          </Select>

          {userRole === "CLIENT" ? (
            <Button
              onClick={openRenfortModal}
              className="shadow-sm"
            >
              <Siren className="h-4 w-4" />
              <span className="hidden sm:inline">DEMANDER UN RENFORT</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={openPublishModal}
              className="shadow-sm"
            >
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">PUBLIER OFFRE</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
