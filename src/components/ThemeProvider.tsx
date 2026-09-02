"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  setThemePreference,
  subscribeTheme,
  type ThemePreference,
} from "@/lib/theme";

/**
 * Theme access for client components.
 *
 * There is no provider component and no context: the theme already lives in
 * an external store (`lib/theme.ts`), and <html> is already correct before
 * React mounts thanks to the head bootstrap in `layout.tsx`. A context would
 * only add a second copy of that state to keep in sync — and the read-then-
 * setState effect it needs is what makes hand-rolled theme providers flash.
 *
 * `hydrated` is false on the server and during the hydration render, so
 * controls can avoid announcing a theme they cannot know yet.
 */
export function useTheme() {
  const snapshot = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const hydrated = useSyncExternalStore(
    subscribeTheme,
    () => true,
    () => false,
  );

  const toggle = useCallback(() => {
    setThemePreference(
      document.documentElement.classList.contains("dark") ? "light" : "dark",
    );
  }, []);

  const setPreference = useCallback(
    (next: ThemePreference) => setThemePreference(next),
    [],
  );

  return { ...snapshot, hydrated, toggle, setPreference };
}
