"use client";

import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/ui/logo";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { suggestionReasoningFor } from "@/lib/coreFourSuggestion";
import { COMPETENCY_SPECS, type CompetencyId } from "@/lib/storyboardDraft";
import { SUCCESS_DRIVERS } from "@/lib/successDrivers";
import { cn } from "@/lib/utils";

/** Which group of four this attempt will be assessed against. */
export type InterviewCompetencyGroup = "core_four" | "next_relevant";

type GroupOptionProps = {
  group: InterviewCompetencyGroup;
  checked: boolean;
  onSelect: (group: InterviewCompetencyGroup) => void;
  title: string;
  badge: React.ReactNode;
  subtitle: string;
  competencyIds: CompetencyId[];
  targetRole: string;
};

/**
 * One of the two groups, as a single click target.
 *
 * The whole card is the label — the four competencies inside it are what the
 * choice actually is, so reading them and choosing them should not be two
 * separate gestures. The reasoning sits outside the label, in a disclosure
 * that only appears once the group is chosen: it is depth for the option you
 * are taking, not a second thing to compare before you can decide.
 */
function GroupOption({
  group,
  checked,
  onSelect,
  title,
  badge,
  subtitle,
  competencyIds,
  targetRole,
}: GroupOptionProps) {
  const specs = competencyIds
    .map((id) => COMPETENCY_SPECS.find((s) => s.id === id))
    .filter((s): s is (typeof COMPETENCY_SPECS)[number] => Boolean(s));

  return (
    <div
      className={cn(
        "rounded-[16px] border bg-card transition-colors",
        checked ? "border-primary bg-primary/[0.04]" : "border-border hover:bg-[var(--hover-veil)]",
      )}
    >
      <label className="flex cursor-pointer items-start gap-3 p-4">
        <input
          type="radio"
          name="interview-competency-group"
          className="sr-only"
          checked={checked}
          onChange={() => onSelect(group)}
        />
        {/* Same dot as the onboarding plan step — one radio in the product. */}
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] border-brand-400 bg-card",
            checked && "border-primary",
          )}
        >
          <span
            className={cn(
              "size-[9px] rounded-full bg-primary transition",
              checked ? "opacity-100" : "opacity-0",
            )}
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-body-sm font-semibold text-text-primary">{title}</span>
            {badge}
          </span>
          <span className="mt-1 block text-caption leading-snug text-text-secondary">
            {subtitle}
          </span>

          {/* Two columns, and the driver name is carried by its mark rather
              than repeated as a word: in one column the two options together
              overflowed the dialog, which left the second one half-hidden
              under the fold on the very screen where you choose between
              them. The step's own line already says one per Success Driver. */}
          <span className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {specs.map((spec) => (
              <span key={spec.id} className="flex min-w-0 items-center gap-2">
                <SuccessDriverIcon
                  driver={spec.pillar}
                  className="size-4 shrink-0 text-extended-cyan-green"
                />
                <span
                  className="min-w-0 truncate text-caption font-medium text-text-primary"
                  title={`${spec.title} — ${SUCCESS_DRIVERS[spec.pillar].label}`}
                >
                  {spec.title}
                </span>
              </span>
            ))}
          </span>
        </span>
      </label>

      {checked ? (
        <details className="group/why border-t border-border/70 px-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-caption font-medium text-text-secondary [&::-webkit-details-marker]:hidden">
            Why these four
            <ChevronDown
              className="size-4 shrink-0 transition-transform group-open/why:rotate-180"
              aria-hidden
            />
          </summary>
          <ul className="flex flex-col gap-2.5 pb-3.5">
            {specs.map((spec) => (
              <li key={spec.id} className="border-l-2 border-brand-800 pl-3">
                <p className="text-caption font-medium text-text-primary">{spec.title}</p>
                <p className="mt-0.5 text-caption leading-snug text-text-secondary">
                  {suggestionReasoningFor(spec.id, { targetRole })}
                </p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

type CompetencyGroupStepProps = {
  targetRole: string;
  coreFour: CompetencyId[];
  nextRelevant: CompetencyId[];
  value: InterviewCompetencyGroup;
  onChange: (group: InterviewCompetencyGroup) => void;
};

/**
 * The competency step of the pre-interview flow.
 *
 * An interview is assessed against four competencies, one per Success Driver,
 * and the candidate now decides which four before the session opens: the Core
 * Four they confirmed for this role, or the next four the Consultant matched
 * to it. Both are legitimate — repeating the Core Four is how a score moves,
 * widening is how the Competency Bank grows — so neither is framed as the
 * correct answer, and the Core Four is merely the default because it is what
 * their storyboard evidence already covers.
 */
export function CompetencyGroupStep({
  targetRole,
  coreFour,
  nextRelevant,
  value,
  onChange,
}: CompetencyGroupStepProps) {
  const roleText = targetRole.trim() || "your role";

  return (
    <div role="radiogroup" aria-label="Competencies for this interview" className="flex flex-col gap-3">
      <GroupOption
        group="core_four"
        checked={value === "core_four"}
        onSelect={onChange}
        title="Your Core Four"
        badge={<Badge>Confirmed for this role</Badge>}
        subtitle={`Practise them again and move the score you already have for ${roleText}.`}
        competencyIds={coreFour}
        targetRole={targetRole}
      />
      <GroupOption
        group="next_relevant"
        checked={value === "next_relevant"}
        onSelect={onChange}
        title="Next most relevant"
        badge={
          <Badge>
            <LogoMark className="size-3" />
            Consultant pick
          </Badge>
        }
        subtitle={`Four more matched to ${roleText} — widen the evidence you can draw on.`}
        competencyIds={nextRelevant}
        targetRole={targetRole}
      />
    </div>
  );
}
