"use client";

import { Menu, Siren, Bell, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUIStore, type UserRole } from "@/lib/stores/useUIStore";
import { cn } from "@/lib/utils";

type HeaderProps = {
  onOpenMobileSidebar: () => void;
};

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const userRole = useUIStore((state) => state.userRole);
  const setUserRole = useUIStore((state) => state.setUserRole);
  const openRenfortModal = useUIStore((state) => state.openRenfortModal);
  const openPublishModal = useUIStore((state) => state.openPublishModal);

  return (
    <header className="sticky top-0 z-40 glass-surface-dense border-b border-border/40">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
        {/* Left — mobile menu + breadcrumb slot */}
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
          {/* Mobile logo */}
          <div className="flex items-center gap-1.5 md:hidden">
            <div className="h-6 w-6 rounded-md bg-primary shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold tracking-tight">LesExtras</span>
          </div>
        </div>

        {/* Right — actions */}
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
                <Bell className="h-4 w-4" />
                <span
                  className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-destructive"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-surface">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                Notifications
              </div>
              <DropdownMenuItem className="py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">Nouveau message</span>
                  <span className="text-xs text-muted-foreground">
                    Jean Dupont vous a envoyé un message.
                  </span>
                </div>
              </DropdownMenuItem>
              <div className="border-t border-border/40">
                <DropdownMenuItem className="justify-center text-xs text-muted-foreground py-2">
                  Voir tout
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Role indicator */}
          <Badge variant="quiet" className="hidden sm:inline-flex text-xs">
            {userRole === "CLIENT" ? "ÉTABLISSEMENT" : "FREELANCE"}
          </Badge>

          {/* Demo role switcher */}
          <Select value={userRole || undefined} onValueChange={(value) => setUserRole(value as UserRole)}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLIENT">Établissement</SelectItem>
              <SelectItem value="TALENT">Freelance</SelectItem>
            </SelectContent>
          </Select>

          {/* CTA */}
          {userRole === "CLIENT" ? (
            <Button
              onClick={openRenfortModal}
              variant="coral"
              size="sm"
              className="min-h-[44px] gap-2"
            >
              <Siren className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline font-semibold tracking-wide">RENFORT</span>
            </Button>
          ) : (
            <Button
              variant="teal-soft"
              onClick={openPublishModal}
              size="sm"
              className="min-h-[44px]"
            >
              <span className="hidden sm:inline">PUBLIER</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
