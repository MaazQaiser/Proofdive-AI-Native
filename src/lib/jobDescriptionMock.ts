/**
 * Deterministic, client-only mock JD generator (no LLM/API call). Produces a plausible
 * draft job description from onboarding fields already collected before this step
 * (role, background/seniority, industry) so the copy is always clearly labeled in the
 * UI as system-generated, not employer-authored.
 */

import type { RoleProfile } from "@/lib/proofdiveTypes";

export type JdMockInput = {
  targetRole: string;
  backgroundType: NonNullable<RoleProfile["backgroundType"]> | "";
  experienceLevel: NonNullable<RoleProfile["experienceLevel"]> | "";
  industryVertical: string;
};

const SENIORITY_LABEL: Partial<Record<NonNullable<RoleProfile["backgroundType"]>, string>> = {
  fresh_grad: "Entry-level",
  under_grad: "Entry-level",
  diploma_holder: "Entry-level",
  experienced: "Experienced",
};

const EXPERIENCE_YEARS_LABEL: Record<NonNullable<RoleProfile["experienceLevel"]>, string> = {
  "1-5": "1-5 years",
  "5-10": "5-10 years",
  "10+": "10+ years",
};

const RESPONSIBILITY_BANK = [
  "Own day-to-day execution of core responsibilities for the role, working cross-functionally to move initiatives forward.",
  "Analyze relevant data and feedback to identify what's working, what isn't, and where to focus next.",
  "Communicate progress, blockers, and recommendations clearly to stakeholders and teammates.",
  "Continuously improve processes and outputs based on results and lessons learned.",
];

const REQUIREMENT_VARIANTS: string[][] = [
  [
    "Strong analytical and problem-solving skills, with the ability to structure ambiguous problems.",
    "Clear written and verbal communication, especially with non-technical stakeholders.",
    "A bias toward ownership — comfortable driving work forward without heavy oversight.",
  ],
  [
    "Demonstrated ability to prioritize competing demands and make sound trade-offs under uncertainty.",
    "Collaborative working style; comfortable incorporating feedback from diverse perspectives.",
    "Track record of learning quickly and applying new tools or methods to real work.",
  ],
  [
    "Comfort working with relevant tools, data, and processes for the role's domain.",
    "Ability to adapt when priorities or circumstances shift, without losing momentum.",
    "A habit of diagnosing root causes before proposing fixes, and measuring whether they worked.",
  ],
];

function seniorityLine(input: JdMockInput): string {
  const seniority = input.backgroundType ? SENIORITY_LABEL[input.backgroundType] : undefined;
  const years = input.experienceLevel ? EXPERIENCE_YEARS_LABEL[input.experienceLevel] : undefined;
  if (seniority === "Experienced" && years) return `Experienced (${years})`;
  return seniority ?? "";
}

/** Builds a draft JD. `variant` cycles the requirements section for "Regenerate". */
export function generateMockJobDescription(input: JdMockInput, variant = 0): string {
  const seniority = seniorityLine(input);
  const role = input.targetRole.trim() || "this role";
  const industryLine = input.industryVertical.trim()
    ? ` in the ${input.industryVertical.trim()} industry`
    : "";

  const title = `${seniority ? `${seniority} ` : ""}${role}`.trim();
  const article = /^[aeiou]/i.test(title) ? "an" : "a";
  const intro = `We're looking for ${article} ${title}${industryLine} to help the team turn plans into consistent, measurable progress.`;

  const requirements = REQUIREMENT_VARIANTS[variant % REQUIREMENT_VARIANTS.length];

  const lines = [
    title,
    "",
    intro,
    "",
    "Responsibilities:",
    ...RESPONSIBILITY_BANK.map((line) => `- ${line}`),
    "",
    "What we're looking for:",
    ...requirements.map((line) => `- ${line}`),
  ];

  return lines.join("\n");
}
