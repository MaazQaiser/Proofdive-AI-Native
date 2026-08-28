import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/ui/logo";

/**
 * Shared chrome for Login / Signup / Forgot-password / Accept-invite pages.
 * Full-bleed split screen — form column left, brand-teal visual panel right
 * (hidden below lg) — matching the edge-to-edge layout language of the rest
 * of the product (landing, onboarding). The panel is pure CSS — tokens and
 * gradients, no raster assets — so auth pages carry no LCP image cost.
 *
 * `aside` renders inside the visual panel (e.g. the proof-record card on
 * login, the "What happens next" steps on signup). Omit it for a purely
 * decorative panel.
 */
export function AuthShell({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh w-full items-stretch bg-background">
      {/* Form column */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[52%] lg:shrink-0 lg:px-16">
        <div className="mx-auto flex w-full max-w-[420px] flex-col">
          <Link href="/" className="mb-10 self-start" aria-label="ProofDive home">
            <Logo size="xs" />
          </Link>
          {children}
        </div>
      </div>

      {/* Visual panel — brand gradient + soft shapes, all CSS */}
      <aside className="relative hidden flex-1 overflow-hidden bg-[linear-gradient(160deg,var(--brand-1000),var(--brand-800))] lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-[48px] bg-brand-700/50" />
          <div className="absolute -bottom-24 left-10 h-72 w-64 rounded-[48px] bg-white/30" />
          <div className="absolute right-24 bottom-40 h-40 w-40 rounded-[40px] bg-brand-900/60" />
        </div>
        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-6 px-10 py-16 xl:px-16">
          {aside}
        </div>
      </aside>
    </div>
  );
}
