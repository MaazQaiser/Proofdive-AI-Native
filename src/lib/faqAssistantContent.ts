import { BookOpen, CreditCard, FileText, LifeBuoy, Plus, UserCheck, type LucideIcon } from "lucide-react";

import type { RecommendedNextStep } from "@/lib/recommendedNextStep";
import type { InterviewReport } from "@/lib/proofdiveTypes";

export type FaqRootItemId =
  | "roadmap"
  | "storyboard"
  | "mockInterview"
  | "latestReport"
  | "prepareAnotherRole"
  | "usageBilling"
  | "contactSupport";

export type FaqCtaAction =
  | { kind: "link"; label: string; href: string; icon: LucideIcon }
  | { kind: "stub"; label: string; toastMessage: string; icon: LucideIcon };

export type FaqFollowup = {
  id: string;
  question: string;
  answer: string;
};

export type FaqAnswer = {
  text: string;
  cta?: FaqCtaAction;
  /** Only ever present on the root item's own answer, never on a follow-up's answer. */
  followups?: FaqFollowup[];
};

/** Already-resolved data every item's `getAnswer` may need — no localStorage reads happen in this file. */
export type FaqResolverContext = {
  recommendedNextStep: RecommendedNextStep;
  latestReport: InterviewReport | null;
};

export type FaqRootItem = {
  id: FaqRootItemId;
  menuLabel: string;
  /** Shown on "Back to <X> Menu" after a follow-up answer; omitted when the item has no follow-ups. */
  backMenuLabel?: string;
  getAnswer: (ctx: FaqResolverContext) => FaqAnswer;
};

function roadmapAnswerText(id: RecommendedNextStep["id"]): string {
  if (id === "training") return "Your next step is to train with essential interview guides.";
  if (id === "storyboard") return "Your next step is to craft your story.";
  return "Your next step is to take your first mock interview.";
}

const STORYBOARD_CTA: FaqCtaAction = {
  kind: "link",
  label: "Go to Storyboard",
  href: "/storyboard",
  icon: BookOpen,
};
const MOCK_INTERVIEW_CTA: FaqCtaAction = {
  kind: "link",
  label: "Go to Mock Interview",
  href: "/interview",
  icon: UserCheck,
};
const ADD_ANOTHER_ROLE_CTA: FaqCtaAction = {
  kind: "link",
  label: "Add Another Role",
  href: "/onboarding?newRole=1",
  icon: Plus,
};

/** No real candidate-facing usage/billing data source exists yet — small mock content, CTA points at /profile. */
const USAGE_BILLING_MOCK = {
  planName: "Growth",
  planExpiry: "Dec 31, 2026",
  usageByFeature: [
    { label: "Mock Interviews", used: 6, allocated: 10 },
    { label: "Storyboards", used: 2, allocated: 3 },
  ],
} as const;

export const FAQ_ROOT_ITEMS: FaqRootItem[] = [
  {
    id: "roadmap",
    menuLabel: "What's next in my roadmap?",
    getAnswer: (ctx) => ({
      text: roadmapAnswerText(ctx.recommendedNextStep.id),
      cta: {
        kind: "link",
        label: ctx.recommendedNextStep.ctaLabel,
        href: ctx.recommendedNextStep.ctaHref,
        icon: ctx.recommendedNextStep.ctaIcon,
      },
    }),
  },
  {
    id: "storyboard",
    menuLabel: "Storyboard Info",
    backMenuLabel: "Back to Storyboard Menu",
    getAnswer: () => ({
      text: "The Storyboard Module helps you turn your real experiences into structured, interview-ready stories for your target role. Add your experiences, and get a competency-scored story built using the CAR (Cause, Action, Result) framework.",
      cta: STORYBOARD_CTA,
      followups: [
        {
          id: "add_experience",
          question: "How do I add an experience?",
          answer:
            "You can add an experience by typing it in or using voice-to-text. Once submitted, it's saved to your Experience Bank for that target role.",
        },
        {
          id: "how_many_storyboards",
          question: "How many storyboards can I create?",
          answer: "You can generate and save up to 3 storyboard versions for each target role.",
        },
        {
          id: "edit_after_generated",
          question: "Can I edit my storyboard after it's generated?",
          answer:
            "Yes. You can edit any competency section by adding more detail, and lock sections you're happy with so they stay unchanged in future versions.",
        },
        {
          id: "download_storyboard",
          question: "Can I download my storyboard?",
          answer: "Yes, you can save and download your storyboard as a PDF.",
        },
        {
          id: "role_specific_storyboard",
          question: "Is my storyboard specific to my target role?",
          answer: "Yes, each target role you're preparing for has its own separate Experience Bank and storyboard.",
        },
      ],
    }),
  },
  {
    id: "mockInterview",
    menuLabel: "Mock Interview Info",
    backMenuLabel: "Back to Mock Interview Menu",
    getAnswer: () => ({
      text: "Mock Interview puts you through a realistic, timed interview with an AI interviewer that asks adaptive follow-up questions. You'll get a full transcript, a score across key competencies, and personalized feedback on what worked and what to improve.",
      cta: MOCK_INTERVIEW_CTA,
      followups: [
        {
          id: "how_long",
          question: "How long does a mock interview take?",
          answer: "A mock interview takes about 30 minutes.",
        },
        {
          id: "can_retake",
          question: "Can I retake a mock interview?",
          answer: "Yes, you can retry or reattempt a mock interview anytime.",
        },
        {
          id: "feedback_afterward",
          question: "What feedback do I get afterward?",
          answer:
            "You'll get a competency-based score, plus specific feedback on what you did well and what could be improved.",
        },
        {
          id: "has_transcript",
          question: "Is there a transcript of my interview?",
          answer: "Yes, your interview is transcribed live as you go.",
        },
      ],
    }),
  },
  {
    id: "latestReport",
    menuLabel: "View Latest Report",
    backMenuLabel: "Back to Report Menu",
    getAnswer: (ctx) => {
      if (!ctx.latestReport) {
        return {
          text: "You don't have a report yet, complete your first Mock Interview to generate one.",
          cta: MOCK_INTERVIEW_CTA,
        };
      }
      return {
        text: "Your report shows your overall readiness score (Ready, Borderline, or Not ready), plus a breakdown of your scores across each competency: Thinking, Action, People, and Mastery.",
        cta: {
          kind: "link",
          label: "View My Latest Report",
          href: `/report/${ctx.latestReport.meta.id}`,
          icon: FileText,
        },
        followups: [
          {
            id: "score_meaning",
            question: "What does my readiness score mean?",
            answer:
              "Your score falls into one of three bands: 3.5-5.0 is Ready, 2.5-3.4 is Borderline, and below 2.5 is Not ready.",
          },
          {
            id: "competency_basis",
            question: "What are the competency scores based on?",
            answer:
              "Your competency scores are based on four pillars: Power of Thinking, Power of Action, Power of People, and Power of Mastery.",
          },
          {
            id: "updates_after_interview",
            question: "Does my report update after each mock interview?",
            answer:
              "Yes, your report reflects your most recently completed Mock Interview and your current Storyboard progress.",
          },
        ],
      };
    },
  },
  {
    id: "prepareAnotherRole",
    menuLabel: "Prepare for Another Role",
    backMenuLabel: "Back to Prepare for Another Role Menu",
    getAnswer: () => ({
      text: "Preparing for another role starts a fresh onboarding journey for that new target role. Your existing roles, storyboards, and progress stay untouched, and you can switch between roles anytime.",
      cta: ADD_ANOTHER_ROLE_CTA,
      followups: [
        {
          id: "what_to_provide",
          question: "What do I need to provide to add a new role?",
          answer:
            "Adding a new role follows the same guided onboarding process: selecting your target role, indicating your experience level, and providing a job description with your resume.",
        },
      ],
    }),
  },
  {
    id: "usageBilling",
    menuLabel: "Usage & Billing",
    getAnswer: () => ({
      text: `You're on the ${USAGE_BILLING_MOCK.planName} plan, renewing ${USAGE_BILLING_MOCK.planExpiry}. Usage so far: ${USAGE_BILLING_MOCK.usageByFeature
        .map((f) => `${f.label} ${f.used}/${f.allocated}`)
        .join(", ")}.`,
      cta: { kind: "link", label: "View Usage & Billing", href: "/profile", icon: CreditCard },
    }),
  },
  {
    id: "contactSupport",
    menuLabel: "Contact Support",
    getAnswer: () => ({
      text: "Need help beyond what I can answer? Our support team can help with account issues, billing questions, or anything else you're stuck on.",
      cta: {
        kind: "stub",
        label: "Contact Support",
        toastMessage: "Contact support is coming soon.",
        icon: LifeBuoy,
      },
    }),
  },
];

export function getFaqRootItem(id: FaqRootItemId): FaqRootItem {
  const item = FAQ_ROOT_ITEMS.find((i) => i.id === id);
  if (!item) throw new Error(`Unknown FAQ root item id: ${id}`);
  return item;
}
