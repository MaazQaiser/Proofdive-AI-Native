import { useEffect, useRef, useState } from "react";

import { readJson, writeJson } from "@/lib/storage";

/**
 * Mirrors a value in localStorage. Reads only after mount so the first
 * client render matches SSR (avoids hydration mismatch / DOM errors) and
 * we never write the default over an existing stored value before reading.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const hasLoadedFromStorage = useRef(false);

  useEffect(() => {
    const fromStorage = readJson<T>(key);
    if (fromStorage !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration sync from localStorage
      setValue(fromStorage);
    }
    hasLoadedFromStorage.current = true;
  }, [key]);

  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    writeJson(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
