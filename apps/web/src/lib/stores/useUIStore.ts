"use client";

import { create } from "zustand";

export type UserRole = "CLIENT" | "TALENT";

export interface UIState {
  isRenfortModalOpen: boolean;
  isPublishModalOpen: boolean;
  userRole: "CLIENT" | "TALENT" | null;
  onboardingStep: number;
  isMobileOpen: boolean;

  openRenfortModal: () => void;
  closeRenfortModal: () => void;
  openPublishModal: () => void;
  closePublishModal: () => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
  setUserRole: (role: "CLIENT" | "TALENT" | null) => void;
  setOnboardingStep: (step: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isRenfortModalOpen: false,
  isPublishModalOpen: false,
  isMobileOpen: false,
  userRole: "CLIENT",
  onboardingStep: 0,
  openRenfortModal: () => set({ isRenfortModalOpen: true }),
  closeRenfortModal: () => set({ isRenfortModalOpen: false }),
  openPublishModal: () => set({ isPublishModalOpen: true }),
  closePublishModal: () => set({ isPublishModalOpen: false }),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
  setUserRole: (role) => set({ userRole: role }),
  setOnboardingStep: (step) => set({ onboardingStep: step }),
}));
