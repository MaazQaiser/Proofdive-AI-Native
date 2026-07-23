"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { FaqScreenData } from "@/components/faq/useFaqAssistant";
import type { FaqCtaAction, FaqRootItemId } from "@/lib/faqAssistantContent";

type Props = {
  screenData: FaqScreenData;
  onSelectRootItem: (itemId: FaqRootItemId) => void;
  onSelectFollowup: (followupId: string) => void;
  onBackToItemMenu: () => void;
  onBackToRootMenu: () => void;
};

const MENU_PILL_CLASSES =
  "w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-left text-body-sm font-medium text-gray-900 transition hover:border-black/20 hover:bg-white/90";

const BACK_BUTTON_CLASSES =
  "flex w-full items-center gap-1.5 rounded-2xl px-4 py-2.5 text-left text-body-sm font-medium text-gray-600 transition hover:bg-black/5";

/** Deliberately the app's real `Button` (design-system) component, not a pill — a FAQ
 * navigation CTA should read as an action, visually distinct from the question pills.
 * Sized to its own content (not full-width) like a normal button, with a leading icon
 * for the destination and a trailing arrow for the "go to" affordance. */
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
      <div className="max-w-[min(100%,32rem)] rounded-2xl rounded-br-md bg-black px-3.5 py-2.5 text-body-sm leading-6 text-white [word-break:break-word]">
        {children}
      </div>
    </div>
  );
}

function AssistantText({ children }: { children: ReactNode }) {
  return (
    <p className="whitespace-pre-wrap text-left text-body-sm leading-6 text-gray-800 [word-break:break-word]">
      {children}
    </p>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={BACK_BUTTON_CLASSES} onClick={onClick}>
      <ChevronLeft className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

/**
 * Renders exactly one FAQ screen at a time (Root Menu, an item's Answer View, or a
 * follow-up's Answer View) — every button/pill is stacked vertically below the answer
 * text per the PRD's button-placement rule, never beside it.
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
      <div className="flex w-full flex-col gap-3 py-0.5 pr-0.5" aria-label="FAQ Assistant menu">
        {screenData.showGreeting ? (
          <AssistantText>{`Hey ${screenData.candidateName}, what can I help you with today?`}</AssistantText>
        ) : null}
        <div className="flex flex-col gap-2">
          {screenData.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={MENU_PILL_CLASSES}
              onClick={() => onSelectRootItem(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screenData.kind === "item") {
    const { item, answer } = screenData;
    return (
      <div className="flex w-full flex-col gap-3 py-0.5 pr-0.5" aria-label="FAQ Assistant answer">
        <UserBubble>{item.menuLabel}</UserBubble>
        <AssistantText>{answer.text}</AssistantText>
        <div className="flex flex-col gap-2">
          {answer.cta ? <CtaButton cta={answer.cta} /> : null}
          {answer.followups?.length ? (
            <div className="flex flex-col gap-2">
              {answer.followups.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={MENU_PILL_CLASSES}
                  onClick={() => onSelectFollowup(f.id)}
                >
                  {f.question}
                </button>
              ))}
            </div>
          ) : null}
          <BackButton label="Back to Menu" onClick={onBackToRootMenu} />
        </div>
      </div>
    );
  }

  const { item, answer, followup } = screenData;
  return (
    <div className="flex w-full flex-col gap-3 py-0.5 pr-0.5" aria-label="FAQ Assistant follow-up answer">
      <UserBubble>{followup.question}</UserBubble>
      <AssistantText>{followup.answer}</AssistantText>
      <div className="flex flex-col gap-2">
        {answer.cta ? <CtaButton cta={answer.cta} /> : null}
        <BackButton label={item.backMenuLabel ?? "Back to Menu"} onClick={onBackToItemMenu} />
      </div>
    </div>
  );
}
