"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Theme switch — one button that flips to the other mode.
 *
 * Deliberately not a three-way light/dark/system control: onboarding is a
 * focused, low-chrome moment and a segmented switcher would read as a
 * setting to configure rather than a comfort control. Following the OS is
 * still the default (the provider starts at `system`); pressing this is what
 * turns it into an explicit choice.
 *
 * It shows the mode it will switch TO, so the icon is a promise about the
 * next click rather than a label for the current state. Both icons are
 * mounted and swapped by the `dark:` variant, which keeps the rendered
 * markup theme-independent — no hydration mismatch against the pre-paint
 * bootstrap, and the crossfade comes free.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggle, hydrated } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        hydrated
          ? resolved === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Switch theme"
      }
      title={
        hydrated
          ? resolved === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Switch theme"
      }
      className={cn(
        "group relative grid size-9 shrink-0 place-items-center rounded-full",
        "text-text-secondary transition-colors duration-200",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      {/* Both mounted, cross-faded: an unmount/mount would pop, and the tiny
          counter-rotation makes the swap feel like one object turning over. */}
      <Moon
        aria-hidden
        className={cn(
          "absolute size-[18px] transition-all duration-300 ease-out",
          "rotate-0 scale-100 opacity-100",
          "dark:-rotate-90 dark:scale-75 dark:opacity-0",
          "motion-reduce:transition-none",
        )}
      />
      <Sun
        aria-hidden
        className={cn(
          "absolute size-[18px] transition-all duration-300 ease-out",
          "rotate-90 scale-75 opacity-0",
          "dark:rotate-0 dark:scale-100 dark:opacity-100",
          "motion-reduce:transition-none",
        )}
      />
    </button>
  );
}
