/**
 * Deterministic, client-only mock JD generator (no LLM/API call). Produces a plausible
 * draft job description from onboarding fields already collected before this step
 * (role, background/seniority, industry) so the copy is always clearly labeled in the
 * UI as system-generated, not employer-authored.
 */

import type { RoleProfile } from "@/lib/proofdiveTypes";

/**
 * The company context a draft is pitched for. "Regenerate" offers these two
 * (client ask, 2026-09-10) the way other assistants offer "try again" angles,
 * and the choice is shown back in the panel so the user knows which context
 * the draft describes.
 */
export type JdCompanyAngle = "startup" | "established";

export const JD_COMPANY_ANGLES: ReadonlyArray<{
  id: JdCompanyAngle;
  label: string;
  description: string;
}> = [
  {
    id: "startup",
    label: "Startup / early-stage",
    description: "Broad ownership, fast iteration, small teams and few specialists.",
  },
  {
    id: "established",
    label: "Larger / established company",
    description: "Defined scope, cross-team coordination and mature processes.",
  },
];

export function jdCompanyAngleLabel(angle: JdCompanyAngle): string {
  return JD_COMPANY_ANGLES.find((a) => a.id === angle)?.label ?? "";
}

const ANGLE_INTRO: Record<JdCompanyAngle, string> = {
  startup:
    " at an early-stage company, where you will own outcomes end to end and iterate quickly with a small team",
  established:
    " at a larger, established company, where you will work within a defined scope and coordinate across teams and mature processes",
};

const ANGLE_RESPONSIBILITY: Record<JdCompanyAngle, string> = {
  startup:
    "Take on work outside a fixed remit as priorities shift, and set up the processes that do not exist yet.",
  established:
    "Coordinate across functions and stakeholders, working within established processes and governance while improving them.",
};

const ANGLE_REQUIREMENT: Record<JdCompanyAngle, string> = {
  startup:
    "Comfort with ambiguity and pace: shipping, learning and correcting course in short cycles.",
  established:
    "Experience navigating a larger organisation: alignment, documentation and influencing beyond your own team.",
};

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
    "A bias toward ownership, and comfort driving work forward without heavy oversight.",
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

/** Builds a draft JD. `variant` cycles the requirements section for "Regenerate";
 *  `angle` pitches the intro and one line in each list for a company context. */
export function generateMockJobDescription(
  input: JdMockInput,
  variant = 0,
  angle: JdCompanyAngle | null = null,
): string {
  const seniority = seniorityLine(input);
  const role = input.targetRole.trim() || "this role";
  const industryLine = input.industryVertical.trim()
    ? ` in the ${input.industryVertical.trim()} industry`
    : "";

  const title = `${seniority ? `${seniority} ` : ""}${role}`.trim();
  const article = /^[aeiou]/i.test(title) ? "an" : "a";
  const intro = `We're looking for ${article} ${title}${industryLine}${angle ? ANGLE_INTRO[angle] : ""} to help the team turn plans into consistent, measurable progress.`;

  const responsibilities = angle
    ? [...RESPONSIBILITY_BANK, ANGLE_RESPONSIBILITY[angle]]
    : RESPONSIBILITY_BANK;
  const requirements = [
    ...REQUIREMENT_VARIANTS[variant % REQUIREMENT_VARIANTS.length],
    ...(angle ? [ANGLE_REQUIREMENT[angle]] : []),
  ];

  const lines = [
    `# ${title}`,
    "",
    intro,
    "",
    "## Responsibilities",
    ...responsibilities.map((line) => `- ${line}`),
    "",
    "## What we're looking for",
    ...requirements.map((line) => `- ${line}`),
  ];

  return lines.join("\n");
}
