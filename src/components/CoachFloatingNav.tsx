"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CircleUser, GraduationCap, Home, Plus, UserCheck } from "lucide-react";

import { cn } from "@/components/cn";

function coachHomeHref(pathname: string | null) {
  if (pathname === "/coach" || pathname?.startsWith("/coach/")) {
    return "/coach";
  }
  if (pathname == null) return "/coach?journey=1";
  if (pathname === "/interview" || pathname.startsWith("/interview/")) {
    return "/coach?journey=1";
  }
  if (pathname.startsWith("/report")) {
    return "/coach?journey=1";
  }
  return "/coach?journey=1";
}

export function CoachFloatingNav() {
  const pathname = usePathname();
  const homeHref = coachHomeHref(pathname);
  const items = [
    { href: homeHref, label: "Home", icon: Home, base: "/coach" },
    { href: "/training", label: "Training", icon: GraduationCap, base: "/training" },
    { href: "/storyboard", label: "Storyboard", icon: BookOpen, base: "/storyboard" },
    { href: "/interview", label: "Mock Interview", icon: UserCheck, base: "/interview" },
    { href: "/profile", label: "Profile", icon: CircleUser, base: "/profile" },
    { href: "/onboarding", label: "Add new role", icon: Plus, base: "/onboarding" },
  ] as const;

  return (
    <nav aria-label="Coach shortcuts" className="fixed left-3 top-1/2 z-50 -translate-y-1/2 print:hidden">
      <div className="flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = pathname === it.base || Boolean(pathname?.startsWith(`${it.base}/`));
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-label={it.label}
              className={cn(
                "group relative flex w-[60px] items-center justify-center rounded-2xl p-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
            >
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full p-1 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-primary hover:bg-muted",
                )}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2",
                  "whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-overline text-background shadow-lg",
                  "opacity-0 translate-x-1 transition",
                  "group-hover:opacity-100 group-hover:translate-x-0",
                )}
                role="tooltip"
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

