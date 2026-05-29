"use client";

import { useEffect, useRef } from "react";

export type Shortcut = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  enabled?: boolean;
  description?: string;
  category?: string;
};

const metaKey =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    ? "meta"
    : "ctrl";

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const shortcutMap = useRef(new Map<string, Shortcut>());

  useEffect(() => {
    shortcutMap.current.clear();
    for (const s of shortcuts) {
      const key = `${s.meta ? "meta+" : ""}${s.ctrl ? "ctrl+" : ""}${s.shift ? "shift+" : ""}${s.alt ? "alt+" : ""}${s.key}`;
      shortcutMap.current.set(key, s);
    }
  }, [shortcuts]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const prefix = `${e.metaKey ? "meta+" : ""}${e.ctrlKey ? "ctrl+" : ""}${e.shiftKey ? "shift+" : ""}${e.altKey ? "alt+" : ""}`;
      const key = e.key.toLowerCase();
      const combo = `${prefix}${key}`;

      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const [comboKey, shortcut] of shortcutMap.current) {
        if (comboKey !== combo) continue;
        if (isInput && shortcut.key !== "Escape") continue;
        if (shortcut.enabled === false) continue;

        e.preventDefault();
        e.stopPropagation();
        shortcut.handler();
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

export function shortcutLabel(shortcut: {
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
}): string {
  const parts: string[] = [];
  if (shortcut.meta) parts.push(metaKey === "meta" ? "⌘" : "Ctrl");
  if (shortcut.ctrl && metaKey !== "meta") parts.push("Ctrl");
  if (shortcut.shift) parts.push("⇧");
  if (shortcut.alt) parts.push("⌥");
  parts.push(shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
  return parts.join(" ");
}
