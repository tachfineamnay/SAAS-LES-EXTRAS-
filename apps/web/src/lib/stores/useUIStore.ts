"use client";

import { create } from "zustand";

export type UserRole = "CLIENT" | "TALENT";

type UIState = {
  isSOSModalOpen: boolean;
  isPublishModalOpen: boolean;
  userRole: UserRole;
  openSOSModal: () => void;
  closeSOSModal: () => void;
  openPublishModal: () => void;
  closePublishModal: () => void;
  setUserRole: (role: UserRole) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isSOSModalOpen: false,
  isPublishModalOpen: false,
  userRole: "CLIENT",
  openSOSModal: () => set({ isSOSModalOpen: true }),
  closeSOSModal: () => set({ isSOSModalOpen: false }),
  openPublishModal: () => set({ isPublishModalOpen: true }),
  closePublishModal: () => set({ isPublishModalOpen: false }),
  setUserRole: (role) => set({ userRole: role }),
}));
