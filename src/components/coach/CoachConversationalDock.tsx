"use client";

import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ChatComposer, type ChatComposerQuickChip } from "@/components/chat/ChatComposer";
import { cn } from "@/components/cn";
import { FaqAssistantThread } from "@/components/faq/FaqAssistantThread";
import { useFaqAssistant } from "@/components/faq/useFaqAssistant";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  showNextCtas?: boolean;
};

const AI_DELAY_MS = 480;

type PlanSubStep = "await_role" | "await_jd" | "next_actions";

type Props = {
  quickChips: ChatComposerQuickChip[];
  onAdoptPlannedRole: (targetRole: string) => void;
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatAssistantText(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`b-${i}`} className="font-extrabold">
        {part}
      </strong>
    ) : (
      <span key={`p-${i}`}>{part}</span>
    ),
  );
}

export function CoachConversationalDock({ quickChips, onAdoptPlannedRole }: Props) {
  const titleId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [planPlannedStep, setPlanPlannedStep] = useState<PlanSubStep | null>(null);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [composerKey, setComposerKey] = useState(0);
  const [showGuidedJourneySteps, setShowGuidedJourneySteps] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const faq = useFaqAssistant();

  const inPlanNewRole = planPlannedStep != null;

  const handleThreadClose = useCallback(() => {
    setMessages([]);
    setPlanPlannedStep(null);
    setPendingRole(null);
    setShowGuidedJourneySteps(false);
    setComposerKey((k) => k + 1);
  }, []);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, planPlannedStep, showGuidedJourneySteps]);

  const pushAssistant = useCallback((text: string, showNextCtas?: boolean) => {
    setMessages((m) => [
      ...m,
      { id: newId("a"), role: "assistant" as const, text, showNextCtas: Boolean(showNextCtas) },
    ]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages((m) => [...m, { id: newId("u"), role: "user" as const, text }]);
  }, []);

  const startPlanNewRoleFlow = useCallback(() => {
    setPlanPlannedStep("await_role");
    const opener = "I'd like to add a new role to prepare for another interview";
    pushUser(opener);
    window.setTimeout(() => {
      pushAssistant(
        "Great, I’ll be your AI coach. What new role are you planning for? Type a job title, for example Senior Product Manager, Data Engineer, or Staff Software Engineer.",
      );
    }, AI_DELAY_MS);
  }, [pushAssistant, pushUser]);

  const onQuickPromptChipSelect = useCallback(
    (chip: ChatComposerQuickChip) => {
      if (chip.id === "plan_role") {
        if (inPlanNewRole) return true;
        startPlanNewRoleFlow();
        return true;
      }
      return false;
    },
    [inPlanNewRole, startPlanNewRoleFlow],
  );

  const onSend = useCallback(
    (raw: string) => {
      const t = raw.trim();
      if (!t) return;

      if (planPlannedStep === "next_actions") {
        pushUser(t);
        window.setTimeout(() => {
          pushAssistant("Use the options above, or type another question here. Expanded coaching is on the way.");
        }, AI_DELAY_MS);
        return;
      }

      if (planPlannedStep === "await_role") {
        setPendingRole(t);
        onAdoptPlannedRole(t);
        pushUser(t);
        setPlanPlannedStep("await_jd");
        window.setTimeout(() => {
          pushAssistant(
            `I’ve added **${t}** as the new role you’re planning for.\n\nWould you like to add a job description or a résumé for this role? Use **Upload** below, or type **skip**.`,
          );
        }, AI_DELAY_MS);
        setComposerKey((k) => k + 1);
        return;
      }

      if (planPlannedStep === "await_jd") {
        const lower = t.toLowerCase();
        const isSkip = lower === "skip" || lower === "skipping";
        pushUser(isSkip ? "skip" : t);
        setPlanPlannedStep("next_actions");
        window.setTimeout(() => {
          pushAssistant("What would you like to do next for this new role?", true);
        }, AI_DELAY_MS);
        return;
      }

      pushUser(t);
      window.setTimeout(() => {
        pushAssistant(
          "Thanks for your message. A fuller AI coach is on the way. For a guided start, use **Plan new Role** in the quick prompts above the field.",
        );
      }, AI_DELAY_MS);
    },
    [onAdoptPlannedRole, planPlannedStep, pushAssistant, pushUser],
  );

  const onUpload = useCallback(
    (files: File[]) => {
      if (planPlannedStep !== "await_jd" || !files[0]) return;
      const name = files[0].name;
      pushUser(`Attached: ${name}`);
      setPlanPlannedStep("next_actions");
      window.setTimeout(() => {
        pushAssistant("What would you like to do next for this new role?", true);
      }, AI_DELAY_MS);
    },
    [planPlannedStep, pushAssistant, pushUser],
  );

  const showChips = !inPlanNewRole && !faq.isFaqMode;
  const placeholder = faq.isFaqMode
    ? "Select a question above"
    : planPlannedStep === "await_role"
      ? "Type the role title you’re planning for…"
      : planPlannedStep === "await_jd"
        ? "Add job description, résumé notes, say skip, or use Upload…"
        : "Ask AI Coach";

  const messageThread =
    messages.length > 0 ? (
      <div
        className="flex min-h-0 w-full flex-col justify-end gap-2.5 py-0.5 pr-0.5"
        aria-label="Chat"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                m.role === "user"
                  ? "max-w-[min(100%,32rem)] rounded-2xl rounded-br-md bg-[var(--app-fg)] px-3.5 py-2.5 text-body-sm leading-6 text-white [word-break:break-word]"
                  : "w-full min-w-0 max-w-[min(100%,32rem)]",
              )}
            >
              {m.role === "assistant" ? (
                <p className="whitespace-pre-wrap text-left text-body-sm leading-6 text-[var(--app-fg)] [word-break:break-word]">
                  {formatAssistantText(m.text)}
                </p>
              ) : (
                <p className="whitespace-pre-wrap [word-break:break-word]">{m.text}</p>
              )}
              {m.showNextCtas && m.role === "assistant" ? (
                <div className="mt-3 space-y-2.5">
                  <Link
                    href={
                      pendingRole
                        ? `/interview?first=1&prepRole=${encodeURIComponent(pendingRole)}`
                        : "/interview?first=1"
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-2xl border border-[var(--app-hairline)]",
                      "bg-white px-4 py-3 text-left text-body-sm font-semibold text-[var(--app-fg)]",
                      "transition hover:border-[var(--app-hairline-strong)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40",
                    )}
                  >
                    <span>Take a quick interview against this new role</span>
                    <ArrowUpIcon />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowGuidedJourneySteps(true)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-2xl border border-[var(--app-hairline)]",
                      "bg-white px-4 py-3 text-left text-body-sm font-semibold text-[var(--app-fg)]",
                      "transition hover:border-[var(--app-hairline-strong)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40",
                    )}
                  >
                    <span>Create a guide plan to prepare for this role</span>
                    <ArrowUpIcon />
                  </button>
                  {showGuidedJourneySteps ? (
                    <div className="mt-4 w-full min-w-0 border-t border-[var(--app-hairline)] pt-4">
                      <h3 className="text-h6 text-left leading-snug text-[var(--app-fg)]">
                        Here is the guided journey
                      </h3>
                      <p className="mt-1 text-left text-caption leading-5 text-[var(--app-muted)]">
                        Follow the path, then go for your mock interview.
                      </p>
                      <div className="mt-4 flex w-full min-w-0 flex-col">
                        <GuidedJourneyStepRow
                          title="1. Train with essential interview guides"
                          body="Learn the fundamentals with guided practice."
                          actionHref="/training"
                          actionLabel="Start learning"
                        />
                        <div className="h-px w-full bg-[var(--app-hairline)]" aria-hidden />
                        <GuidedJourneyStepRow
                          title="2. Craft your story"
                          body="Turn your experience into clear, structured answers."
                          actionHref="/storyboard"
                          actionLabel="Create my story"
                        />
                        <div className="h-px w-full bg-[var(--app-hairline)]" aria-hidden />
                        <GuidedJourneyStepRow
                          title="3. Take a mock interview"
                          body="Practice with a 30-minute, real-world interview."
                          actionHref="/interview"
                          actionLabel="Start interview"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    ) : undefined;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full">
      {/* Mirrors AppShell's frame (max-w-6xl, pl-20/pr-6 reserved for the nav
          rail) so this fixed-position bar's centering axis matches the main
          content column's — otherwise the two drift apart since this dock
          lives outside AppShell's DOM tree and centers on the viewport. */}
      <div className="mx-auto w-full max-w-6xl pr-6 pl-20">
        <div
          className="mx-auto w-full max-w-[840px] px-6 pb-4"
          role="region"
          aria-labelledby={titleId}
        >
          <h2 id={titleId} className="sr-only">
            AI Coach chat
          </h2>
          <ChatComposer
            key={composerKey}
            placeholder={placeholder}
            disabled={faq.isFaqMode}
            quickPromptChips={showChips ? quickChips : undefined}
            onQuickPromptChipSelect={onQuickPromptChipSelect}
            onSend={onSend}
            onUpload={planPlannedStep === "await_jd" ? onUpload : undefined}
            showUploadButton={!faq.isFaqMode && (!inPlanNewRole || planPlannedStep === "await_jd")}
            uploadAccept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            uploadMultiple={false}
            modeToggle={{
              isActive: faq.isFaqMode,
              icon: CircleHelp,
              activeLabel: "FAQ Assistant",
              onToggle: () => (faq.isFaqMode ? faq.exitFaqMode() : faq.enterFaqMode()),
            }}
            thread={
              faq.isFaqMode ? (
                <FaqAssistantThread
                  screenData={faq.screenData}
                  onSelectRootItem={faq.selectRootItem}
                  onSelectFollowup={faq.selectFollowup}
                  onBackToItemMenu={faq.backToItemMenu}
                  onBackToRootMenu={faq.backToRootMenu}
                />
              ) : (
                messageThread
              )
            }
            onThreadClose={faq.isFaqMode ? faq.exitFaqMode : messageThread ? handleThreadClose : undefined}
            threadHeaderTitle={faq.isFaqMode ? "FAQ Assistant" : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function ArrowUpIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-[var(--app-muted)]" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17L17 7M17 7H10M17 7V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GuidedJourneyStepRow({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="w-full min-w-0 py-3">
      <div className="flex w-full min-w-0 items-start justify-between gap-2">
        <h4 className="min-w-0 flex-1 text-left text-caption font-semibold text-[var(--app-fg)] [word-break:break-word]">
          {title}
        </h4>
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center gap-1.5 text-caption font-semibold text-[var(--app-muted)] no-underline transition hover:text-[var(--app-fg)]"
        >
          {actionLabel}
          <ArrowUpIcon />
        </Link>
      </div>
      <p className="mt-0.5 text-left text-caption text-[var(--app-muted)]">{body}</p>
    </div>
  );
}
