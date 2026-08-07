"use client";

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

import { cn } from "@/components/cn";

function coachHomeHref(_pathname: string | null) {
  // Always return plain `/coach` so welcome/roadmap/final localStorage state
  // survives tab changes. Do not force `?journey=1` — that wiped suggested roadmap.
  return "/coach";
}

export function CoachFloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
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
    <nav
      aria-label="Coach shortcuts"
      data-slot="coach-floating-nav"
      className="pointer-events-none fixed inset-y-0 left-0 z-50 flex w-16 items-center justify-center print:hidden"
    >
      <div className="pointer-events-auto flex flex-col gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive =
            it.base === "/interview"
              ? pathname === "/interview" ||
                Boolean(pathname?.startsWith("/interview/")) ||
                pathname === "/report" ||
                Boolean(pathname?.startsWith("/report/"))
              : pathname === it.base || Boolean(pathname?.startsWith(`${it.base}/`));
          return (
            <Link
              key={it.href}
              href={it.href}
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
            </Link>
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
