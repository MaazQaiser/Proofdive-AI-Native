"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The coach's brief — the block that sits above the question.
 *
 * ONE JOB: why this question is being asked. It never says what to type; that
 * is the composer hint's job, ~700px lower, at the moment you type. The two
 * surfaces are one coach at two moments, not two coaches (see the note on
 * `composerHint` in StoryboardAgent).
 *
 * NO BOX, ONE RULE. This was a filled, fully-enclosed plate, then a band
 * bracketed top and bottom. It is now a single hairline UNDER the block and
 * nothing else — no fill, no radius, no side borders, no horizontal padding —
 * so the text sets flush with the question and joins the same reading column
 * instead of sitting in a container beside it. The top rule went because it had
 * nothing to separate: this block is the first thing in the column, so that
 * rule was drawing a line against the header rather than against any content.
 * One rule under the block still closes it; two only added weight.
 *
 * WHY `--brand-700`. With the fill gone and one rule left, that rule IS the
 * whole device, so it carries the block alone. Measured against the page ground
 * (`--app-ground` #F5F5F3 / #0a1013): `--border` lands at 1.15:1 light, which
 * disappears; `--brand-800` — right when it only had to edge a filled plate —
 * is 1.29:1; `--brand-700` is 1.45:1 light / 2.45:1 dark. Quiet, but a 1px line
 * running the full 752px column reads at a contrast a glyph could not, which is
 * why a rule can be this soft and still close the block. Teal rather than
 * neutral because it is the one thing here still carrying brand.
 *
 * HEIGHT IS THE CONTENT'S. No min-height and no vertical centring: the block
 * grows and shrinks with the sentence, so one line, two or four are each
 * correctly set rather than floated inside a reserved box. That reserved box
 * was the earlier design and it did buy something — the rule landed in the same
 * place on every screen — but it paid with optical padding that was only right
 * at the two-line case: a one-line brief sat centred with ~24px of unearned air
 * above and below. Fluid is the more refined answer when the copy varies, and
 * it does.
 *
 * THE SPACING IS AUTHORED AS A GROUP, not per element: 20px above the badge,
 * 10px badge-to-sentence (the badge is 24px and the sentence sets on 24px
 * leading, so 10px reads as one unit rather than two stacked ones), 20px
 * sentence-to-rule, then 32px rule-to-question. The rule sits closer to the
 * text it belongs to than to the question beneath it, which is what makes it
 * read as this block's floor rather than as a divider marooned between two
 * things. None of those four numbers depends on how tall the sentence is, so
 * the balance holds at any line count.
 *
 * `max-w-[62ch]` keeps the measure readable as the block grows: a long note
 * takes another line rather than running the full column width.
 *
 * WHY IT DOESN'T OUT-RANK THE QUESTION. Rank is scale, ink and weight, and the
 * brief concedes all three: 16px against the question's 40px,
 * `--text-primary/80` (10.11:1 light / 10.63:1 dark) against the question's
 * `--heading-teal` at 10.32:1 / 13.17:1, and regular against its medium.
 *
 * MOTION IS ON THE SENTENCE, NOT THE BLOCK. The `key` is on the `<p>` and it is
 * the sentence text itself, so the rule never re-animates and two consecutive
 * screens carrying the same sentence produce ZERO motion: the brief visibly
 * holds still while the question retypes above it.
 */
export function CoachBrief({
  note,
  className,
}: {
  /** The coach's sentence. Also the animation key — identical text, no motion. */
  note: string;
  className?: string;
}) {
  return (
    <aside
      aria-label="AI Coach brief"
      className={cn(
        "mb-8 flex flex-col border-b border-brand-700 pt-5 pb-5",
        className,
      )}
    >
      {/* Byline as the product's one tag chrome (`Badge`, default `secondary`)
          rather than a bare overline — the same pill every other label in the
          app uses, so the attribution reads as a labelled thing rather than a
          stray small line. `w-fit` comes from Badge itself, so it hugs.

          Name only. "AI Coach" is the product's existing name for this voice,
          not a new one invented here: CraftingScreen files its generated notes
          under `AssessmentBlock icon={Bot} title="AI Coach"`, the report says
          "What AI Coach saw in your session", and ChatComposer's thread header
          defaults to it. A fifth wording on a fifth screen would read as a
          different system. ("Consultant" is deliberately not used: it is not
          user-visible anywhere in the product and implies human provenance.)

          No glyph and no competency tag: the competency is already named in the
          question directly below, in the composer hint, and twice in the rail. */}
      <Badge>AI Coach</Badge>

      <p
        key={note}
        className={cn(
          "mt-2.5 max-w-[62ch] text-body-sm leading-6 text-text-primary/80",
          "motion-safe:animate-coach-brief-settle",
        )}
      >
        {note}
      </p>
    </aside>
  );
}
