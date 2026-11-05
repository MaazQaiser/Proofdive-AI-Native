import Link from "next/link";
import type { ReactNode } from "react";

import { GlassPane } from "@/components/shared/GlassPane";
import { SeaSurface } from "@/components/shared/SeaSurface";
import { Logo } from "@/components/ui/logo";

/**
 * Shared chrome for Login / Signup / Forgot-password / Accept-invite pages:
 * the form alone, on one pane of the website's glass, on the page's centre
 * line. The client chose this over a split screen with a panel beside the
 * form (and over an open layout with no card): one thing on the page, and the
 * room round it is the design, so nothing else is added.
 *
 * The page is the website's hero, the surface above the water: the logo above
 * the pane on the same line, the sky straight overhead (the site's hero light,
 * held faint), and the sea along the foot (SeaSurface), kept low so it frames
 * the page rather than competing with the form. The marketing site's "Start
 * preparing" lands here, so the visitor meets on this side of the click the
 * water they touched on that side.
 *
 * The sea is the page's only motion. Nothing answers the pointer: the page
 * once carried the pointer's wake as well, and the client took it out. The
 * pane does not lean either: a form that tips under the pointer is a worse
 * form.
 *
 * Everything is tokens, a gradient and one canvas, no raster assets, so auth
 * pages carry no LCP image cost.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background">
      {/* the sky straight overhead: the site's hero light, on the centre line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(75%_60%_at_50%_0%,var(--brand-1000),transparent_75%)]"
      />
      <SeaSurface className="absolute inset-x-0 bottom-0 -z-10 h-[clamp(56px,11vh,110px)] w-full" />

      {/* One axis: the logo, then the pane, vertically centred in the room
          above the sea. The pane's widths keep the form in a 420px column at
          every size (LinkedIn's button and its badge need it on one line). On
          a short screen the room above and below gives way and the pane may
          rest on the water, so even sign-up, the tallest, does not scroll on
          a 1366 x 768 laptop. */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-[clamp(72px,12vh,140px)] pt-8 sm:px-10 [@media(max-height:860px)]:pb-10 [@media(max-height:860px)]:pt-4">
        {/* Brand teal, as the app header (AppShell) and the website's own
            logo (#0E9AB5) have it; --primary carries the dark-theme tint. */}
        <Link href="/" className="inline-flex" aria-label="ProofDive home">
          <Logo size="xs" className="text-primary" />
        </Link>
        <GlassPane className="mt-8 w-full max-w-[500px] px-6 py-8 sm:px-10 sm:py-10 [@media(max-height:860px)]:mt-6 sm:[@media(max-height:860px)]:py-6">
          {children}
        </GlassPane>
      </div>
    </div>
  );
}
