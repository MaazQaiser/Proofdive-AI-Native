"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    { href: homeHref, label: "Home", icon: HomeIcon },
    { href: "/training", label: "Training", icon: TrainingIcon },
    { href: "/storyboard", label: "Storyboard", icon: StoryboardIcon },
    { href: "/interview", label: "Mock Interview", icon: InterviewIcon },
    { href: "/profile", label: "Profile", icon: ProfileIcon },
    { href: "/onboarding", label: "Add new role", icon: PlusIcon },
  ] as const;

  return (
    <nav aria-label="Coach shortcuts" className="fixed left-3 top-1/2 z-50 -translate-y-1/2 print:hidden">
      <div className="flex flex-col gap-0">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-label={it.label}
              className={cn(
                "group relative flex w-[60px] items-center justify-center rounded-2xl p-2 transition",
                "text-gray-600 hover:bg-white/40 hover:text-gray-900 active:bg-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
              )}
            >
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-2xl",
                  "bg-white/70 border border-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur",
                  "group-hover:bg-white group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.12)]",
                )}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2",
                  "whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-overline text-white shadow-lg",
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

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 21.5V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrainingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4.5 6.5h9a2 2 0 0 1 2 2v11.5H6.5a2 2 0 0 0-2 2V6.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5h2.2a1.8 1.8 0 0 1 1.8 1.8v9.7a2 2 0 0 0-2-2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 10h5M8 13h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StoryboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 5.5h12A1.5 1.5 0 0 1 19.5 7v10A1.5 1.5 0 0 1 18 18.5H6A1.5 1.5 0 0 1 4.5 17V7A1.5 1.5 0 0 1 6 5.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 9h3M8 12h8M8 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function InterviewIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 13.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 10.5h3M19.5 9v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
      <path d="M5 21a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 5.25v13.5M5.25 12h13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
