"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { makeId } from "@/lib/id";
import { normalizeWhitespace } from "@/lib/proofdiveLogic";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  createStoryboardDraft,
  normalizeStoryboardDocument,
  overallCompetencyStrength,
  type StoryboardDraftDocument,
  type StoryboardDraftStore,
} from "@/lib/storyboardDraft";
import type { Experience, InterviewReport, RoleProfile, StoryboardFromCraft } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

/** Enrichment order matches conversation steps after entry (Goal → … → Outcome). */
const ENRICHMENT_KEYS = [
  "goalObjective",
  "breakdownTools",
  "prioritization",
  "execution",
  "people",
  "outcome",
] as const;

type EnrichmentKey = (typeof ENRICHMENT_KEYS)[number];

/** 0 = Goal/Objective … 5 = Outcome. */
const CONVERSATION_PROMPTS: readonly string[] = [
  `Yeah, that already sounds like a situation worth talking about.

What needed to change there?
And what made it challenging?`,

  `Got it—that kind of misalignment can get messy fast.

How did you start making sense of it?
I'm interested in how you broke things down and brought some structure in.`,

  `That's a strong approach.

When everything feels broken, deciding where to start matters a lot.
How did you choose what to focus on first?`,

  `Makes sense—that's a high-impact move.

What did you actually do to move things forward?
Think in terms of the steps you took and how you pushed this ahead.`,

  `Nice—you didn't just design it, you drove it forward.

How did the team respond?
Did you face any pushback while changing the way they worked?`,

  `That's a big part of the story—getting people aligned.

What changed after all this?
And what did you take away from the experience?`,
];

const CLOSING_PROMPT = `This is coming together really well.

You've got a clear challenge, strong decisions, real actions, and measurable impact—exactly what interviewers look for.

What would you like to do next?`;

/** Sample user lines from the storyboard script (pre-filled in the composer; send to advance). */
const STORY_USER_DEMO_REPLIES: readonly string[] = [
  "I worked at a garment company where inventory tracking was pretty messy.",
  `The goal was to create a clear system for managing SKUs and inventory.
It was challenging because different teams were using their own methods.`,
  `I started by understanding how each team was working.
Then I mapped out their processes and identified where the confusion was happening.`,
  `I focused on standardizing SKU formats first because that was causing most of the confusion.
Other improvements came later.`,
  `I created a standardized SKU structure, redesigned the inventory flow, and worked with the team to implement it.`,
  `Yes, there was resistance at first.
I explained how the new system would reduce errors and save time, which helped get everyone on board.`,
  `Inventory errors reduced a lot, and tracking became easier.
I learned the importance of involving teams early.`,
];

function firstMissingEnrichmentKey(exp: Experience): number | "done" {
  for (let i = 0; i < ENRICHMENT_KEYS.length; i++) {
    const k = ENRICHMENT_KEYS[i]!;
    if (!exp.enrichment?.[k]?.trim()) return i;
  }
  return "done";
}

/**
 * -1: entry (no experience selected) — new story or "Add another"
 * 0–5: coach questions
 * 6: closing
 */
function deriveStoryStep(selected: Experience | null): number {
  if (!selected) return -1;
  const m = firstMissingEnrichmentKey(selected);
  if (m === "done") return 6;
  return m;
}

function parseReportsMap(raw: string | null): Record<string, InterviewReport> | null {
  try {
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, InterviewReport>;
  } catch {
    return null;
  }
}

function latestReportOverallForRole(roleTitle: string): number | null {
  if (typeof window === "undefined" || !roleTitle) return null;
  const map = parseReportsMap(window.localStorage.getItem(StorageKeys.reports));
  if (!map) return null;
  const list = Object.values(map).filter(
    (r) => (r.meta?.roleTitle ?? "").trim() === roleTitle.trim(),
  );
  if (!list.length) return null;
  return [...list].sort(
    (a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime(),
  )[0]?.overallScore ?? null;
}

export function StoryboardAgent() {
  const router = useRouter();
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [experiences, setExperiences] = useLocalStorageState<Experience[]>(
    StorageKeys.experiences,
    [],
  );
  const [fromCraft, setFromCraft] = useLocalStorageState<StoryboardFromCraft | null>(
    StorageKeys.storyboardFromCraft,
    null,
  );
  const [draftStore] = useLocalStorageState<StoryboardDraftStore>(StorageKeys.storyboardDraft, {
    version: 1,
    byRole: {},
  });

  const role = roleProfile?.targetRole?.trim() ?? "";
  const firstName = useMemo(
    () => roleProfile?.name?.trim().split(/\s+/)[0] || "there",
    [roleProfile?.name],
  );
  const roleExperiences = useMemo(
    () => experiences.filter((e) => e.role === role),
    [experiences, role],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingNewEntry, setPendingNewEntry] = useState(false);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [craftUi, setCraftUi] = useState<"idle" | "crafting" | "ready">("idle");

  const postCraftHome = Boolean(
    fromCraft && fromCraft.v === 1 && fromCraft.role === role,
  );

  const storyDraftDocument = useMemo<StoryboardDraftDocument>(() => {
    if (!role) return createStoryboardDraft("");
    const raw = draftStore.byRole[role] ?? createStoryboardDraft(role);
    return normalizeStoryboardDocument(raw);
  }, [draftStore, role]);

  const storyOverallScore = useMemo(
    () => overallCompetencyStrength(storyDraftDocument),
    [storyDraftDocument],
  );

  /** Draft mean of 12 competencies; if still 0, align with latest mock report for this role (same as Coach). */
  const storyScoreForCard = useMemo(() => {
    if (storyOverallScore > 0) return storyOverallScore;
    const fromReport = latestReportOverallForRole(role);
    if (fromReport != null && Number.isFinite(fromReport)) return fromReport;
    return storyOverallScore;
  }, [storyOverallScore, role]);

  /** Unset until user starts a fresh story, then latest pick or the first in the list. */
  const activeExperienceId = useMemo(() => {
    if (pendingNewEntry) return null;
    if (selectedId != null) return selectedId;
    return roleExperiences[0]?.id ?? null;
  }, [selectedId, pendingNewEntry, roleExperiences]);

  const selected = useMemo(
    () => roleExperiences.find((e) => e.id === activeExperienceId) ?? null,
    [roleExperiences, activeExperienceId],
  );
  const storyStep = deriveStoryStep(selected);

  const entryPrompt = useMemo(
    () =>
      `Hey ${firstName} — let's turn your real experiences into a story you can confidently tell in an interview.

Start simple. What's something you worked on that stands out?`,
    [firstName],
  );

  const storyPrompt = useMemo(() => {
    if (storyStep === -1) return entryPrompt;
    if (storyStep >= 0 && storyStep <= 5) {
      return CONVERSATION_PROMPTS[storyStep] ?? "Use the field below to continue.";
    }
    return CLOSING_PROMPT;
  }, [entryPrompt, storyStep]);

  const storyPromptKey = `${activeExperienceId ?? "none"}-${pendingNewEntry ? "new" : "cont"}-${storyStep}`;

  const exampleReplyPrefill = useMemo(() => {
    if (storyStep === 6) return "";
    if (storyStep === -1) return STORY_USER_DEMO_REPLIES[0] ?? "";
    return STORY_USER_DEMO_REPLIES[storyStep + 1] ?? "";
  }, [storyStep]);

  const replyPrefillKey = `${activeExperienceId ?? "none"}-${pendingNewEntry ? "1" : "0"}-${storyStep}`;

  const composerPlaceholder = useMemo(() => {
    if (storyStep === 6) return "Choose an option above";
    if (storyStep === -1) return "Share something you worked on (type or voice)…";
    return "Your answer (type or voice) — send to go to the next question…";
  }, [storyStep]);

  function startCrafting() {
    if (craftUi === "crafting") return;
    setStatusLine("It will take a moment — I’m crafting your story…");
    setCraftUi("crafting");
    window.setTimeout(() => {
      setCraftUi("ready");
      setStatusLine(null);
    }, 900);
  }

  function upsertExperience(next: Experience) {
    setExperiences((prev) => {
      const idx = prev.findIndex((e) => e.id === next.id);
      if (idx === -1) return [next, ...prev];
      const copy = prev.slice();
      copy[idx] = next;
      return copy;
    });
  }

  function updateEnrichmentKey(key: EnrichmentKey, value: string) {
    if (!selected) return;
    const next: Experience = {
      ...selected,
      enrichment: {
        ...(selected.enrichment ?? {}),
        [key]: value,
        updatedAt: new Date().toISOString(),
      },
    };
    upsertExperience(next);
  }

  if (!role) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <Card>
            <CardBody>
              <h2 className="text-4xl font-extrabold tracking-tight">
                First, set a target role.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
                Story banks are saved per role. Once you pick a role, we’ll build
                at least 3 experiences and enrich them into proof.
              </p>
              <div className="mt-6 flex gap-2">
                <Link href="/onboarding">
                  <Button>Go to onboarding</Button>
                </Link>
                <Link href="/coach?journey=1">
                  <Button variant="secondary">Back to Coach</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
        <CoachBottomChatBar />
      </AppShell>
    );
  }

  function handleText(text: string) {
    setStatusLine(null);

    if (storyStep === 6) {
      return;
    }

    if (storyStep === -1) {
      const cleaned = normalizeWhitespace(text);
      if (cleaned.length < 8) {
        setStatusLine("Add a little more—what you worked on and why it mattered helps.");
        return;
      }
      const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);
      let title: string;
      let raw: string;
      if (lines.length >= 2) {
        title = (lines[0] ?? "").slice(0, 80);
        raw = lines.slice(1).join("\n").trim() || cleaned;
      } else {
        const one = lines[0] ?? cleaned;
        const cut = one.length > 80 ? 77 : one.length;
        title = (one.length > 80 ? `${one.slice(0, cut).trim()}…` : one).trim();
        raw = cleaned;
      }
      if (title.length < 2) {
        setStatusLine("Try a short label on the first line, then a few lines of detail under it.");
        return;
      }
      const exp: Experience = {
        id: makeId(),
        role,
        title,
        raw,
        createdAt: new Date().toISOString(),
      };
      setExperiences((prev) => [exp, ...prev]);
      setSelectedId(exp.id);
      setPendingNewEntry(false);
      return;
    }

    if (storyStep >= 0 && storyStep <= 5) {
      const key = ENRICHMENT_KEYS[storyStep]!;
      updateEnrichmentKey(key, normalizeWhitespace(text));
    }
  }

  return (
    <AppShell>
      <CoachFloatingNav />
      <div className="space-y-6 pb-44">
        <div className="px-6">
          <div className="p-0">
            {postCraftHome ? (
              <div className="mx-auto w-[672px] max-w-full space-y-6">
                <div className="space-y-3">
                  <h2 className="text-left text-[34px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
                    Hey {firstName} — we’ve crafted a story.
                  </h2>
                  <p className="text-left text-lg font-semibold leading-snug tracking-tight text-black/80 sm:text-xl">
                    For the role of <span className="text-gray-900">{role}</span>
                  </p>
                  <p className="text-left text-sm leading-6 text-[var(--app-muted)] sm:text-base">
                    You can still add more to your story to get better results.
                  </p>
                </div>
                <Card className="shadow-none">
                  <CardBody>
                    <div className="text-xs font-semibold tracking-[0.18em] text-[var(--app-muted)]">
                      YOUR STORYBOARD
                    </div>
                    <div className="mt-2 text-base font-extrabold tracking-tight">
                      Your storyboard for {role} is ready to review.
                    </div>
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-white/50 bg-white/50 px-4 py-3">
                      <div>
                        <div className="text-sm font-bold tracking-tight">Overall story score</div>
                        <div className="text-xs text-[var(--app-muted)]">
                          Mean of 12 competencies (0–5)
                        </div>
                      </div>
                      <div
                        className="text-3xl font-extrabold tabular-nums tracking-tight"
                        title="Mean of 12 competency sections in your draft, or latest mock interview overall if the draft is still empty"
                      >
                        {storyScoreForCard.toFixed(1)}
                        <span className="pl-1 text-lg font-extrabold text-[var(--app-muted)]">
                          / 5
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button type="button" onClick={() => router.push("/storyboard/crafting")}>
                        View story
                      </Button>
                    </div>
                  </CardBody>
                </Card>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setFromCraft(null);
                    setPendingNewEntry(true);
                    setSelectedId(null);
                    setStatusLine(null);
                    setCraftUi("idle");
                  }}
                >
                  Add another experience
                </Button>
              </div>
            ) : (
              <>
                <AgentPrompt
                  promptKey={storyPromptKey}
                  prompt={storyPrompt}
                  ariaLabel="Storyboard prompt"
                />
                {storyStep === 6 && craftUi !== "ready" ? (
                  <div className="mx-auto mt-8 w-[672px] max-w-full">
                    <Button
                      className="w-full"
                      type="button"
                      onClick={startCrafting}
                      disabled={craftUi === "crafting"}
                    >
                      Craft my story
                    </Button>
                  </div>
                ) : null}
                {storyStep === 6 && craftUi === "ready" ? (
                  <div className="mx-auto mt-8 w-[672px] max-w-full">
                    <Card className="shadow-none">
                      <CardBody>
                        <div className="text-xs font-semibold tracking-[0.18em] text-[var(--app-muted)]">
                          YOUR STORYBOARD
                        </div>
                        <div className="mt-2 text-base font-extrabold tracking-tight">
                          Your storyboard for {role} is here.
                        </div>
                        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-white/50 bg-white/50 px-4 py-3">
                          <div>
                            <div className="text-sm font-bold tracking-tight">Overall story score</div>
                            <div className="text-xs text-[var(--app-muted)]">
                              Mean of 12 competencies (0–5)
                            </div>
                          </div>
                          <div
                            className="text-3xl font-extrabold tabular-nums tracking-tight"
                            title="Mean strength across the 12 competency sections, or latest mock interview if draft is empty"
                          >
                            {storyScoreForCard.toFixed(1)}
                            <span className="pl-1 text-lg font-extrabold text-[var(--app-muted)]">
                              / 5
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button
                            type="button"
                            onClick={() => router.push("/storyboard/crafting")}
                          >
                            View story
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                    <div className="mt-6 w-full">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          setPendingNewEntry(true);
                          setSelectedId(null);
                          setStatusLine(null);
                          setCraftUi("idle");
                        }}
                      >
                        Add another experience
                      </Button>
                    </div>
                  </div>
                ) : null}
                {statusLine ? (
                  <p className="mx-auto mt-6 w-[672px] max-w-full text-sm font-medium leading-6 text-gray-800">
                    {statusLine}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      <CoachBottomChatBar
        placeholder={postCraftHome ? "Add another experience to start a new story…" : composerPlaceholder}
        onSend={handleText}
        disabled={postCraftHome || storyStep === 6 || craftUi === "crafting"}
        prefill={postCraftHome ? "" : exampleReplyPrefill}
        prefillKey={postCraftHome ? "post-craft" : replyPrefillKey}
      />
    </AppShell>
  );
}
