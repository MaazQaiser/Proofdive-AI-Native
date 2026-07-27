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
