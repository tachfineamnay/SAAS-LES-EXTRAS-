"use client";

import { Menu, Siren, Bell, ChevronDown } from "lucide-react";
import { motion, type MotionValue, useMotionTemplate, type MotionStyle } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUIStore, type UserRole } from "@/lib/stores/useUIStore";
import { cn } from "@/lib/utils";
import { SPRING_BOUNCY } from "@/lib/motion";

type HeaderProps = {
  onOpenMobileSidebar: () => void;
  /** Dynamic header opacity from scroll progress (0.5 → 0.92) */
  headerOpacity?: MotionValue<number>;
  /** Dynamic border opacity from scroll progress (0 → 1) */
  borderOpacity?: MotionValue<number>;
};

function useHeaderStyle(
  headerOpacity?: MotionValue<number>,
  borderOpacity?: MotionValue<number>
): MotionStyle | undefined {
  // Hooks must be called unconditionally — pass fallback values when not scroll-linked
  const bg = useMotionTemplate`hsla(0, 0%, 100%, ${headerOpacity ?? 0.8})`;
  const border = useMotionTemplate`hsla(36, 18%, 89%, ${borderOpacity ?? 0.7})`;

  if (!headerOpacity) return undefined;
  // Type assertion is safe: useMotionTemplate returns MotionValue<string>,
  // which is assignable to MotionStyle properties
  return {
    background: bg,
    borderBottomColor: border,
  } as unknown as MotionStyle;
}

export function Header({ onOpenMobileSidebar, headerOpacity, borderOpacity }: HeaderProps) {
  const userRole = useUIStore((state) => state.userRole);
  const setUserRole = useUIStore((state) => state.setUserRole);
  const openRenfortModal = useUIStore((state) => state.openRenfortModal);
  const openPublishModal = useUIStore((state) => state.openPublishModal);

  const dynamicStyle = useHeaderStyle(headerOpacity, borderOpacity);

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-40 backdrop-blur-xl border-b",
        !dynamicStyle && "bg-white/80 backdrop-blur-md border-border/70"
      )}
      style={dynamicStyle}
    >
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">

        {/* Left — mobile menu */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-xl hover:bg-muted"
            aria-label="Ouvrir le menu"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
          {/* Mobile logo mark */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="relative h-7 w-7 shrink-0">
              <div className="absolute top-0 right-0 h-3 w-3 rounded-[2px] bg-[hsl(var(--logo-gray))]" />
              <div className="absolute bottom-0 left-0 h-3 w-3 rounded-[2px] bg-[hsl(var(--coral))]" />
              <div className="absolute top-0 left-0 h-3 w-3 rounded-[2px] bg-[hsl(var(--logo-gray)/0.5)]" />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-[2px] bg-[hsl(var(--coral)/0.5)]" />
            </div>
            <span className="text-sm font-bold font-[family-name:var(--font-display)]">Les Extras</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl hover:bg-muted"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[hsl(var(--coral))] ring-2 ring-white"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl border border-border p-0 shadow-card-md">
              <div className="px-4 py-3 border-b border-border/60">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</p>
              </div>
              <div className="p-2">
                <DropdownMenuItem className="rounded-xl py-3 px-3 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl icon-teal flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">Nouveau message</span>
                      <span className="text-xs text-muted-foreground">Jean Dupont vous a envoyé un message.</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <div className="border-t border-border/60 p-2">
                <DropdownMenuItem className="justify-center text-xs text-[hsl(var(--teal))] font-medium rounded-xl py-2">
                  Voir toutes les notifications
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Role badge */}
          <Badge
            variant="outline"
            className="hidden sm:inline-flex text-[11px] rounded-full border-border px-2.5"
          >
            {userRole === "CLIENT" ? "🏥 Établissement" : "👤 Freelance"}
          </Badge>

          {/* Demo role switcher */}
          <Select value={userRole || undefined} onValueChange={(v) => setUserRole(v as UserRole)}>
            <SelectTrigger className="w-[120px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="CLIENT">Établissement</SelectItem>
              <SelectItem value="TALENT">Freelance</SelectItem>
            </SelectContent>
          </Select>

          {/* Primary CTA */}
          {userRole === "CLIENT" ? (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
              <Button
                onClick={openRenfortModal}
                variant="coral"
                size="sm"
                className="min-h-[36px] gap-2 rounded-xl font-semibold text-[13px] shadow-glow-coral"
              >
                <Siren className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">RENFORT</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
              <Button
                variant="teal-soft"
                onClick={openPublishModal}
                size="sm"
                className="min-h-[36px] rounded-xl font-semibold text-[13px]"
              >
                <span className="hidden sm:inline">➕ PUBLIER</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

