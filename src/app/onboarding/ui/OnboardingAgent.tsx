"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessage } from "@/components/chat/chatTypes";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { Logo } from "@/components/ui/logo";
import { makeId } from "@/lib/id";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { RoleProfile } from "@/lib/proofdiveTypes";
import { ONBOARDING_INTRO_VIDEO_SRC } from "@/lib/onboardingIntroVideo";
import { readJson } from "@/lib/storage";
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

export function OnboardingAgent() {
  const router = useRouter();
  const [introModalOpen, setIntroModalOpen] = useState(false);
  const introVideoRef = useRef<HTMLVideoElement>(null);

  // Real routing guard, not just a hidden button: re-checked on every mount so
  // direct URL entry, browser back/forward, and refresh can't skip consent.
  const [hasConsent, setHasConsent] = useState(false);
  useEffect(() => {
    if (!readJson<boolean>(StorageKeys.termsConsent)) {
      router.replace("/consent");
      return;
    }
    setHasConsent(true);
  }, [router]);

  const [roleProfile, setRoleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );

  const closeIntroModal = useCallback(() => {
    const v = introVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setIntroModalOpen(false);
  }, []);

  const skipIntroAndOpenCoachWelcome = useCallback(() => {
    closeIntroModal();
    router.push("/coach?welcome=1");
  }, [closeIntroModal, router]);

  useEffect(() => {
    if (!introModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeIntroModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [introModalOpen, closeIntroModal]);

  useEffect(() => {
    if (!introModalOpen) return;
    void introVideoRef.current?.play().catch(() => {});
  }, [introModalOpen]);

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

  const [step, setStep] = useState<Step>(() => {
    if (roleProfile?.targetRole) return "done";
    return roleProfile?.name ? "role" : "name";
  });
  const [draft, setDraft] = useState<{
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
  }>(() => ({
    name: roleProfile?.name ?? "",
    targetRole: roleProfile?.targetRole ?? "",
    backgroundType: roleProfile?.backgroundType ?? "",
    experienceLevel: roleProfile?.experienceLevel ?? "",
    education: roleProfile?.education ?? "",
    lastWorkedAt: roleProfile?.lastWorkedAt ?? "",
    background: roleProfile?.background ?? "",
    jobDescription: roleProfile?.jobDescription ?? "",
    resume: roleProfile?.resume ?? "",
    industryVertical: roleProfile?.industryVertical ?? "",
  }));

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const namePart = roleProfile?.name?.trim();
    const hasTargetRole = Boolean(roleProfile?.targetRole?.trim());
    const initialStep: Step = hasTargetRole ? "done" : namePart ? "role" : "name";

    let firstContent: string;
    if (initialStep === "role") {
      firstContent = `hey — welcome to proofdive${namePart ? `, ${namePart}` : ""}. i’m your onboarding agent.\n\nFirst up: what’s the role you’re preparing for?`;
    } else if (initialStep === "done") {
      firstContent = `hey — welcome to proofdive${namePart ? `, ${namePart}` : ""}. i’m your onboarding agent.`;
    } else {
      firstContent =
        "hey — welcome to proofdive. i’m your onboarding agent.\n\nWhat should I call you?";
    }

    const base: ChatMessage[] = [
      {
        id: makeId(),
        role: "assistant",
        createdAt: new Date().toISOString(),
        content: firstContent,
      },
    ];
    if (hasTargetRole) {
      base.push({
        id: makeId(),
        role: "assistant",
        createdAt: new Date().toISOString(),
        content:
          "Everything’s set. Start building your StoryBoard, practice your answers, or explore how ProofDive turns experience into proof.",
      });
    }
    return base;
  });

  const role = roleProfile?.targetRole?.trim() ?? "";

  function push(role: "assistant" | "user", content: string) {
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role, content, createdAt: new Date().toISOString() },
    ]);
  }

  function finalizeProfile(nextDraft: typeof draft) {
    setRoleProfile({
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
    });
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
        `hey ${name} — welcome to proofdive.\n\nLet’s start with your story and get you interview-ready.\n\nFirst up: what’s the role you’re preparing for?`,
      );
      setStep("role");
      return;
    }

    if (step === "role") {
      if (role && /^keep$/i.test(cleaned)) {
        push(
          "assistant",
          `${who()}perfect — we’ll keep it.\n\nNow tell me a bit about you.\nWhat’s your background?`,
        );
        setStep("backgroundType");
        return;
      }

      if (cleaned.length < 2) {
        push("assistant", `${who()}what job role are you preparing for? (e.g., Product Manager)`);
        return;
      }

      const next = { ...draft, targetRole: cleaned };
      setDraft(next);
      push(
        "assistant",
        `Perfect — ${cleaned} it is.\n\nlet’s get things around the ${cleaned} role.\nShare a bit more about your career stage`,
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
          `${who()}pick one option below — I’ll tailor everything around it.`,
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
        "Moving forward, would you like to share about your education background (school/university)?",
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
        push("assistant", `${who()}pick one of the options below.`);
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
        `${who()}one more thing.\n\nDrop in the job description you're targeting — this one's required so I can tailor everything around it.`,
      );
      setStep("jobDescription");
      return;
    }

    if (step === "education") {
      const next = { ...draft, education: isSkip ? "" : cleaned };
      setDraft(next);
      push(
        "assistant",
        `${who()}one more thing.\n\nDrop in the job description you're targeting — this one's required so I can tailor everything around it.`,
      );
      setStep("jobDescription");
      return;
    }

    if (step === "jobDescription") {
      if (isSkip || !cleaned) {
        push(
          "assistant",
          "The job description is required — paste it in or upload the file, and I'll take it from there.",
        );
        return;
      }
      const next = { ...draft, jobDescription: cleaned };
      setDraft(next);
      push(
        "assistant",
        "Got it. If you also have a resume, drop it here — totally optional, but it helps me prep you way better for this role.",
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
    if (step !== "jobDescription" && step !== "resume") return;
    handleAnswer(`📎 ${file.name}`);
  }

  if (!hasConsent) return null;

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex min-h-screen w-[800px] max-w-full flex-col pb-32 pt-10">
        <div className="flex items-center justify-between gap-3 px-6">
          <Logo size="xxs" />
          {canGoBack ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 transition hover:text-gray-800"
              aria-label="Go back to previous step"
            >
              ← Back
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full">
            <AgentPrompt
              key={promptKey}
              promptKey={promptKey}
              prompt={prompt}
              ariaLabel="Onboarding prompt"
            />
            <div className="mt-4 w-full text-left text-2xl text-[var(--app-muted)]">
              {quickReplies.length
                ? "Type your answer, use voice, or pick an option."
                : "Type your answer or use voice."}
            </div>
            {step === "role" ? (
              <div className="mt-6 w-full">
                <div className="text-xs font-extrabold tracking-[0.22em] text-gray-600">
                  SUGGESTED ROLES
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedRoles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleAnswer(r)}
                      className="rounded-full border border-[#E2E8F0]/90 bg-white/60 px-4 py-2 text-sm font-extrabold tracking-tight shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-white/70 active:bg-white/80"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {quickReplies.length ? (
              <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {quickReplies.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAnswer(opt.value)}
                    className="rounded-[16px] border border-[#E2E8F0]/90 bg-white/60 px-4 py-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-white/70 active:bg-white/80"
                  >
                    <div className="text-sm font-extrabold tracking-tight">
                      {opt.label}
                    </div>
                    {opt.value === "skip" ? (
                      <div className="mt-1 text-xs text-[var(--app-muted)]">
                        I will share later
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
            {step === "done" ? (
              <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  className="group rounded-[18px] border border-white/50 bg-black text-left text-white shadow-[0_12px_30px_rgba(0,0,0,0.10)] transition hover:bg-black/90 active:bg-black/80"
                  href="/storyboard"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-extrabold tracking-tight">
                        Story Board
                      </div>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-white/20 group-active:bg-white/30">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                          className="h-4 w-4"
                        >
                          <path
                            d="M4 5h16M4 9h10M4 13h7M4 17h5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-white/75">
                      Build your career story board
                    </div>
                  </div>
                </Link>

                <Link
                  className="group rounded-[18px] border border-white/50 bg-white text-black shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition hover:bg-white/70 active:bg-white"
                  href="/interview"
                >
                  <div className="p-5">
                    <div className="text-base font-extrabold tracking-tight">
                      Start a mock interview
                    </div>
                    <div className="mt-1 text-sm text-[var(--app-muted)]">
                      Evaluate yourself for the {role || "selected role"}
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  className="group w-full rounded-[18px] border border-white/50 bg-white text-left text-black shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition hover:bg-white/70 active:bg-white"
                  onClick={() => setIntroModalOpen(true)}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-extrabold tracking-tight">
                        Learn about Proofdive
                      </div>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-black transition group-hover:bg-white/80 group-active:bg-white">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                          className="h-4 w-4"
                        >
                          <path
                            d="M10 8l6 4-6 4V8Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-[var(--app-muted)]">
                      Explore our competency engine in depth
                    </div>
                  </div>
                </button>

                <Link
                  className="group w-full rounded-[18px] border border-white/50 bg-white text-left text-black shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition hover:bg-white/70 active:bg-white"
                  href="/coach?welcome=1"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-extrabold tracking-tight">
                        Go to Home
                      </div>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-black transition group-hover:bg-white/80 group-active:bg-white">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                          className="h-4 w-4"
                        >
                          <path
                            d="M9 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-[var(--app-muted)]">
                      Jump straight to your dashboard
                    </div>
                  </div>
                </Link>
              </div>
            ) : null}

          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[var(--app-bg)]">
          <div className="mx-auto w-full max-w-[840px] px-6 py-5">
            <ChatComposer
              placeholder="Reply (type or use voice)…"
              onSend={handleAnswer}
              showUploadButton={step === "jobDescription" || step === "resume"}
              uploadAccept=".pdf,.doc,.docx,.txt"
              onUpload={handleUpload}
            />
          </div>
        </div>
      </div>

      {introModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 sm:p-8"
          onClick={closeIntroModal}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="intro-video-title"
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-black/10 bg-[var(--app-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] px-4 py-3">
              <span id="intro-video-title" className="min-w-0 flex-1 truncate text-sm font-bold text-black">
                Learn about Proofdive
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={skipIntroAndOpenCoachWelcome}
                  aria-label="Skip intro and open coach welcome"
                  className="inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-bold text-black/60 transition hover:bg-black/[0.05] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:px-4"
                >
                  Skip & Go to home
                </button>
                <button
                  type="button"
                  onClick={closeIntroModal}
                  className="inline-flex h-9 min-w-[72px] items-center justify-center rounded-full border border-black/10 bg-black/[0.04] px-3 text-sm font-bold text-black transition hover:bg-black/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="bg-black p-2 sm:p-3">
              <video
                ref={introVideoRef}
                className="mx-auto max-h-[min(52vh,480px)] w-full rounded-lg object-contain"
                controls
                playsInline
                src={ONBOARDING_INTRO_VIDEO_SRC}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
