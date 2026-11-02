import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { GlassPane } from "@/components/shared/GlassPane";
import { cn } from "@/lib/utils";

export type AuthStep = {
  label: string;
  detail: string;
  /** Behind the reader: the numeral becomes a check. */
  done?: boolean;
};

/**
 * The auth panel's "what happens next": a short sequence on a pane of the
 * website's glass, floating on the panel's water. Signup shows onboarding's
 * four steps; forgot-password shows how a reset goes, and ticks its first step
 * once the link is sent, so the panel follows the page instead of decorating it.
 *
 * Sized a step under the form it sits beside (1.75rem headline, 16px labels,
 * 14px detail): the form is on its own glass now and is the first thing read.
 * Ink is the panel's own teal (extended-green-blue), not the page's grey,
 * which falls under AA on the water: labels at full strength, everything else
 * at 80% — the lowest step that clears 4.5:1 at the gradient's darkest end in
 * both themes (70% gave 3.99 in light). Numbering is content here — these are
 * real sequences — and the list itself carries the order for screen readers.
 */
export function AuthSteps({
  eyebrow,
  title,
  steps,
  chip,
  footnote,
}: {
  eyebrow: string;
  title: string;
  steps: AuthStep[];
  /** One fact pinned to the pane's corner (an icon and a few words). */
  chip?: ReactNode;
  footnote?: ReactNode;
}) {
  const last = steps.length - 1;
  const current = steps.findIndex((s) => !s.done);

  return (
    <div className="w-full max-w-[440px]">
      <p className="text-overline uppercase text-extended-green-blue/80">{eyebrow}</p>
      <h2 className="mt-3 font-gilroy text-[1.75rem] font-bold leading-tight tracking-[-0.03em] text-extended-green-blue [text-wrap:balance]">
        {title}
      </h2>

      <div className="relative mt-9">
        <GlassPane lean className="px-7 pb-7 pt-8">
          <ol className="flex flex-col">
            {steps.map((step, i) => (
              <li
                key={step.label}
                aria-current={i === current && current > 0 ? "step" : undefined}
                className="relative grid grid-cols-[2rem_1fr] gap-x-3 pb-6 last:pb-0"
              >
                {/* the rail, from under this marker to the next */}
                {i < last ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-1 left-[0.55rem] top-7 w-px",
                      step.done ? "bg-extended-green-blue/45" : "bg-extended-green-blue/20",
                    )}
                  />
                ) : null}
                <span
                  aria-hidden
                  className="flex h-6 items-center font-gilroy text-body-sm font-semibold tabular-nums text-extended-green-blue/80"
                >
                  {step.done ? (
                    <Check className="size-4 text-extended-green-blue" strokeWidth={2.5} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <div className="min-w-0">
                  <h3 className="text-body-sm font-semibold leading-6 text-extended-green-blue">
                    {step.label}
                    {step.done ? <span className="sr-only"> (done)</span> : null}
                  </h3>
                  <p className="mt-0.5 text-caption text-extended-green-blue/80">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </GlassPane>

        {chip ? (
          <p className="glass-pane absolute -top-4 right-6 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-caption font-medium text-extended-green-blue">
            {chip}
          </p>
        ) : null}
      </div>

      {footnote ? (
        <p className="mt-8 max-w-[42ch] text-caption text-extended-green-blue/80">{footnote}</p>
      ) : null}
    </div>
  );
}
