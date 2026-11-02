import Link from "next/link";
import type { ReactNode } from "react";

import { WaterRipple } from "@/components/shared/WaterRipple";
import { Logo } from "@/components/ui/logo";

/**
 * Shared chrome for Login / Signup / Forgot-password / Accept-invite pages.
 * Full-bleed split screen — form column left, brand-teal panel right (hidden
 * below lg) — matching the edge-to-edge layout language of the rest of the
 * product. The panel is tokens and a gradient, no raster assets, so auth
 * pages carry no LCP image cost.
 *
 * The panel is water. The marketing site's How it works hero carries the same
 * surface, and its "Start preparing" lands here, so the visitor meets on this
 * side of the click the water they touched on that side (WaterRipple). It
 * is still until the pointer crosses it — nothing moves beside the form while
 * someone types — and it is the panel's only texture: the rounded shapes that
 * used to sit here would have been a second ambient signal on one screen.
 *
 * `aside` renders inside the panel, above the water (the proof-record card on
 * login, the four onboarding steps on signup). Omit it for a quiet panel.
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

      {/* The panel — brand gradient, with the water on it */}
      <aside className="relative hidden flex-1 overflow-hidden bg-[linear-gradient(160deg,var(--brand-1000),var(--brand-800))] lg:flex">
        <WaterRipple />
        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-6 px-10 py-16 xl:px-16">
          {aside}
        </div>
      </aside>
    </div>
  );
}
