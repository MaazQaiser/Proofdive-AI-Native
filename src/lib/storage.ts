export type Stored<T> = { v: 1; updatedAt: string; value: T };

export function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

