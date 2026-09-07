"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { scoringBadgeClass, scoringLabelForScore, scoringTextClass } from "@/lib/scoringPalette";
import { cn } from "@/lib/utils";

import { REPORT_SECTIONS, type ReportSectionId } from "./reportV2Model";

type Props = {
  overall: number;
  /** Set once the report has rendered — the observer must not attach to an
   *  empty loading tree (the bug that kept the old sticky bar from ever
   *  appearing). */
  ready: boolean;
  className?: string;
};

/** The vertical offset at which a section counts as "current": the app header
 *  (56px) plus this bar (48px) plus a little breathing room. */
const SPY_OFFSET = 56 + 48 + 16;

/**
 * Sticky section nav with a scroll-spy.
 *
 * Two jobs, one bar. It is wayfinding for a page that runs several thousand
 * pixels — every section is one click away and the current one is marked —
 * and it is the compact verdict: once the big score scrolls off, the number
 * and its band reappear here, so the result is never further than the top of
 * the viewport. Both replace the old sticky summary, which never showed.
 *
 * Scroll position rather than IntersectionObserver: the "current" section is
 * the LAST one whose top has crossed the offset line, which a single pass over
 * seven elements answers exactly; an observer would need per-section
 * thresholds tuned to section heights that vary with content.
 */
export function ReportV2Nav({ overall, ready, className }: Props) {
  const [active, setActive] = useState<ReportSectionId>("verdict");
  const [pastVerdict, setPastVerdict] = useState(false);

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
    <nav
      aria-label="Report sections"
      className={cn(
        "sticky top-14 z-10 -mx-6 border-b border-border bg-background/85 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 print:hidden",
        className,
      )}
    >
      <div className="flex h-12 items-center gap-4">
        {/* The compact verdict. Reserved width so the tabs do not shift when it
            appears; opacity, not mount, so it never flashes. */}
        <div
          aria-hidden={!pastVerdict}
          className={cn(
            "flex shrink-0 items-baseline gap-2 transition-opacity duration-200",
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

        <ul className="-mb-px flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {REPORT_SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "relative inline-flex h-12 items-center px-2.5 text-caption transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset",
                    isActive
                      ? "font-semibold text-extended-blue"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {s.label}
                  {/* Underline on the bar's own bottom rule, so the active mark
                      reads as part of the bar rather than a floating dash. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-primary transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
