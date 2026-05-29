"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import CommandPalette from "@/components/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

type ShellContextType = {
  openCommandPalette: () => void;
};

const ShellContext = createContext<ShellContextType>({
  openCommandPalette: () => {},
});

export function useShell() {
  return useContext(ShellContext);
}

export function ShellProvider({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useKeyboardShortcuts([
    { key: "k", meta: true, handler: () => setPaletteOpen((p) => !p) },
  ]);

  return (
    <ShellContext.Provider value={{ openCommandPalette: () => setPaletteOpen(true) }}>
      {children}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </ShellContext.Provider>
  );
}
