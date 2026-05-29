"use client";

import { create } from "zustand";

type SidebarState = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  setCollapsed: (collapsed) => set({ collapsed }),
}));

type CommandPaletteState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

type PanelState = {
  rightPanel:
    | { type: "notification" }
    | { type: "detail"; id: string }
    | null;
  setRightPanel: (panel: PanelState["rightPanel"]) => void;
  closeRightPanel: () => void;
};

export const usePanelStore = create<PanelState>((set) => ({
  rightPanel: null,
  setRightPanel: (rightPanel) => set({ rightPanel }),
  closeRightPanel: () => set({ rightPanel: null }),
}));

type ModalState = {
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
  modalData: Record<string, unknown>;
  setModalData: (data: Record<string, unknown>) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  modalData: {},
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null, modalData: {} }),
  setModalData: (data) => set({ modalData: data }),
}));

type ThemeState = {
  theme: "dark" | "light" | "system";
  setTheme: (theme: "dark" | "light" | "system") => void;
  resolved: "dark" | "light";
  setResolved: (resolved: "dark" | "light") => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  resolved: "dark",
  setResolved: (resolved) => set({ resolved }),
}));

type NavigationState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  recentPages: string[];
  addRecentPage: (path: string) => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  recentPages: [],
  addRecentPage: (path) =>
    set((s) => ({
      recentPages: [path, ...s.recentPages.filter((p) => p !== path)].slice(
        0,
        10,
      ),
    })),
}));
