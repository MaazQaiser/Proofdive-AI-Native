"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type Dispatch, type SetStateAction, useMemo, useRef, useState } from "react";
import { BookOpen, CircleHelp, UserCheck } from "lucide-react";

import type { ChatMessage } from "@/components/chat/chatTypes";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { CardButton } from "@/components/ui/card-button";
import { FaqAssistantThread } from "@/components/faq/FaqAssistantThread";
import { Logo } from "@/components/ui/logo";
import { SelectionChip } from "@/components/ui/selection-chip";
import { useFaqAssistant } from "@/components/faq/useFaqAssistant";
import { OnboardingBackgroundGlow } from "@/app/onboarding/ui/OnboardingBackgroundGlow";
import { OnboardingProgressHeader } from "@/app/onboarding/ui/OnboardingProgressHeader";
import { makeId } from "@/lib/id";
import { reportCountForRole, upsertSavedRole } from "@/lib/proofdiveLogic";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { RoleProfile } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

type Step =
  | "name"
  | "role"
  | "backgroundType"
  | "experienceLevel"
  | "education"
  | "lastWorkedAt"
  | "jobDescription"
  | "resume"
  | "industryVertical"
  | "done";

/** Progress-bar fill per step — the very first question (name) starts the
 * bar empty (0%) rather than pre-filled, since nothing has been answered
 * yet; every step after that still advances in clean 10% increments.
 * Branches that are alternatives to each other (experienceLevel/education)
 * share a tier. */
const STEP_PERCENT: Record<Step, number> = {
  name: 0,
  role: 10,
  backgroundType: 20,
  experienceLevel: 30,
  education: 30,
  lastWorkedAt: 40,
  jobDescription: 50,
  resume: 70,
  industryVertical: 80,
  done: 100,
};

type Draft = {
  name: string;
  targetRole: string;
  backgroundType: NonNullable<RoleProfile["backgroundType"]> | "";
  experienceLevel: NonNullable<RoleProfile["experienceLevel"]> | "";
  education: string;
  lastWorkedAt: string;
  background: string;
  jobDescription: string;
  resume: string;
  industryVertical: string;
};

/** Derives the starting step/draft/messages for a given (possibly still-null,
 * pre-hydration) profile. Called once for the SSR-safe first render (profile
 * is always null then — `useLocalStorageState` defers its localStorage read
 * to an effect) and again once that read completes, so returning users don't
 * get stuck on the "name" step forever. */
function computeInitialOnboardingState(
  profile: RoleProfile | null,
  isEditMode: boolean,
  isNewRoleMode: boolean,
): { step: Step; draft: Draft; messages: ChatMessage[] } {
  const step: Step = isNewRoleMode
    ? profile?.name
      ? "role"
      : "name"
    : isEditMode
      ? "role"
      : profile?.targetRole
        ? "done"
        : profile?.name
          ? "role"
          : "name";

  const draft: Draft = {
    name: profile?.name ?? "",
    targetRole: isNewRoleMode ? "" : profile?.targetRole ?? "",
    backgroundType: isNewRoleMode ? "" : profile?.backgroundType ?? "",
    experienceLevel: isNewRoleMode ? "" : profile?.experienceLevel ?? "",
    education: isNewRoleMode ? "" : profile?.education ?? "",
    lastWorkedAt: isNewRoleMode ? "" : profile?.lastWorkedAt ?? "",
    background: isNewRoleMode ? "" : profile?.background ?? "",
    jobDescription: isNewRoleMode ? "" : profile?.jobDescription ?? "",
    resume: isNewRoleMode ? "" : profile?.resume ?? "",
    industryVertical: isNewRoleMode ? "" : profile?.industryVertical ?? "",
  };

  const namePart = profile?.name?.trim();
  const hasTargetRole = !isNewRoleMode && !isEditMode && Boolean(profile?.targetRole?.trim());

  let firstContent: string;
  if (step === "role") {
    firstContent = `Hey, welcome to proofdive${namePart ? `, ${namePart}` : ""}. I’m your onboarding agent.\n\nFirst up: what’s the role you’re preparing for?`;
  } else if (step === "done") {
    firstContent = `Hey, welcome to proofdive${namePart ? `, ${namePart}` : ""}. I’m your onboarding agent.`;
  } else {
    firstContent =
      "Hey, welcome to proofdive. I’m your onboarding agent.\n\nWhat should I call you?";
  }

  const messages: ChatMessage[] = [
    {
      id: makeId(),
      role: "assistant",
      createdAt: new Date().toISOString(),
      content: firstContent,
    },
  ];
  if (hasTargetRole) {
    messages.push({
      id: makeId(),
      role: "assistant",
      createdAt: new Date().toISOString(),
      content:
        "Everything’s set. Start building your StoryBoard, practice your answers, or explore how ProofDive turns experience into proof.",
    });
  }

  return { step, draft, messages };
}

/** `roleProfile` is always null until `useLocalStorageState` finishes reading
 * localStorage one tick after mount (see its hydration-deferral comment). If
 * the inner agent read it at that point, its `useState` lazy initializers —
 * step/draft/messages — would freeze on the pre-hydration "no profile yet"
 * shape forever, permanently bouncing returning users back to the "name"
 * question. Gating the inner component's mount on hydration instead means its
 * initializers see the real value on their very first run. */
export function OnboardingAgent() {
  const searchParams = useSearchParams();
  const [roleProfile, setRoleProfile, roleProfileHydrated] = useLocalStorageState<
    RoleProfile | null
  >(StorageKeys.roleProfile, null);
  const [, setSavedRoles] = useLocalStorageState<RoleProfile[]>(StorageKeys.savedRoles, []);

  if (!roleProfileHydrated) {
    return <div className="min-h-screen w-full" aria-hidden />;
  }

  return (
    <OnboardingAgentInner
      roleProfile={roleProfile}
      setRoleProfile={setRoleProfile}
      setSavedRoles={setSavedRoles}
      isEditMode={searchParams.get("edit") === "1"}
      isNewRoleMode={searchParams.get("newRole") === "1"}
    />
  );
}

function OnboardingAgentInner({
  roleProfile,
  setRoleProfile,
  setSavedRoles,
  isEditMode,
  isNewRoleMode,
}: {
  roleProfile: RoleProfile | null;
  setRoleProfile: Dispatch<SetStateAction<RoleProfile | null>>;
  setSavedRoles: Dispatch<SetStateAction<RoleProfile[]>>;
  isEditMode: boolean;
  isNewRoleMode: boolean;
}) {
  const faq = useFaqAssistant();

  /** The role title being edited, captured before any in-flow rename, so the
   * matching `savedRoles` entry gets replaced in place rather than duplicated. */
  const originalTitleRef = useRef(roleProfile?.targetRole ?? "");

  /** Returning users (already completed ≥1 mock interview for this role) skip the
   * first-time welcome intro and land directly on the module hub. */
  const homeHref = useMemo(() => {
    const roleTitle = roleProfile?.targetRole?.trim() ?? "";
    return reportCountForRole(roleTitle) > 0 ? "/coach?journey=1" : "/coach?welcome=1";
  }, [roleProfile]);

  const suggestedRoles = useMemo(
    () => [
      "Product Manager",
      "Software Engineer",
      "Data Analyst",
      "UX Designer",
      "Project Manager",
    ],
    [],
  );

  const [step, setStep] = useState<Step>(
    () => computeInitialOnboardingState(roleProfile, isEditMode, isNewRoleMode).step,
  );
  const [draft, setDraft] = useState<Draft>(
    () => computeInitialOnboardingState(roleProfile, isEditMode, isNewRoleMode).draft,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => computeInitialOnboardingState(roleProfile, isEditMode, isNewRoleMode).messages,
  );

  const role = roleProfile?.targetRole?.trim() ?? "";

  function push(role: "assistant" | "user", content: string) {
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role, content, createdAt: new Date().toISOString() },
    ]);
  }

  function finalizeProfile(nextDraft: typeof draft) {
    const finalized: RoleProfile = {
      name: nextDraft.name.trim() || undefined,
      targetRole: nextDraft.targetRole.trim(),
      backgroundType: nextDraft.backgroundType || undefined,
      experienceLevel: nextDraft.experienceLevel || undefined,
      education: nextDraft.education.trim() || undefined,
      lastWorkedAt: nextDraft.lastWorkedAt.trim() || undefined,
      background: nextDraft.background.trim() || undefined,
      jobDescription: nextDraft.jobDescription.trim() || undefined,
      resume: nextDraft.resume.trim() || undefined,
      industryVertical: nextDraft.industryVertical.trim() || undefined,
      createdAt: roleProfile?.createdAt ?? new Date().toISOString(),
    };

    setSavedRoles((prev) => {
      if (isEditMode) {
        return upsertSavedRole(prev, finalized, originalTitleRef.current);
      }
      // Adding a role (or a first-time/legacy finalize): keep whatever was
      // active under its own title before swapping the new one in.
      const withPreviousActive = roleProfile?.targetRole?.trim()
        ? upsertSavedRole(prev, roleProfile)
        : prev;
      return upsertSavedRole(withPreviousActive, finalized);
    });
    setRoleProfile(finalized);
    push(
      "assistant",
      "Everything’s set. Start building your StoryBoard, practice your answers, or explore how ProofDive turns experience into proof.",
    );
    setStep("done");
  }

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  );
  const prompt = lastAssistantMessage?.content ?? "What should I call you?";
  const promptKey = lastAssistantMessage?.id ?? "initial";

  const quickReplies: Array<{ id: string; label: string; value: string }> =
    step === "backgroundType"
      ? [
          { id: "fresh", label: "Fresh grad", value: "fresh_grad" },
          { id: "undergrad", label: "Under grad", value: "under_grad" },
          { id: "diploma", label: "Diploma holder", value: "diploma_holder" },
          { id: "exp", label: "Experienced professional", value: "experienced" },
        ]
      : step === "experienceLevel"
        ? [
            { id: "1-5", label: "1–5 years", value: "1-5" },
            { id: "5-10", label: "5–10 years", value: "5-10" },
            { id: "10+", label: "10+ years", value: "10+" },
          ]
        : step === "education" || step === "lastWorkedAt" || step === "resume"
          ? [{ id: "skip", label: "Skip", value: "skip" }]
          : step === "industryVertical"
            ? [
                { id: "tech", label: "Technology", value: "Technology" },
                { id: "finance", label: "Finance", value: "Finance" },
                { id: "healthcare", label: "Healthcare", value: "Healthcare" },
                { id: "retail", label: "Retail", value: "Retail" },
                { id: "education", label: "Education", value: "Education" },
                { id: "consulting", label: "Consulting", value: "Consulting" },
                { id: "skip", label: "Skip", value: "skip" },
              ]
            : [];

  /** Steps whose only chip is "Skip" offer no real choice — "Select one"
   * doesn't fit since there's nothing to select between; the copy should
   * point back at the free-text answer instead. */
  const isSkipOnlyStep = quickReplies.length === 1 && quickReplies[0].id === "skip";
  const quickReplyHeading = isSkipOnlyStep ? "Reply or skip." : "Select one";

  function who() {
    return "";
  }

  function getPrevStep(current: Step): Step | null {
    switch (current) {
      case "role":
        return "name";
      case "backgroundType":
        return "role";
      case "experienceLevel":
        return "backgroundType";
      case "education":
        return "backgroundType";
      case "lastWorkedAt":
        return "experienceLevel";
      case "jobDescription":
        return draft.backgroundType === "experienced" ? "lastWorkedAt" : "education";
      case "resume":
        return "jobDescription";
      case "industryVertical":
        return "resume";
      default:
        return null;
    }
  }

  const canGoBack =
    step !== "done" &&
    messages.length >= 2 &&
    messages[messages.length - 2]?.role === "user";

  function goBack() {
    const prevStep = getPrevStep(step);
    if (!prevStep) return;
    setMessages((prev) => prev.slice(0, -2));
    setStep(prevStep);
  }

  function handleAnswer(rawText: string) {
    const cleaned = rawText.trim();
    if (!cleaned) return;

    push("user", rawText);

    // Common skip behavior for optional steps.
    const isSkip = /^skip$/i.test(cleaned);

    if (step === "name") {
      const name = cleaned.replace(/\s+/g, " ").slice(0, 40);
      if (name.length < 2) {
        push("assistant", "What should I call you? (e.g., Maaz)");
        return;
      }
      const next = { ...draft, name };
      setDraft(next);
      push(
        "assistant",
        `Hey ${name}, welcome to proofdive. Let’s start.\n\nFirst up: what’s the role you’re preparing for?`,
      );
      setStep("role");
      return;
    }

    if (step === "role") {
      if (role && /^keep$/i.test(cleaned)) {
        push(
          "assistant",
          `${who()}Perfect, we’ll keep it.\n\nNow tell me a bit about you.\nWhat’s your background?`,
        );
        setStep("backgroundType");
        return;
      }

      if (cleaned.length < 2) {
        push("assistant", `${who()}What job role are you preparing for? (e.g., Product Manager)`);
        return;
      }

      const next = { ...draft, targetRole: cleaned };
      setDraft(next);
      push(
        "assistant",
        `Perfect, ${cleaned} it is.\n\nLet’s get things around the ${cleaned} role.\nShare a bit more about your career stage`,
      );
      setStep("backgroundType");
      return;
    }

    if (step === "backgroundType") {
      const v = cleaned.toLowerCase();
      const backgroundType: NonNullable<RoleProfile["backgroundType"]> | null =
        v === "fresh_grad" || v === "fresh grad"
          ? "fresh_grad"
          : v === "under_grad" || v === "under grad" || v === "undergraduate"
            ? "under_grad"
            : v === "diploma_holder" || v === "diploma holder"
              ? "diploma_holder"
              : v === "experienced" || v === "experienced professional"
                ? "experienced"
                : null;

      if (!backgroundType) {
        push(
          "assistant",
          `${who()}Pick one option below, and I’ll tailor everything around it.`,
        );
        return;
      }

      const next = { ...draft, backgroundType };
      setDraft(next);

      if (backgroundType === "experienced") {
        push(
          "assistant",
          "As an experienced professional, can you please quantify your experience in number of years?",
        );
        setStep("experienceLevel");
        return;
      }

      push(
        "assistant",
        "Moving forward!\n\nWould you like to share about your education background (school/university)?",
      );
      setStep("education");
      return;
    }

    if (step === "experienceLevel") {
      const v = cleaned.replace(/\s+/g, "");
      const experienceLevel: NonNullable<RoleProfile["experienceLevel"]> | null =
        v === "1-5" || v === "1–5"
          ? "1-5"
          : v === "5-10" || v === "5–10"
            ? "5-10"
            : v === "10+" || v === "10plus"
              ? "10+"
              : null;

      if (!experienceLevel) {
        push("assistant", `${who()}Pick one of the options below.`);
        return;
      }

      const next = { ...draft, experienceLevel };
      setDraft(next);
      push("assistant", "Moving forward, where did you last work?");
      setStep("lastWorkedAt");
      return;
    }

    if (step === "lastWorkedAt") {
      const next = { ...draft, lastWorkedAt: isSkip ? "" : cleaned };
      setDraft(next);
      push(
        "assistant",
        `${who()}One more thing.\n\nDrop in the job description you're targeting: this one's required so I can tailor everything around it.`,
      );
      setStep("jobDescription");
      return;
    }

    if (step === "education") {
      const next = { ...draft, education: isSkip ? "" : cleaned };
      setDraft(next);
      push(
        "assistant",
        `${who()}One more thing.\n\nDrop in the job description you're targeting: this one's required so I can tailor everything around it.`,
      );
      setStep("jobDescription");
      return;
    }

    if (step === "jobDescription") {
      if (isSkip || !cleaned) {
        push(
          "assistant",
          "The job description is required. Paste it in or upload the file, and I'll take it from there.",
        );
        return;
      }
      const next = { ...draft, jobDescription: cleaned };
      setDraft(next);
      push(
        "assistant",
        "Got it. If you also have a resume, drop it here. It's totally optional, but it helps me prep you way better for this role.",
      );
      setStep("resume");
      return;
    }

    if (step === "resume") {
      const next = { ...draft, resume: isSkip ? "" : cleaned };
      setDraft(next);
      push(
        "assistant",
        "Almost there! Which industry vertical are you targeting? Pick one below or type your own.",
      );
      setStep("industryVertical");
      return;
    }

    if (step === "industryVertical") {
      const next = { ...draft, industryVertical: isSkip ? "" : cleaned };
      setDraft(next);
      finalizeProfile(next);
      return;
    }

    if (step === "done") {
      push(
        "assistant",
        "You’re already onboarded. Want to update your role/background, or jump into Storyboard?",
      );
    }
  }

  function handleUpload(files: File[]) {
    const file = files[0];
    if (!file) return;
    handleAnswer(`📎 ${file.name}`);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background">
      <OnboardingBackgroundGlow />
      <header className="relative z-10 flex h-20 w-full shrink-0 items-center px-12">
        <Link href="/">
          <Logo size="xxs" />
        </Link>
      </header>
      <div className="relative mx-auto flex w-[800px] max-w-full flex-1 flex-col px-6 pb-32 pt-4">
        <OnboardingProgressHeader
          percent={STEP_PERCENT[step]}
          onBack={canGoBack ? goBack : undefined}
          homeHref={step === "done" ? homeHref : undefined}
        />

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full">
            <AgentPrompt
              key={promptKey}
              promptKey={promptKey}
              prompt={prompt}
              ariaLabel="Onboarding prompt"
              headingClassName="text-agent-heading text-heading-teal"
              subtextClassName="mt-16 text-agent-question text-text-primary"
              mode="word"
            />
            {step === "role" ? (
              <div className="mt-6 flex w-full flex-col gap-2">
                <div className="text-body-sm font-semibold text-text-secondary">
                  Trending roles
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedRoles.map((r) => (
                    <SelectionChip key={r} onClick={() => handleAnswer(r)}>
                      {r}
                    </SelectionChip>
                  ))}
                </div>
              </div>
            ) : null}
            {quickReplies.length ? (
              <div className="mt-6 flex w-full flex-col gap-2">
                <div className="text-body-sm font-semibold text-text-secondary">
                  {quickReplyHeading}
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((opt) => (
                    <SelectionChip key={opt.id} onClick={() => handleAnswer(opt.value)}>
                      {opt.label}
                    </SelectionChip>
                  ))}
                </div>
              </div>
            ) : null}
            {step === "done" ? (
              <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <CardButton
                  href="/storyboard"
                  variant="primary"
                  icon={<BookOpen />}
                  title="Storyboard"
                  subtitle="Build your career storyboard"
                />

                <CardButton
                  href="/interview"
                  variant="gray"
                  icon={<UserCheck />}
                  title="Start mock interview"
                  subtitle={`Evaluate yourself for the ${role || "selected"} role`}
                />
              </div>
            ) : null}

          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 w-full">
          <div className="mx-auto w-full max-w-[800px] px-6 py-5">
            <ChatComposer
              placeholder={
                step === "done" && faq.isFaqMode
                  ? "Select a question above"
                  : "Reply (type here or use voice)"
              }
              onSend={handleAnswer}
              disabled={step === "done" && faq.isFaqMode}
              uploadAccept=".pdf,.doc,.docx,.txt"
              onUpload={handleUpload}
              showUploadButton={!(step === "done" && faq.isFaqMode)}
              modeToggle={
                step === "done"
                  ? {
                      isActive: faq.isFaqMode,
                      icon: CircleHelp,
                      activeLabel: "FAQ Assistant",
                      onToggle: () => (faq.isFaqMode ? faq.exitFaqMode() : faq.enterFaqMode()),
                    }
                  : undefined
              }
              thread={
                step === "done" && faq.isFaqMode ? (
                  <FaqAssistantThread
                    screenData={faq.screenData}
                    onSelectRootItem={faq.selectRootItem}
                    onSelectFollowup={faq.selectFollowup}
                    onBackToItemMenu={faq.backToItemMenu}
                    onBackToRootMenu={faq.backToRootMenu}
                  />
                ) : undefined
              }
              onThreadClose={
                step === "done" && faq.isFaqMode ? faq.exitFaqMode : undefined
              }
              threadHeaderTitle="FAQ Assistant"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
