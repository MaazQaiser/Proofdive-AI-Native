"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { scoringBadgeClass, scoringLabelForScore, scoringTextClass } from "@/lib/scoringPalette";
import { cn } from "@/lib/utils";

import { REPORT_SECTIONS, type ReportSectionId } from "./reportModel";

type Props = {
  overall: number;
  /** Set once the report has rendered — the observer must not attach to an
   *  empty loading tree (the bug that kept the old sticky bar from ever
   *  appearing). */
  ready: boolean;
  className?: string;
};

/** Where the bar comes to rest: under the app header (56px) with a gap, so it
 *  floats clear of it rather than butting against it. */
const STICK_TOP = 56 + 16;
/** The bar's own height — `p-2` around a 36px row. */
const BAR_HEIGHT = 52;
/** The line at which a section counts as "current". It must sit BELOW where
 *  an anchor jump parks a section (`scroll-mt-36`, 144px) — otherwise clicking
 *  a tab lands its section just under the line and the spy keeps the PREVIOUS
 *  tab marked, which is the one moment the mark is read most closely. */
const SPY_OFFSET = STICK_TOP + BAR_HEIGHT + 36;

/** Card chrome, deliberately the same as the report's own cards — 20px radius
 *  and the same hairline — so the bar reads as one of this page's surfaces
 *  that happens to follow you, not as browser furniture bolted to the top.
 *  Opaque enough to own its ground: content scrolls UNDER this, and a bar you
 *  can read the previous section through is a bar you cannot read. */
const BAR_CHROME =
  "rounded-[20px] border border-border/70 bg-background/85 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.28)] " +
  "backdrop-blur-[42px] supports-[backdrop-filter]:bg-background/75";

/**
 * The section nav: absent in the hero, a floating sticky bar once you leave it.
 *
 * WHY IT IS NOT THERE AT THE TOP. The first screen has one job — the title,
 * the session line, the score — and a row of seven tabs under the headline
 * competes with all of it while being useful to nobody: at the top of a report
 * there is nothing yet to navigate BACK to. So the bar earns its place by
 * being scrolled to. It appears at exactly the moment it would have stuck,
 * which is the one moment it becomes the only way back up.
 *
 * HOW IT TAKES NO SPACE. The <nav> is `sticky` and ZERO height; the bar itself
 * is absolutely positioned inside it. A sticky element reserves its own box in
 * the flow, so a 48px bar that is invisible at rest would leave a 48px hole
 * under the headline. At `h-0` there is no hole — the bar overhangs the
 * content below it, which is exactly right for something that floats over the
 * page. It stays a direct child of the content column so it spans that column
 * and can travel its full height (a sticky element can only travel within its
 * parent).
 *
 * WHAT SAYS "SHOW". A zero-height sentinel left behind at the bar's resting
 * place in the flow. Once its top crosses the stick line the bar is, by
 * definition, stuck — so the fade is driven by the same fact that pins it
 * rather than by a guessed pixel threshold.
 *
 * TWO JOBS, ONE BAR. Wayfinding for a page that runs several thousand pixels,
 * and the compact verdict: once the big score scrolls off, the number and its
 * band reappear here. The verdict sits on the RIGHT with its width always
 * reserved, so it can fade in and out without ever moving a tab.
 *
 * Scroll position rather than IntersectionObserver: the "current" section is
 * the LAST one whose top has crossed the offset line, which a single pass over
 * seven elements answers exactly; an observer would need per-section
 * thresholds tuned to section heights that vary with content.
 */
export function ReportNav({ overall, ready, className }: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<ReportSectionId>("verdict");
  const [pastVerdict, setPastVerdict] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: ReportSectionId = REPORT_SECTIONS[0].id;
      for (const s of REPORT_SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= SPY_OFFSET) current = s.id;
      }
      setActive(current);
      const verdict = document.getElementById("verdict");
      setPastVerdict(verdict ? verdict.getBoundingClientRect().bottom < SPY_OFFSET : false);
      const sentinel = sentinelRef.current;
      setStuck(sentinel ? sentinel.getBoundingClientRect().top <= STICK_TOP : false);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ready]);

  return (
    <>
      {/* Marks where the bar would sit in the flow, and carries the spacing the
          bar itself no longer can. */}
      <div ref={sentinelRef} aria-hidden className={cn("h-0", className)} />

      <nav
        aria-label="Report sections"
        className="sticky z-10 h-0 print:hidden"
        style={{ top: STICK_TOP }}
      >
        {/* The 16px slot between the app header and the bar is a window onto
            whatever is scrolling past, and headings sliding through a sliver
            read as a glitch. A short gradient to the page ground closes it:
            content dissolves into the header instead of being sheared by it.
            It fades with the bar, so nothing is painted over the hero. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 -top-4 h-4 bg-gradient-to-b from-background to-transparent",
            "motion-safe:transition-opacity motion-safe:duration-200",
            stuck ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          /* `inert` and not just `pointer-events-none`: while the bar is
             invisible its seven links must be out of the tab order too. */
          inert={!stuck}
          className={cn(
            BAR_CHROME,
            "absolute inset-x-0 top-0 flex items-center gap-3 p-2",
            "motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out",
            stuck ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
          )}
        >
          <ul className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {REPORT_SECTIONS.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full px-3 text-caption transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      /* A filled pill rather than the old underline: on a bar
                         with 20px corners an underline flush to the bottom edge
                         gets clipped by the radius at either end. */
                      isActive
                        ? "bg-primary/10 font-semibold text-extended-blue"
                        : "text-text-secondary hover:bg-muted hover:text-text-primary",
                    )}
                  >
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* The compact verdict. Width is always reserved, so it fades without
              nudging a single tab. */}
          <div
            aria-hidden={!pastVerdict}
            className={cn(
              /* Hidden on narrow screens: the bar is only as wide as the
                 content column, and there the seven tabs need every pixel
                 more than a score the reader passed two seconds ago. */
              "hidden shrink-0 items-baseline gap-2 border-l border-border/70 pl-3 pr-1 sm:flex",
              "transition-opacity duration-200",
              pastVerdict ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <span className={cn("text-body-sm font-semibold", scoringTextClass(overall))}>
              {overall.toFixed(1)}
              <span className="text-text-secondary/70"> / 5</span>
            </span>
            <Badge variant="outline" className={scoringBadgeClass(overall)}>
              {scoringLabelForScore(overall)}
            </Badge>
          </div>
        </div>
      </nav>
    </>
  );
}
