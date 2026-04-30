import { useEffect, useState } from "react";

import { readJson, writeJson } from "@/lib/storage";

/**
 * Mirrors a value in localStorage. Reads only after mount so the first
 * client render matches SSR (avoids hydration mismatch) and never writes
 * the default value over existing stored data.
 *
 * Bug fix: uses a `useState` flag for hydration (not `useRef`) so that the
 * write effect is deferred to the re-render where `value` already holds the
 * loaded value. Using a ref caused the write effect to fire in the same
 * render cycle as the read effect — with the stale initial value in its
 * closure — corrupting stored data with `null` on every page mount.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [hydrated, setHydrated] = useState(false);
  const [value, setValue] = useState<T>(initialValue);

  // One-time read from localStorage after mount.
  useEffect(() => {
    const fromStorage = readJson<T>(key);
    if (fromStorage !== null) {
      setValue(fromStorage);
    }
    setHydrated(true);
  }, [key]);

  // Write to localStorage only after the initial read has completed and
  // the component has re-rendered with the hydrated value.
  useEffect(() => {
    if (!hydrated) return;
    writeJson(key, value);
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}
