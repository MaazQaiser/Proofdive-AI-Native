/** An explicit user choice, or `system` when they have not made one. */
export type ThemePreference = "light" | "dark" | "system";

/** What is actually painted right now. */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "proofdive.theme.v1";

export type ThemeSnapshot = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
};

/**
 * Applied to <html>. The class drives our tokens; `color-scheme` drives the
 * things CSS cannot reach — native scrollbars, form controls, and the
 * browser's own canvas — which is what stops a dark page from showing a
 * white scrollbar gutter. `data-theme` is there for anything that needs to
 * read the theme without matching on a class name.
 */
export function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  root.dataset.theme = resolved;
}

function systemTheme(): ResolvedTheme {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref === "system" ? systemTheme() : pref;
}

function readPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : "system";
  } catch {
    return "system";
  }
}

/* ------------------------------------------------------------------------
   A tiny external store rather than provider state.

   Theme lives outside React (localStorage, an OS media query, and possibly
   another tab), so `useSyncExternalStore` is the honest way to read it: no
   read-then-setState effect, and no hydration mismatch, because React
   renders the server snapshot first and swaps to the client's on commit.
   ------------------------------------------------------------------------ */

const SERVER_SNAPSHOT: ThemeSnapshot = {
  preference: "system",
  resolved: "light",
};

/** Cached so `getSnapshot` is referentially stable between changes — React
 * re-renders forever if it is not. */
let snapshot: ThemeSnapshot | null = null;
const listeners = new Set<() => void>();

function computeSnapshot(): ThemeSnapshot {
  const preference = readPreference();
  return { preference, resolved: resolveTheme(preference) };
}

function refresh() {
  const next = computeSnapshot();
  if (
    snapshot &&
    snapshot.preference === next.preference &&
    snapshot.resolved === next.resolved
  ) {
    return;
  }
  snapshot = next;
  listeners.forEach((l) => l());
}

export function getThemeSnapshot(): ThemeSnapshot {
  if (!snapshot) snapshot = computeSnapshot();
  return snapshot;
}

export function getServerThemeSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeTheme(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) {
    // While the preference is `system` the OS decides; once it is explicit,
    // `resolveTheme` ignores the media query, so this can stay subscribed.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => {
      refresh();
      applyTheme(getThemeSnapshot().resolved);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      refresh();
      applyTheme(getThemeSnapshot().resolved);
    };
    mq.addEventListener("change", onMedia);
    window.addEventListener("storage", onStorage);
    teardown = () => {
      mq.removeEventListener("change", onMedia);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      teardown?.();
      teardown = null;
    }
  };
}

let teardown: (() => void) | null = null;

let switchTimer: ReturnType<typeof setTimeout> | null = null;

export function setThemePreference(next: ThemePreference) {
  try {
    if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* private mode — the choice just will not persist */
  }

  // Arm the one-off crossfade (see `html.theme-switching` in globals.css)
  // BEFORE flipping the class, and disarm it once the fade is done, so the
  // transition never lingers on ordinary hover/focus.
  const root = document.documentElement;
  root.classList.add("theme-switching");
  if (switchTimer) clearTimeout(switchTimer);
  switchTimer = setTimeout(() => {
    root.classList.remove("theme-switching");
    switchTimer = null;
  }, 260);

  refresh();
  applyTheme(getThemeSnapshot().resolved);
}

/**
 * Runs before first paint, inlined into the document head. Stringified
 * rather than imported so it stays one blocking statement with no module
 * graph. Mirrors `applyTheme` + `readPreference` above — a second, drifting
 * implementation here is exactly how themes end up flashing.
 */
export const THEME_BOOTSTRAP = `(function(){try{var k="${THEME_STORAGE_KEY}",v=localStorage.getItem(k),m=window.matchMedia("(prefers-color-scheme: dark)").matches,d=v==="dark"||(v!=="light"&&m),r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";r.dataset.theme=d?"dark":"light";}catch(e){}})();`;
