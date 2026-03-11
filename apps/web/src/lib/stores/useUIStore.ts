"use client";

import { create } from "zustand";

export type UserRole = "CLIENT" | "TALENT";

export interface UIState {
  isRenfortModalOpen: boolean;
  isPublishModalOpen: boolean;
  isApplyModalOpen: boolean;
  applyMissionId: string | null;
  userRole: "CLIENT" | "TALENT" | null;
  onboardingStep: number;
  isMobileOpen: boolean;

  // SOS Renfort multi-step state
  renfortStep: number;
  renfortStepDir: number;

  openRenfortModal: () => void;
  closeRenfortModal: () => void;
  openPublishModal: () => void;
  closePublishModal: () => void;
  openApplyModal: (missionId: string) => void;
  closeApplyModal: () => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
  setUserRole: (role: "CLIENT" | "TALENT" | null) => void;
  setOnboardingStep: (step: number) => void;
  setRenfortStep: (step: number) => void;
  setRenfortStepDir: (dir: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isRenfortModalOpen: false,
  isPublishModalOpen: false,
  isApplyModalOpen: false,
  applyMissionId: null,
  isMobileOpen: false,
  userRole: "CLIENT",
  onboardingStep: 0,
  renfortStep: 0,
  renfortStepDir: 1,

  openRenfortModal: () => set({ isRenfortModalOpen: true, renfortStep: 0, renfortStepDir: 1 }),
  closeRenfortModal: () => set({ isRenfortModalOpen: false, renfortStep: 0 }),
  openPublishModal: () => set({ isPublishModalOpen: true }),
  closePublishModal: () => set({ isPublishModalOpen: false }),
  openApplyModal: (missionId) => set({ isApplyModalOpen: true, applyMissionId: missionId }),
  closeApplyModal: () => set({ isApplyModalOpen: false, applyMissionId: null }),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
  setUserRole: (role) => set({ userRole: role }),
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  setRenfortStep: (step) => set({ renfortStep: step }),
  setRenfortStepDir: (dir) => set({ renfortStepDir: dir }),
}));
