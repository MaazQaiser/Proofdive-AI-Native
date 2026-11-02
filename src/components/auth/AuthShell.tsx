import Link from "next/link";
import type { ReactNode } from "react";

import { GlassPane } from "@/components/shared/GlassPane";
import { SeaSurface } from "@/components/shared/SeaSurface";
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
 * The page itself is the website's hero, the surface above that water: the
 * logo where the site's header keeps it (top left), the form on a pane of the
 * site's glass, a breath of sky above, and the sea across the page's foot
 * (SeaSurface) — the light page becoming water as it goes down, exactly as
 * the site's first screen does before the dive. The panel is a window laid on
 * that surface: inset from the edges and rounded, the sea showing round it. The form's pane does not lean:
 * a form that tips under the pointer while someone types is a worse form.
 *
 * `aside` renders inside the panel, above the water (the readiness preview on
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
    <div className="relative isolate flex min-h-dvh w-full items-stretch overflow-hidden bg-background">
      {/* The page's own ground, under both halves: a breath of sky — the site's
          hero light, coming from the top left where its sun sits, held faint
          and gone before the window, so the window stands on plain page — and
          the sea across the whole foot, under the form and round the window. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(110%_70%_at_0%_0%,var(--brand-1000),transparent_70%)] opacity-80"
      />
      <SeaSurface className="absolute inset-x-0 bottom-0 -z-10 h-[clamp(112px,22vh,220px)] w-full" />

      {/* The surface: the logo and the form on glass */}
      <div className="relative flex min-h-dvh w-full flex-col lg:w-[52%] lg:shrink-0">
        <header className="px-6 pt-6 sm:px-10 sm:pt-8">
          {/* Brand teal, as the app header (AppShell) and the website's own
              logo (#0E9AB5) have it; --primary carries the dark-theme tint. */}
          <Link href="/" className="inline-flex" aria-label="ProofDive home">
            <Logo size="xs" className="text-primary" />
          </Link>
        </header>

        {/* The card rests above the sea, and may wade into it on a short
            screen. Widths are set so the form keeps its 420px column at every
            size (LinkedIn's button and its badge need it on one line): at lg
            the column is narrowest, so the gutter and the pane's padding give
            way there rather than the form. On a short screen (a 1366 x 768
            laptop) the room above and below gives way too, and the card
            wades a little further into the sea, so the form never scrolls. */}
        <div className="flex flex-1 items-center justify-center px-4 pb-[clamp(56px,13vh,150px)] pt-8 sm:px-10 lg:px-6 xl:px-10 [@media(max-height:860px)]:pb-6 [@media(max-height:860px)]:pt-2">
          <GlassPane className="w-full max-w-[500px] px-6 py-8 sm:px-10 sm:py-10 lg:px-8 xl:px-10 sm:[@media(max-height:860px)]:py-8">
            {children}
          </GlassPane>
        </div>
      </div>

      {/* The window: the deep, set into the page rather than cut from it —
          inset from the edges and rounded, so it reads as a pane lying on the
          surface with the sea showing round its foot (a little more room
          below than around: it rests on the water). The water inside it is
          its own (WaterRipple), answering the pointer. */}
      <aside className="relative mb-10 mr-7 mt-7 hidden flex-1 overflow-hidden rounded-[32px] bg-[linear-gradient(160deg,var(--brand-1000),var(--brand-800))] shadow-[inset_0_1px_0_rgb(255_255_255/0.55),0_0_0_1px_rgb(6_44_53/0.08),0_40px_90px_-48px_rgb(7_62_76/0.55)] lg:flex dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_0_1px_rgb(255_255_255/0.06),0_40px_90px_-40px_rgb(0_0_0/0.85)]">
        <WaterRipple />
        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-6 px-10 py-16 xl:px-16">
          {aside}
        </div>
      </aside>
    </div>
  );
}
