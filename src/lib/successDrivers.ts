import type { PillarId } from "@/lib/storyboardDraft";
import { PILLAR_LABEL } from "@/lib/storyboardDraft";

/** Alias — Success Drivers are the four competency pillars. */
export type SuccessDriverId = PillarId;

export const SUCCESS_DRIVER_ORDER: SuccessDriverId[] = [
  "thinking",
  "action",
  "people",
  "mastery",
];

export type SuccessDriverMeta = {
  id: SuccessDriverId;
  /** Full brand title, e.g. "Power of Thinking". */
  label: string;
  /** Short label for compact UI, e.g. "Thinking". */
  shortLabel: string;
  /** One-line description for cards / tooltips. */
  description: string;
  /** Brand SVG under `public/brand/`. */
  svgPath: string;
};

export const SUCCESS_DRIVERS: Record<SuccessDriverId, SuccessDriverMeta> = {
  thinking: {
    id: "thinking",
    label: PILLAR_LABEL.thinking,
    shortLabel: "Thinking",
    description:
      "Clarity of thinking: structure, prioritization, and sound judgment under pressure.",
    svgPath: "/brand/Power of thinking.svg",
  },
  action: {
    id: "action",
    label: PILLAR_LABEL.action,
    shortLabel: "Action",
    description:
      "Execution: ownership, speed, and delivering outcomes with constraints.",
    svgPath: "/brand/Power of Action.svg",
  },
  people: {
    id: "people",
    label: PILLAR_LABEL.people,
    shortLabel: "People",
    description:
      "Collaboration: communication, influence, and working effectively with others.",
    svgPath: "/brand/Power of People.svg",
  },
  mastery: {
    id: "mastery",
    label: PILLAR_LABEL.mastery,
    shortLabel: "Mastery",
    description:
      "Craft mastery: role fundamentals, depth, and consistent high-quality work.",
    svgPath: "/brand/Power of Mastery.svg",
  },
};

/** Tailwind class bundles for each driver's color tokens. */
export const SUCCESS_DRIVER_COLORS: Record<
  SuccessDriverId,
  {
    bg: string;
    symbol: string;
    fg: string;
    accent: string;
    accentBg: string;
    accentDot: string;
    ring: string;
  }
> = {
  thinking: {
    bg: "bg-driver-thinking-bg",
    symbol: "text-driver-thinking-symbol",
    fg: "text-driver-thinking-fg",
    accent: "text-driver-thinking-accent",
    accentBg: "bg-driver-thinking-accent/15 border-driver-thinking-accent/20",
    accentDot: "bg-driver-thinking-accent",
    ring: "ring-driver-thinking-accent",
  },
  action: {
    bg: "bg-driver-action-bg",
    symbol: "text-driver-action-symbol",
    fg: "text-driver-action-fg",
    accent: "text-driver-action-accent",
    accentBg: "bg-driver-action-accent/15 border-driver-action-accent/20",
    accentDot: "bg-driver-action-accent",
    ring: "ring-driver-action-accent",
  },
  people: {
    bg: "bg-driver-people-bg",
    symbol: "text-driver-people-symbol",
    fg: "text-driver-people-fg",
    accent: "text-driver-people-accent",
    accentBg: "bg-driver-people-accent/15 border-driver-people-accent/20",
    accentDot: "bg-driver-people-accent",
    ring: "ring-driver-people-accent",
  },
  mastery: {
    bg: "bg-driver-mastery-bg",
    symbol: "text-driver-mastery-symbol",
    fg: "text-driver-mastery-fg",
    accent: "text-driver-mastery-accent",
    accentBg: "bg-driver-mastery-accent/15 border-driver-mastery-accent/20",
    accentDot: "bg-driver-mastery-accent",
    ring: "ring-driver-mastery-accent",
  },
};
