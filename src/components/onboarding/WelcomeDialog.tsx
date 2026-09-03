"use client";

import { ArrowRight, BookOpen, Gauge, UserCheck, type LucideIcon } from "lucide-react";

import { WelcomeAmbience } from "@/components/onboarding/WelcomeAmbience";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";

/**
 * The three rows are the product's actual loop, in the order the user will
 * walk it, and each icon is the one that will be sitting in the left rail from
 * the next screen on — so the list teaches the navigation rather than
 * decorating the modal. Bold carries the module name, because the name is the
 * thing worth remembering; the rest is one clause of plain explanation.
 */
const HOW_IT_WORKS: Array<{ icon: LucideIcon; name: string; detail: string }> = [
  {
    icon: BookOpen,
    name: "Storyboard",
    detail: "real experience, turned into proof",
  },
  {
    icon: UserCheck,
    name: "Mock Interview",
    detail: "timed, adaptive follow-ups",
  },
  {
    icon: Gauge,
    name: "Report",
    detail: "scored, with what to improve next",
  },
];

/**
 * The welcome moment, as an overlay on the first step rather than a screen of
 * its own.
 *
 * Making it a dialog is what lets it be skippable and lets step 1 sit visible
 * behind it: the user can see the thing they are about to start, so the modal
 * reads as an introduction to the product rather than a gate in front of it.
 * Closing it — CTA, X, Escape, or the scrim — leaves them exactly on step 1,
 * and Back on step 1 brings it here again.
 *
 * The card's own background is the welcome ambience plate, masked so it fades
 * into the card surface instead of ending on an edge. That is the same
 * component (and the same two per-theme assets, and the same slow drift) the
 * full-screen version used, so the modal is lit by the brand's own light
 * rather than by a gradient invented for it.
 *
 * Alignment is deliberately not the flow's: the header block is centred, which
 * the flow never is, because a modal is a discrete object rather than part of
 * the reading column. The list under it goes back to left, as any list must.
 */
export function WelcomeDialog({
  open,
  onOpenChange,
  onStart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto overscroll-contain rounded-[28px] border-border bg-card p-0 shadow-[var(--elevation-pop)] sm:max-w-[480px]"
        /* The house scrim is black/50 + a light blur, which is right for a
           dialog you want the page to disappear behind. Here the page is the
           point — it is the step this modal introduces — so the ground is
           knocked back with the --overlay token (0.3 light / 0.62 dark) and a
           deeper blur instead: present, unreadable, not erased. */
        overlayClassName="bg-[var(--overlay)] backdrop-blur-lg"
        onOpenAutoFocus={(e) => {
          // Nothing here needs typing, and focusing the CTA on open puts a
          // focus ring on the loudest element before the user has read a word.
          e.preventDefault();
        }}
      >
        {/* Masked so the plate has no bottom edge — it becomes the card's
            light rather than a banner pasted onto it. The mask is on the
            wrapper, not the component, so the ambience keeps its own drift. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[300px] [filter:saturate(1.3)] [mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)]"
        >
          {/* Cropped to ~2.2x so the band shows the glow's core rather than
              its falloff: at 480px the uncropped plate is almost all falloff,
              which is why the full-screen version reads as light and the card
              needs the middle of it. Saturation is nudged for the same reason
              — the plate was tuned to sit behind a whole page. */}
          <WelcomeAmbience plateClassName="bg-[length:220%_auto]" />
        </div>

        <div className="relative flex flex-col px-7 pt-9 pb-7">
          <Logo size="xs" className="mx-auto max-w-full" />

          {/* 28px against the full-screen version's 48px: the card's content
              box is 424px, and the longer line measures 348px here — the same
              ~80% fill the hero had in the 752px column, so the proportion
              survives the move. Hand-broken on the full stop. */}
          <DialogTitle className="mt-7 cap-baseline text-center font-gilroy text-[1.75rem] leading-[1.15] font-bold tracking-[-0.03em] text-heading-teal">
            Every answer is scored.
            <br />
            See exactly what to improve.
          </DialogTitle>

          <DialogDescription className="mx-auto mt-3 max-w-[24rem] text-center text-body-sm leading-6 text-text-primary/75">
            You bring the real experience — we hold it to the four
            Success&nbsp;Drivers.
          </DialogDescription>

          <div className="mt-8">
            <p className="text-overline font-medium tracking-wide text-text-secondary uppercase">
              How it works
            </p>
            <ul className="mt-3.5 flex flex-col gap-3">
              {HOW_IT_WORKS.map(({ icon: Icon, name, detail }) => (
                <li key={name} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-text-primary"
                  >
                    <Icon className="size-[18px]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 text-body-sm leading-6 text-text-primary/85">
                    <span className="font-semibold text-text-primary">{name}</span> — {detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full width because in a 424px card a left-hugging button leaves a
              dead half-row; the trailing arrow and the brand-tinted lift are
              the flow's own CTA treatment, unchanged. */}
          <Button
            type="button"
            onClick={onStart}
            className="mt-8 h-11 w-full rounded-md text-body-sm font-medium shadow-[0_4px_16px_-4px_rgba(14,154,181,0.55)] dark:shadow-[0_6px_20px_-6px_rgba(0,0,0,0.75)]"
          >
            Let&apos;s get started
            <ArrowRight />
          </Button>

          <p className="mt-3 text-center text-caption text-text-secondary">
            Setting up takes about a minute.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
