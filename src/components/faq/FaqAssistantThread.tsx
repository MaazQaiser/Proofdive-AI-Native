"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronLeft, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FaqScreenData } from "@/components/faq/useFaqAssistant";
import type { FaqCtaAction, FaqRootItemId } from "@/lib/faqAssistantContent";

type Props = {
  screenData: FaqScreenData;
  onSelectRootItem: (itemId: FaqRootItemId) => void;
  onSelectFollowup: (followupId: string) => void;
  onBackToItemMenu: () => void;
  onBackToRootMenu: () => void;
};

/** Text-only suggestion row — label only, separators from SuggestionList. */
const SUGGESTION_CHIP_CLASSES = cn(
  "inline-flex w-full cursor-pointer items-center rounded-none py-3 text-left text-body-sm font-medium",
  "bg-transparent text-extended-cyan-green",
  "transition duration-200 ease-out",
  "hover:text-primary",
  "active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
);

const BACK_BUTTON_CLASSES = cn(
  "inline-flex w-fit cursor-pointer items-center gap-1 rounded-full px-2 py-2",
  "text-left text-body-sm font-medium text-primary",
  "transition duration-200 hover:bg-brand-1000 hover:text-brand-100",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
);

/** Deliberately the app's real `Button` (design-system) component, not a pill — a
 * navigation CTA should read as an action, visually distinct from suggestion chips. */
function CtaButton({ cta }: { cta: FaqCtaAction }) {
  const Icon = cta.icon;
  if (cta.kind === "stub") {
    return (
      <Button type="button" className="self-start" onClick={() => toast(cta.toastMessage)}>
        <Icon />
        {cta.label}
        <ArrowUpRight />
      </Button>
    );
  }
  return (
    <Button asChild className="self-start">
      <Link href={cta.href}>
        <Icon />
        {cta.label}
        <ArrowUpRight />
      </Link>
    </Button>
  );
}

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full justify-end">
      <div
        className={cn(
          "max-w-[min(100%,32rem)] rounded-[1.25rem] rounded-br-md px-4 py-2.5",
          "bg-primary text-body-sm leading-6 text-primary-foreground",
          "shadow-[var(--bubble-shadow)]",
          "[word-break:break-word]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function AssistantText({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-3">
      <span
        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-1000 text-primary"
        aria-hidden
      >
        <Sparkles className="size-3.5" strokeWidth={2} />
      </span>
      <p className="min-w-0 flex-1 whitespace-pre-wrap pt-1 text-left text-body leading-7 text-text-primary [word-break:break-word]">
        {children}
      </p>
    </div>
  );
}

function AnswerVideo({ src }: { src: string }) {
  return (
    <div className="w-full overflow-hidden rounded-[12px] border border-border bg-black">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- explainer asset; no captions file yet */}
      <video
        className="mx-auto max-h-[min(42vh,320px)] w-full object-contain"
        controls
        playsInline
        preload="metadata"
        src={src}
      />
    </div>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={BACK_BUTTON_CLASSES} onClick={onClick}>
      <ChevronLeft className="size-4 shrink-0" />
      {label}
    </button>
  );
}

function SuggestionList({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div
      className="flex w-full flex-col divide-y divide-border"
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}

/**
 * Renders exactly one AI Assistant screen at a time (Root Menu, an item's Answer
 * View, or a follow-up's Answer View) — suggestions stack below the answer text
 * per the PRD's button-placement rule, never beside it.
 */
export function FaqAssistantThread({
  screenData,
  onSelectRootItem,
  onSelectFollowup,
  onBackToItemMenu,
  onBackToRootMenu,
}: Props) {
  if (screenData.kind === "root") {
    return (
      <div className="flex w-full flex-col gap-4 py-1" aria-label="AI Assistant menu">
        {screenData.pendingFreeText ? (
          <>
            <UserBubble>{screenData.pendingFreeText}</UserBubble>
            <AssistantText>
              I can help best when you pick one of the options below.
            </AssistantText>
          </>
        ) : screenData.showGreeting ? (
          <AssistantText>{`Hey ${screenData.candidateName}, what can I help you with today?`}</AssistantText>
        ) : null}
        <SuggestionList label="Suggested questions">
          {screenData.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={SUGGESTION_CHIP_CLASSES}
              onClick={() => onSelectRootItem(item.id)}
            >
              {item.label}
            </button>
          ))}
        </SuggestionList>
      </div>
    );
  }

  if (screenData.kind === "item") {
    const { item, answer } = screenData;
    return (
      <div className="flex w-full flex-col gap-4 py-1" aria-label="AI Assistant answer">
        <UserBubble>{item.menuLabel}</UserBubble>
        <AssistantText>{answer.text}</AssistantText>
        {answer.videoSrc ? <AnswerVideo src={answer.videoSrc} /> : null}
        <div className="flex flex-col gap-3">
          {answer.cta ? <CtaButton cta={answer.cta} /> : null}
          {answer.followups?.length ? (
            <SuggestionList label="Follow-up questions">
              {answer.followups.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={SUGGESTION_CHIP_CLASSES}
                  onClick={() => onSelectFollowup(f.id)}
                >
                  {f.question}
                </button>
              ))}
            </SuggestionList>
          ) : null}
          <BackButton label="Back" onClick={onBackToRootMenu} />
        </div>
      </div>
    );
  }

  const { answer, followup } = screenData;
  return (
    <div className="flex w-full flex-col gap-4 py-1" aria-label="AI Assistant follow-up answer">
      <UserBubble>{followup.question}</UserBubble>
      <AssistantText>{followup.answer}</AssistantText>
      {followup.videoSrc ? <AnswerVideo src={followup.videoSrc} /> : null}
      <div className="flex flex-col gap-3">
        {answer.cta ? <CtaButton cta={answer.cta} /> : null}
        <BackButton label="Back" onClick={onBackToItemMenu} />
      </div>
    </div>
  );
}
