"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CircleUser,
  GraduationCap,
  Home,
  LogOut,
  Plus,
  UserCheck,
} from "lucide-react";

import { seedFinanceDemoStorage } from "@/app/storyboard/crafting/financeFpaDemoFixture";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { readJson, writeJson } from "@/lib/storage";

import { cn } from "@/components/cn";

function coachHomeHref(_pathname: string | null) {
  // Always return plain `/coach` so welcome/roadmap/final localStorage state
  // survives tab changes. Do not force `?journey=1` — that wiped suggested roadmap.
  return "/coach";
}

/** A nav slot that is a Link normally, and a button when selecting it has to
 *  run something (seed the demo, flip the mode) before the navigation. */
function NavTarget({
  href,
  onDemoSelect,
  children,
  ...rest
}: React.ComponentProps<"button"> & { href: string; onDemoSelect?: () => void }) {
  if (!onDemoSelect) {
    const { className, "aria-label": ariaLabel } = rest;
    return (
      <Link href={href} aria-label={ariaLabel} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onDemoSelect} {...rest}>
      {children}
    </button>
  );
}

export function CoachFloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const homeHref = coachHomeHref(pathname);
  /* Read after mount so the server render and the first client render agree;
   * the cost is one frame with neither Storyboard icon lit. */
  const [demoMode, setDemoMode] = useState(false);
  useEffect(() => {
    setDemoMode(readJson<boolean>(StorageKeys.storyboardDemoMode) === true);
  }, [pathname]);
  /* Demo scaffolding: two Storyboard entries. The top one runs the pre-filled
   * Finance persona (`?demo=1`), the bottom one is the product as any user
   * gets it (`?demo=0` explicitly turns the demo back off, so the two icons
   * are a real toggle rather than one of them being a trap door). */
  const items = [
    { href: homeHref, label: "Home", icon: Home, base: "/coach", demo: undefined },
    { href: "/training", label: "Training", icon: GraduationCap, base: "/training", demo: undefined },
    {
      href: "/storyboard",
      label: "Storyboard — Finance demo",
      icon: BookOpen,
      base: "/storyboard",
      demo: true,
    },
    {
      href: "/storyboard",
      label: "Storyboard",
      icon: BookOpen,
      base: "/storyboard",
      demo: false,
    },
    { href: "/interview", label: "Mock Interview", icon: UserCheck, base: "/interview", demo: undefined },
    { href: "/profile", label: "Profile", icon: CircleUser, base: "/profile", demo: undefined },
    { href: "/onboarding", label: "Add new role", icon: Plus, base: "/onboarding", demo: undefined },
  ] as const;

  return (
    <nav
      aria-label="Coach shortcuts"
      data-slot="coach-floating-nav"
      className="pointer-events-none fixed inset-y-0 left-0 z-50 flex w-16 items-center justify-center print:hidden"
    >
      <div className="pointer-events-auto flex flex-col gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          const onBase =
            it.base === "/interview"
              ? pathname === "/interview" ||
                Boolean(pathname?.startsWith("/interview/")) ||
                pathname === "/report" ||
                Boolean(pathname?.startsWith("/report/"))
              : pathname === it.base || Boolean(pathname?.startsWith(`${it.base}/`));
          // Two entries share /storyboard, so which one is lit depends on the
          // mode, not the path.
          const isActive =
            it.demo === undefined ? onBase : onBase && it.demo === demoMode;
          return (
            <NavTarget
              key={it.label}
              href={it.href}
              onDemoSelect={
                it.demo === undefined
                  ? undefined
                  : () => {
                      // Seed BEFORE navigating and from outside StoryboardAgent,
                      // so the write is not undone by that component hydrating
                      // its own copy of the same keys.
                      //
                      // Only when ENTERING the demo. This icon is the lit one
                      // for the whole demo, so it is what a presenter clicks to
                      // navigate back to the Storyboard — re-seeding there would
                      // wipe the run they are in the middle of showing. The
                      // deliberate restart is default icon → demo icon.
                      if (it.demo && !demoMode) seedFinanceDemoStorage();
                      writeJson(StorageKeys.storyboardDemoMode, it.demo === true);
                      window.location.href = "/storyboard";
                    }
              }
              aria-label={it.label}
              className={cn(
                "group relative grid size-11 place-items-center rounded-full p-1 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-extended-dark-cyan hover:bg-primary/10",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span
                className={cn(
                  "pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2",
                  "whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-overline text-background",
                  "opacity-0 translate-x-1 transition",
                  "group-hover:opacity-100 group-hover:translate-x-0",
                )}
                role="tooltip"
              >
                {it.label}
              </span>
            </NavTarget>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Sign out"
        onClick={() => router.push("/login")}
        className={cn(
          "group pointer-events-auto absolute bottom-6 left-1/2 grid size-11 -translate-x-1/2 place-items-center rounded-full p-1",
          "bg-transparent text-extended-dark-cyan transition-colors hover:bg-primary/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        )}
      >
        <LogOut className="h-5 w-5" aria-hidden />
        <span
          className={cn(
            "pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2",
            "whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-overline text-background",
            "opacity-0 translate-x-1 transition",
            "group-hover:opacity-100 group-hover:translate-x-0",
          )}
          role="tooltip"
        >
          Sign out
        </span>
      </button>
    </nav>
  );
}
