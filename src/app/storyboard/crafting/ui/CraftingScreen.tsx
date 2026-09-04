"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ChevronDown, CircleDashed, Download, FileCheck, Gauge, GraduationCap, Lock, MessageCircleQuestion, Bot, Network, Scale, SquarePen, Plus, Save, Tags, Unlock, X } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { GenericUpgradeModal } from "@/components/GenericUpgradeModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";
import { SelectionChip } from "@/components/ui/selection-chip";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  SuccessDriverCompetencyPill,
  SuccessDriverInfoTip,
  SuccessDriverMark,
} from "@/components/ui/success-driver-card";
import { computeCandidateUsage } from "@/lib/candidateUsage";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  COMPETENCY_SPECS,
  type CarBlock,
  type CompetencyId,
  type PillarId,
  type StoryboardDive,
  classifySecondaryCompetencies,
  commitSavedDive,
  diveById,
  editingDiveForRole,
  introStrengthScore,
  latestSavedDive,
  MAX_DIVES_PER_ROLE,
  remainingDives,
  normalizeDive,
  recomputeDiveScores,
  strengthScore,
  upsertEditingDive,
} from "@/lib/storyboardDraft";
import {
  CAR_WORD_HARD_CAP,
  INTRO_WORD_HARD_CAP,
  LARGE_PASTE_CHAR_THRESHOLD,
  carTotalWords,
  clampToWordCap,
  isLargePaste,
} from "@/lib/storyboardGuardrails";
import { SUCCESS_DRIVER_ORDER, SUCCESS_DRIVERS } from "@/lib/successDrivers";
import { scoringFillClass, scoringBandForScore } from "@/lib/scoringPalette";
import type { InterviewReport, RoleProfile, TrainingJourneyProgress } from "@/lib/proofdiveTypes";
import {
  competencySpec,
  pillarForCompetency,
} from "@/lib/demoFocusCompetencies";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useStoryboardDiveStore } from "@/lib/useStoryboardDiveStore";
import {
  useCandidateEntitlements,
  useCandidateSubscription,
} from "@/lib/useSubscriberPayments";
import { cn } from "@/lib/utils";
import {
  buildSoftwareEngineerDive4,
  SOFTWARE_ENGINEER_DIVE4_CANDIDATE,
  SOFTWARE_ENGINEER_DIVE4_ID,
  SOFTWARE_ENGINEER_DIVE4_ROLE,
} from "@/app/storyboard/crafting/softwareEngineerDive4Fixture";
import type { CompetencyAssessment } from "@/lib/storyboardDraft";

const PILLAR_ORDER = SUCCESS_DRIVER_ORDER;

/** Bright scoring fills for large dive-card numerals (Figma color/scoring/*). */
function diveScoreTextClass(score: number | null | undefined): string {
  const type = "font-gilroy";
  if (score == null || !Number.isFinite(score)) return `${type} text-text-secondary`;
  const band = scoringBandForScore(score);
  if (band === "cyan") return `${type} text-scoring-cyan`;
  if (band === "green") return `${type} text-scoring-green`;
  if (band === "yellow") return `${type} text-scoring-yellow`;
  return `${type} text-scoring-red`;
}

const TA =
  "min-h-24 w-full rounded-md border border-border bg-card px-4 py-3 text-caption leading-6 text-text-primary outline-none ring-0 placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-60 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const COMPETENCY_REGEN_LIMIT = 2;

/** Quick-action presets for the inline Edit / regenerate bar (craft + read-only). */
/* Every action here preserves the evidence. The previous set ("More
 * dramatic", "Executive polish") asked the AI to change tone, which sits
 * badly against guardrails that forbid inventing or inflating — and read as
 * a writing tool rather than a coach. These ask for what interviewers reward. */
const STORYBOARD_IMPROVE_CHIPS = [
  {
    id: "tighten",
    label: "Tighten",
    prompt:
      "Remove filler and repetition so the story is shorter and clearer, keeping every fact exactly as stated.",
  },
  {
    id: "clarify-context",
    label: "Clarify the situation",
    prompt:
      "Make the setting, the constraint and what was at stake easier to picture in the first two sentences, using only details already given.",
  },
  {
    id: "make-ownership-explicit",
    label: "Make my role explicit",
    prompt:
      "Rephrase so what I personally decided and did is unmistakable — “I” where it was me, “we” only where it truly was the team.",
  },
  {
    id: "add-result",
    label: "Sharpen the result",
    prompt:
      "Lead the result with the clearest before → after change already described; do not add numbers that are not in the evidence.",
  },
] as const;

/** Compact chip sizing scoped to the storyboard improve bar only. */
const improveChipClassName =
  "h-7 pl-2.5 pr-2.5 text-[12px] font-medium leading-none";

type StoryboardImproveChipId = (typeof STORYBOARD_IMPROVE_CHIPS)[number]["id"];

function shortSentence(text: string) {
  return text.trim().replace(/\s+/g, " ").replace(/[.?!]+$/g, "");
}

function clampSentence(text: string, maxWords: number) {
  return clampToWordCap(shortSentence(text), maxWords);
}

function regenerateCompetencyCar(car: CarBlock, instruction: string): CarBlock {
  const note = shortSentence(instruction);
  if (!note) return car;
  const lower = note.toLowerCase();

  if (/(result|impact|outcome|metric|measur)/.test(lower)) {
    return {
      ...car,
      result: clampSentence(`${car.result}. Updated emphasis: ${note}.`, 42),
    };
  }
  if (/(context|situation|background|stake|constraint)/.test(lower)) {
    return {
      ...car,
      context: clampSentence(`${car.context}. Updated context: ${note}.`, 42),
    };
  }
  if (/(action|ownership|decision|led|did|approach)/.test(lower)) {
    return {
      ...car,
      action: clampSentence(`${car.action}. Updated action: ${note}.`, 42),
    };
  }
  return {
    context: clampSentence(`${car.context}. ${note}.`, 38),
    action: clampSentence(`${car.action}. I also ${note}.`, 38),
    result: clampSentence(`${car.result}. This sharpened the outcome around ${note}.`, 38),
  };
}

function regenerateIntroText(current: string, instruction: string) {
  const note = shortSentence(instruction);
  if (!note) return current;
  return clampToWordCap(`${current}\n\nUpdated emphasis: ${note}.`, INTRO_WORD_HARD_CAP);
}

function formatDownloadTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatReportScore(score: number | null | undefined) {
  if (score == null || !Number.isFinite(score) || score <= 0) return "—";
  return score.toFixed(1);
}

export function CraftingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasTriggeredPrintRef = useRef(false);
  const [printRequest, setPrintRequest] = useState<{ stamp: string; id: number } | null>(
    null,
  );
  const [roleProfile, setRoleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [diveStore, setDiveStore, diveHydrated] = useStoryboardDiveStore();
  const [pasteWarning, setPasteWarning] = useState<string | null>(null);
  const [subscription] = useCandidateSubscription();
  const [entitlements] = useCandidateEntitlements();
  const { bundles } = usePaymentBundles();
  const [reports] = useLocalStorageState<Record<string, InterviewReport>>(StorageKeys.reports, {});
  const [trainingProgress] = useLocalStorageState<Record<string, TrainingJourneyProgress>>(
    StorageKeys.trainingProgress,
    {},
  );
  const [storyboardGenerationCount, setStoryboardGenerationCount] = useLocalStorageState<number>(
    StorageKeys.candidateStoryboardGenerations,
    0,
  );
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const activeBundle =
    subscription.bundleId != null
      ? bundles.find((b) => b.id === subscription.bundleId) ?? null
      : null;

  const usage = useMemo(
    () =>
      computeCandidateUsage({
        subscription,
        entitlements,
        activeBundle,
        reports,
        diveStore,
        trainingProgress,
        storyboardGenerationCount,
      }),
    [
      subscription,
      entitlements,
      activeBundle,
      reports,
      diveStore,
      trainingProgress,
      storyboardGenerationCount,
    ],
  );

  const role = roleProfile?.targetRole?.trim() ?? "";
  const diveParam = (searchParams.get("dive") ?? "").trim();
  const fromPreviousDive = searchParams.get("from") === "previous";

  // Seed Software Engineer Dive 4 from the PDF fixture when opening that dive URL
  // (or when the role bank is empty for Software Engineer).
  useEffect(() => {
    if (!diveHydrated) return;

    if (diveParam === SOFTWARE_ENGINEER_DIVE4_ID) {
      const currentRole = roleProfile?.targetRole?.trim() ?? "";
      if (currentRole !== SOFTWARE_ENGINEER_DIVE4_ROLE) {
        setRoleProfile({
          ...(roleProfile ?? {}),
          name: roleProfile?.name?.trim() || SOFTWARE_ENGINEER_DIVE4_CANDIDATE,
          targetRole: SOFTWARE_ENGINEER_DIVE4_ROLE,
          createdAt: roleProfile?.createdAt ?? new Date().toISOString(),
        });
      }
    }

    const activeRole = roleProfile?.targetRole?.trim() ?? "";
    const wantsFixture =
      diveParam === SOFTWARE_ENGINEER_DIVE4_ID ||
      (!diveParam && activeRole === SOFTWARE_ENGINEER_DIVE4_ROLE);

    if (!wantsFixture && activeRole !== SOFTWARE_ENGINEER_DIVE4_ROLE) return;

    setDiveStore((prev) => {
      const bank = prev.byRole[SOFTWARE_ENGINEER_DIVE4_ROLE];
      const existing = bank?.dives.find((d) => d.id === SOFTWARE_ENGINEER_DIVE4_ID);
      if (existing?.intro.text.trim() && existing.competencies.some((c) => c.assessment)) {
        return prev;
      }
      const fixture = buildSoftwareEngineerDive4();
      const otherDives = (bank?.dives ?? []).filter((d) => d.id !== SOFTWARE_ENGINEER_DIVE4_ID);
      return {
        ...prev,
        byRole: {
          ...prev.byRole,
          [SOFTWARE_ENGINEER_DIVE4_ROLE]: {
            dives: [...otherDives, fixture],
          },
        },
      };
    });
  }, [diveHydrated, diveParam, roleProfile, setDiveStore, setRoleProfile]);

  const activeDive = useMemo(() => {
    if (!diveHydrated) return null;
    if (diveParam) {
      if (role) {
        const inRole = diveById(diveStore, role, diveParam);
        if (inRole) return inRole;
      }
      for (const r of Object.keys(diveStore.byRole)) {
        const found = diveById(diveStore, r, diveParam);
        if (found) return found;
      }
      return null;
    }
    if (!role) return null;
    return editingDiveForRole(diveStore, role) ?? latestSavedDive(diveStore, role);
  }, [role, diveHydrated, diveParam, diveStore]);

  const readOnly = Boolean(activeDive && activeDive.status === "saved");
  const maxDives = usage.storyboardLimit > 0 ? usage.storyboardLimit : MAX_DIVES_PER_ROLE;
  const divesLeftAfterSave = Math.max(
    0,
    (role && diveHydrated ? remainingDives(diveStore, role, maxDives) : maxDives) - 1,
  );
  const inProgressDive = Boolean(
    role && diveHydrated && editingDiveForRole(diveStore, role),
  );
  const addCompetencyDisabled = fromPreviousDive || inProgressDive;

  const updateDive = useCallback(
    (updater: (d: StoryboardDive) => StoryboardDive) => {
      if (!role || !activeDive || activeDive.status === "saved") return;
      setDiveStore((prev) => {
        const cur = editingDiveForRole(prev, role);
        if (!cur || cur.id !== activeDive.id) return prev;
        const next = recomputeDiveScores(normalizeDive(updater(structuredClone(cur))));
        return upsertEditingDive(prev, next);
      });
    },
    [role, activeDive, setDiveStore],
  );

  const updateActiveDive = useCallback(
    (updater: (d: StoryboardDive) => StoryboardDive) => {
      if (!role || !activeDive) return;
      setDiveStore((prev) => {
        const bank = prev.byRole[role];
        if (!bank) return prev;
        const nextDives = bank.dives.map((d) => {
          if (d.id !== activeDive.id) return d;
          return recomputeDiveScores(normalizeDive(updater(structuredClone(d))));
        });
        return {
          ...prev,
          byRole: { ...prev.byRole, [role]: { dives: nextDives } },
        };
      });
    },
    [role, activeDive, setDiveStore],
  );

  const handleCompetencyRegenerate = useCallback(
    (index: number, instruction: string) => {
      if (!activeDive) return { ok: false, reason: "missing" as const };
      if (usage.isStoryboardAtLimit) {
        setUpgradeModalOpen(true);
        return { ok: false, reason: "limit" as const };
      }
      const section = activeDive.competencies[index];
      if (!section) return { ok: false, reason: "missing" as const };
      if (section.regenCount >= COMPETENCY_REGEN_LIMIT) {
        return { ok: false, reason: "limit" as const };
      }
      const trimmed = instruction.trim();
      if (!trimmed) return { ok: false, reason: "empty" as const };

      updateActiveDive((d) => {
        const competencies = d.competencies.map((c, i) =>
          i === index
            ? {
                ...c,
                car: regenerateCompetencyCar(c.car, trimmed),
                regenCount: (c.regenCount ?? 0) + 1,
              }
            : c,
        );
        return { ...d, competencies };
      });
      setStoryboardGenerationCount((n) => n + 1);
      return { ok: true as const };
    },
    [activeDive, updateActiveDive, usage.isStoryboardAtLimit, setStoryboardGenerationCount],
  );

  const handleIntroRegenerate = useCallback(
    (instruction: string) => {
      if (!activeDive) return { ok: false, reason: "missing" as const };
      if (usage.isStoryboardAtLimit) {
        setUpgradeModalOpen(true);
        return { ok: false, reason: "limit" as const };
      }
      if ((activeDive.intro.regenCount ?? 0) >= COMPETENCY_REGEN_LIMIT) {
        return { ok: false, reason: "limit" as const };
      }
      const trimmed = instruction.trim();
      if (!trimmed) return { ok: false, reason: "empty" as const };

      updateActiveDive((d) => ({
        ...d,
        intro: {
          ...d.intro,
          text: regenerateIntroText(d.intro.text, trimmed),
          regenCount: (d.intro.regenCount ?? 0) + 1,
        },
      }));
      setStoryboardGenerationCount((n) => n + 1);
      return { ok: true as const };
    },
    [activeDive, updateActiveDive, usage.isStoryboardAtLimit, setStoryboardGenerationCount],
  );

  useEffect(() => {
    if (searchParams.get("print") !== "1") {
      hasTriggeredPrintRef.current = false;
      return;
    }
    if (hasTriggeredPrintRef.current) return;
    hasTriggeredPrintRef.current = true;
    const stamp = formatDownloadTimestamp(new Date());
    setPrintRequest({ stamp, id: Date.now() });
    // Replace the URL only after print is invoked so effect cleanup does not
    // cancel the timeout when `print` is stripped from searchParams.
    const id = window.setTimeout(() => {
      window.print();
      const diveQs = diveParam ? `?dive=${encodeURIComponent(diveParam)}` : "";
      router.replace(`/storyboard/crafting${diveQs}`);
    }, 200);
    return () => window.clearTimeout(id);
  }, [searchParams, router, diveParam]);

  useEffect(() => {
    if (!printRequest || searchParams.get("print") === "1") return;
    if (hasTriggeredPrintRef.current) return;
    hasTriggeredPrintRef.current = true;
    const id = window.setTimeout(() => {
      window.print();
      hasTriggeredPrintRef.current = false;
    }, 50);
    return () => window.clearTimeout(id);
  }, [printRequest, searchParams]);

  const handleSaveStoryboard = useCallback(() => {
    if (!role || !activeDive || activeDive.status === "saved") return;
    setDiveStore((prev) => commitSavedDive(prev, activeDive));
    setStoryboardGenerationCount((n) => n + 1);
    router.push("/storyboard");
  }, [role, activeDive, setDiveStore, router, setStoryboardGenerationCount]);

  const handleDownload = useCallback(() => {
    if (!activeDive) return;
    hasTriggeredPrintRef.current = false;
    setPrintRequest({ stamp: formatDownloadTimestamp(new Date()), id: Date.now() });
  }, [activeDive]);

  const printTimestamp = printRequest?.stamp ?? "";
  const candidateName = roleProfile?.name?.trim() || "Candidate";
  const targetRoleLabel = role || activeDive?.targetRole?.trim() || "—";
  const overall = activeDive?.overallScore ?? 0;
  const overallScore = overall > 0 ? overall : null;
  const divePillars = PILLAR_ORDER.map((id) => ({
    id,
    score: activeDive?.pillarScores?.[id] ?? 0,
  }));
  const competencyScoreRows = useMemo(() => {
    if (!activeDive) return [];
    return COMPETENCY_SPECS.map((spec, index) => {
      const section = activeDive.competencies[index];
      const score = section ? section.score || strengthScore(section.car) : 0;
      return {
        id: spec.id,
        title: spec.title,
        pillar: spec.pillar,
        score,
      };
    }).filter((row) => row.score > 0);
  }, [activeDive]);

  if (!role) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <div className="mx-auto w-[800px] max-w-full space-y-6">
            <Card className="gap-0 py-0">
              <CardContent className="space-y-3 p-6">
                <div className="text-overline text-text-secondary">Status</div>
                <div className="text-body-sm font-semibold text-text-primary">No role set</div>
                <p className="text-caption leading-6 text-text-secondary">
                  Go to onboarding to set your target role.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link href="/storyboard">Back to Storyboard</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/coach">Coach</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="gap-0 py-0">
              <CardContent className="space-y-4 p-6">
                <h1 className="text-h4 text-text-primary">Storyboard draft</h1>
                <p className="text-caption leading-6 text-text-secondary">
                  Set a target role in onboarding to edit your storyboard here.
                </p>
                <Button asChild>
                  <Link href="/onboarding">Go to onboarding</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <CoachBottomChatBar showUploadButton={false} />
      </AppShell>
    );
  }

  if (!diveHydrated || !activeDive) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <div className="mx-auto w-[800px] max-w-full space-y-6">
            <Card className="gap-0 py-0">
              <CardContent className="space-y-3 p-6">
                <div className="text-body-sm font-semibold text-text-primary">
                  No storyboard Dive yet
                </div>
                <p className="text-caption leading-6 text-text-secondary">
                  Finish experience capture and craft your story to open a Dive.
                </p>
                <Button asChild>
                  <Link href="/storyboard">Back to Storyboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <CoachBottomChatBar showUploadButton={false} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CoachFloatingNav />
      <div className="pb-44 print:pb-0">
        <div className="mx-auto w-[800px] max-w-full space-y-6 print:w-full print:space-y-0">
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            {fromPreviousDive ? (
              <SelectionChip onClick={() => router.push("/storyboard")}>
                Continue Storyboarding
                <ArrowRight className="size-4" />
              </SelectionChip>
            ) : (
              <Link
                href="/storyboard"
                className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ArrowLeft className="size-4 shrink-0" />
                Back to Storyboard
              </Link>
            )}
          </div>

          <div className="print:hidden">
            <h1 className="text-h4 text-text-primary">
              {readOnly ? "Your storyboard" : "Review your storyboard"}
            </h1>
          </div>

          {/* Print-only report cover: logo + candidate metadata. */}
          <section className="mb-5 hidden space-y-5 print:block">
            <div>
              <Logo size="sm" className="print:block" />
              <h1 className="mt-3 text-h4 text-text-primary">Your storyboard</h1>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-caption">
              <div>
                <dt className="text-text-secondary">Candidate Name</dt>
                <dd className="mt-0.5 font-medium text-text-primary">{candidateName}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Target Role</dt>
                <dd className="mt-0.5 font-medium text-text-primary">{targetRoleLabel}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Storyboard Version</dt>
                <dd className="mt-0.5 font-medium text-text-primary">
                  Dive {activeDive.diveNumber}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">Download Timestamp</dt>
                <dd className="mt-0.5 font-medium text-text-primary">
                  {printTimestamp || formatDownloadTimestamp(new Date())}
                </dd>
              </div>
            </dl>
          </section>

          {pasteWarning ? (
            <p className="text-caption text-destructive print:hidden">{pasteWarning}</p>
          ) : null}

          {/* Screen dive card */}
          <div
            className={cn(
              "flex w-full flex-col gap-2.5 rounded-[20px] border-[0.5px] border-solid border-[#dde7e9]",
              "p-4 backdrop-blur-[42px] print:hidden",
              "bg-[linear-gradient(114.96deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
            )}
          >
            <div className="flex w-full items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 flex-1 items-end gap-4">
                <div className="flex w-[148px] shrink-0 items-baseline gap-1 font-gilroy whitespace-nowrap">
                  <span
                    className={cn(
                      "cap-baseline text-[64px] font-normal leading-none tracking-[-3.2px] tabular-nums",
                      diveScoreTextClass(overallScore),
                    )}
                  >
                    {overallScore != null ? overallScore.toFixed(1) : "—"}
                  </span>
                  <span className="cap-baseline text-[48px] font-normal leading-none tracking-[-2.4px] text-[#abadb2]">
                    /5
                  </span>
                </div>
                <div className="flex flex-col justify-between self-stretch">
                  <span className="cap-baseline text-[20px] font-medium tracking-[-0.5px] text-extended-blue">
                    Dive {activeDive.diveNumber}
                  </span>
                  <span className="cap-baseline text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                    Overall story score
                  </span>
                </div>
              </div>

              {readOnly ? (
                <div className="flex shrink-0 items-center gap-2">
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="md"
                    className="text-text-primary hover:bg-transparent hover:text-text-primary"
                    aria-label="Download storyboard"
                    title="Download"
                    onClick={handleDownload}
                  >
                    <Download />
                  </IconButton>
                  <Button
                    type="button"
                    disabled={addCompetencyDisabled}
                    title={
                      addCompetencyDisabled
                        ? "Finish the current Dive before adding competencies."
                        : undefined
                    }
                    onClick={() => {
                      if (addCompetencyDisabled) return;
                      if (usage.isStoryboardAtLimit) {
                        setUpgradeModalOpen(true);
                        return;
                      }
                      router.push("/storyboard?addCompetency=1");
                    }}
                  >
                    <Plus />
                    Add competency
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="flex w-full flex-col">
              {divePillars.map(({ id, score }) => {
                const displayScore = score > 0 ? score : null;
                return (
                  <div
                    key={id}
                    className="flex w-full items-center gap-4 border-t border-extended-green py-[18px]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <SuccessDriverIcon
                        driver={id}
                        className="size-4 shrink-0 text-text-primary"
                      />
                      <span className="truncate text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                        {SUCCESS_DRIVERS[id].shortLabel}
                      </span>
                      <SuccessDriverInfoTip driver={id} />
                    </div>
                    {displayScore != null ? (
                      <div className="flex w-[88px] shrink-0 items-baseline justify-end gap-1 font-gilroy whitespace-nowrap">
                        <span
                          className={cn(
                            "cap-baseline w-[72px] text-right text-[32px] font-medium leading-none tracking-[-1.6px] tabular-nums",
                            diveScoreTextClass(displayScore),
                          )}
                        >
                          {displayScore.toFixed(1)}
                        </span>
                        <span className="cap-baseline text-[24px] font-medium leading-none tracking-[-1.2px] text-[#abadb2]">
                          /5
                        </span>
                      </div>
                    ) : (
                      <span className="shrink-0 text-caption text-text-secondary">Not yet covered</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Print dive score table: 1 left cell + 4 right cells */}
          <table className="mt-5 hidden w-full border-collapse print:table">
            <tbody>
              <tr>
                <td
                  rowSpan={2}
                  className="w-1/2 border border-border bg-white p-4 align-top"
                >
                  <div className="text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                    Story Score
                  </div>
                  <div className="mt-4 flex items-baseline gap-1 whitespace-nowrap">
                    <span
                      className={cn(
                        "cap-baseline text-[48px] font-medium tracking-[-1.3px] tabular-nums leading-none",
                        diveScoreTextClass(overallScore),
                      )}
                    >
                      {overallScore != null ? overallScore.toFixed(1) : "—"}
                    </span>
                    <span className="cap-baseline font-gilroy text-[18px] leading-none tracking-[-1px] text-text-secondary">
                      / 5
                    </span>
                  </div>
                </td>
                {divePillars.slice(0, 2).map(({ id, score }) => {
                  const displayScore = score > 0 ? score : null;
                  return (
                    <td key={id} className="w-1/4 border border-border bg-white p-4 align-top">
                      <div className="flex w-full items-center gap-2">
                        <SuccessDriverIcon
                          driver={id}
                          className="size-4 text-text-primary"
                        />
                        <span className="truncate text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                          {SUCCESS_DRIVERS[id].shortLabel}
                        </span>
                      </div>
                      <div className="mt-4 flex w-full items-baseline gap-1 whitespace-nowrap tracking-[-1px]">
                        <span
                          className={cn(
                            "cap-baseline text-[32px] font-medium tabular-nums leading-none",
                            diveScoreTextClass(displayScore),
                          )}
                        >
                          {displayScore != null ? displayScore.toFixed(1) : "—"}
                        </span>
                        <span className="cap-baseline font-gilroy text-[18px] leading-none text-text-secondary">
                          / 5
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                {divePillars.slice(2, 4).map(({ id, score }) => {
                  const displayScore = score > 0 ? score : null;
                  return (
                    <td key={id} className="w-1/4 border border-border bg-white p-4 align-top">
                      <div className="flex w-full items-center gap-2">
                        <SuccessDriverIcon
                          driver={id}
                          className="size-4 text-text-primary"
                        />
                        <span className="truncate text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                          {SUCCESS_DRIVERS[id].shortLabel}
                        </span>
                      </div>
                      <div className="mt-4 flex w-full items-baseline gap-1 whitespace-nowrap tracking-[-1px]">
                        <span
                          className={cn(
                            "cap-baseline text-[32px] font-medium tabular-nums leading-none",
                            diveScoreTextClass(displayScore),
                          )}
                        >
                          {displayScore != null ? displayScore.toFixed(1) : "—"}
                        </span>
                        <span className="cap-baseline font-gilroy text-[18px] leading-none text-text-secondary">
                          / 5
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>

          <section className="print:mt-5 print:border-b print:border-border">
            <DraftSectionCard
              pillarLabel="Introduction"
              displayTitle="Core Introduction"
              score={introStrengthScore(activeDive.intro.text)}
              locked={activeDive.intro.locked || readOnly}
              showEditLock={!readOnly}
              showLockToggle={!readOnly}
              showDeepenEdit={readOnly && !addCompetencyDisabled}
              onDeepenEdit={() => router.push("/storyboard?editSection=intro")}
              regenCount={activeDive.intro.regenCount ?? 0}
              regenLimit={COMPETENCY_REGEN_LIMIT}
              onRegenerate={handleIntroRegenerate}
              onToggleLock={() =>
                updateDive((d) => ({
                  ...d,
                  intro: { ...d.intro, locked: !d.intro.locked },
                }))
              }
            >
              {(sectionLocked) =>
                sectionLocked ? (
                  <p className="whitespace-pre-wrap text-caption leading-6 text-text-primary">
                    {activeDive.intro.text.trim() || "No introduction captured."}
                  </p>
                ) : (
                  <label className="block">
                    <span className="text-body-sm font-medium text-text-primary">Introduction</span>
                    <p className="mb-1 text-caption text-text-secondary">
                      Your opening answer: who you are, what you&apos;re moving toward, and why it
                      matters for this role.
                    </p>
                    <textarea
                      className={TA}
                      rows={8}
                      value={activeDive.intro.text}
                      placeholder="Who you are, where you’re headed, and why this role…"
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (isLargePaste(raw)) {
                          setPasteWarning(
                            "That looks like a large paste. Please summarize in your own words (max 240).",
                          );
                          return;
                        }
                        setPasteWarning(null);
                        const text = clampToWordCap(raw, INTRO_WORD_HARD_CAP);
                        updateDive((d) => ({ ...d, intro: { ...d.intro, text } }));
                      }}
                    />
                  </label>
                )
              }
            </DraftSectionCard>
          </section>

          {PILLAR_ORDER.map((pillar) => {
            const rows = COMPETENCY_SPECS.map((spec, globalIndex) => ({
              spec,
              globalIndex,
            })).filter((x) => x.spec.pillar === pillar);
            const visibleRows = readOnly
              ? rows.filter(({ globalIndex }) => {
                  const s = activeDive.competencies[globalIndex];
                  return Boolean(
                    s &&
                      (s.car.context.trim() ||
                        s.car.action.trim() ||
                        s.car.result.trim() ||
                        s.assessment),
                  );
                })
              : rows;
            if (!visibleRows.length) return null;
            return (
              <section key={pillar} className="space-y-4 print:space-y-0">
                {visibleRows.map(({ spec, globalIndex: index }) => {
                  const s = activeDive.competencies[index]!;
                  return (
                    <div key={spec.id} className="print:border-b print:border-border">
                    <DraftSectionCard
                      pillarLabel={spec.pillar}
                      driver={spec.pillar}
                      displayTitle={spec.title}
                      score={s.score || strengthScore(s.car)}
                      locked={s.locked || readOnly}
                      showEditLock={!readOnly}
                      showLockToggle={!readOnly}
                      showDeepenEdit={readOnly && !addCompetencyDisabled}
                      onDeepenEdit={() => router.push(`/storyboard?editSection=${index}`)}
                      regenCount={s.regenCount ?? 0}
                      regenLimit={COMPETENCY_REGEN_LIMIT}
                      onRegenerate={(instruction) =>
                        handleCompetencyRegenerate(index, instruction)
                      }
                      onToggleLock={() =>
                        updateDive((d) => {
                          const competencies = d.competencies.map((c, i) =>
                            i === index ? { ...c, locked: !c.locked } : c,
                          );
                          return { ...d, competencies };
                        })
                      }
                    >
                      {(sectionLocked) => (
                        <div className="space-y-4">
                          <CompetencyClassificationDetails
                            assessment={s.assessment}
                            matchedSignals={s.matchedSignals}
                            missingNextLevelSignals={s.missingNextLevelSignals}
                            secondaryCompetencies={
                              s.secondaryCompetencies?.length
                                ? s.secondaryCompetencies
                                : classifySecondaryCompetencies(spec.id, s.car)
                            }
                          />
                          {sectionLocked ? (
                            <ReadOnlyCar car={s.car} />
                          ) : (
                            <CarTextAreas
                              value={s.car}
                              disabled={false}
                              onChange={(car) => {
                                const total = carTotalWords(car);
                                if (
                                  `${car.context}${car.action}${car.result}`.length >
                                  LARGE_PASTE_CHAR_THRESHOLD
                                ) {
                                  setPasteWarning(
                                    "That looks like a large paste. Keep the CAR story under 280 words from your evidence.",
                                  );
                                  return;
                                }
                                setPasteWarning(null);
                                let next = car;
                                if (total > CAR_WORD_HARD_CAP) {
                                  next = {
                                    context: clampToWordCap(
                                      car.context,
                                      Math.floor(CAR_WORD_HARD_CAP / 3),
                                    ),
                                    action: clampToWordCap(
                                      car.action,
                                      Math.floor(CAR_WORD_HARD_CAP / 3),
                                    ),
                                    result: clampToWordCap(
                                      car.result,
                                      Math.ceil(CAR_WORD_HARD_CAP / 3),
                                    ),
                                  };
                                }
                                updateDive((d) => {
                                  const competencies = d.competencies.map((c, i) =>
                                    i === index ? { ...c, car: next } : c,
                                  );
                                  return { ...d, competencies };
                                });
                              }}
                            />
                          )}
                        </div>
                      )}
                    </DraftSectionCard>
                    </div>
                  );
                })}
              </section>
            );
          })}

          {/* Print-only competency scores summary at end of report. */}
          <section className="mt-8 hidden space-y-5 print:block">
            <div>
              <h2 className="text-overline font-medium text-text-secondary">Overall Story Score</h2>
              <p className="mt-1 font-gilroy text-[28px] font-medium tabular-nums leading-none text-text-primary">
                {formatReportScore(overallScore)}
                <span className="ml-1 text-[16px] text-text-secondary">/ 5</span>
              </p>
            </div>
            <div>
              <h2 className="text-h6 text-text-primary">Individual Competency Scores</h2>
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {competencyScoreRows.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 py-2 text-caption"
                  >
                    <span className="min-w-0 text-text-primary">
                      <span className="text-text-secondary">
                        {SUCCESS_DRIVERS[row.pillar].shortLabel}
                        {" · "}
                      </span>
                      {row.title}
                    </span>
                    <span className="shrink-0 font-gilroy tabular-nums font-medium text-text-primary">
                      {formatReportScore(row.score)} / 5
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {!readOnly ? (
            <div className="space-y-3 border-t border-border pt-6 print:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-caption leading-6 text-text-secondary">
                  Edits save as you go. When it reads right, save it as Dive{" "}
                  {activeDive.diveNumber} — a saved Dive is read-only, and you have{" "}
                  {divesLeftAfterSave} more after this one.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={handleSaveStoryboard}>
                    <Save />
                    Save storyboard
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <CoachBottomChatBar showUploadButton={false} />
      <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </AppShell>
  );
}

function CompetencyClassificationDetails({
  assessment,
  matchedSignals,
  missingNextLevelSignals,
  secondaryCompetencies,
}: {
  assessment?: CompetencyAssessment | null;
  matchedSignals: string[];
  missingNextLevelSignals: string[];
  secondaryCompetencies: CompetencyId[];
}) {
  if (assessment) {
    return (
      <div className="space-y-2 rounded-lg bg-primary/10 px-3.5 py-3 print:space-y-3 print:rounded-none print:border print:border-border print:bg-white">
        {/* Level stays visible — it's the only short, scannable signal. */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
            <Gauge className="size-4 shrink-0 text-primary" aria-hidden />
            Level
          </div>
          <span className="rounded-full bg-card px-2.5 py-0.5 text-[13px] font-medium text-text-primary ring-1 ring-border">
            {assessment.levelLabel}
          </span>
        </div>

        <AssessmentAccordion
          items={[
            {
              id: "assessment",
              title: "Assessment",
              subtitle: "Evidence & classification rationale",
              defaultOpen: true,
              content: (
                <div className="space-y-3">
                  <AssessmentBlock icon={FileCheck} title="Evidence">
                    {assessment.evidence}
                  </AssessmentBlock>
                  <AssessmentBlock icon={Scale} title="Classification Rationale">
                    {assessment.classificationRationale}
                  </AssessmentBlock>
                </div>
              ),
            },
            {
              id: "growth",
              title: "Growth next steps",
              subtitle: "Missing strengths & how to level up",
              defaultOpen: false,
              content: (
                <div className="space-y-3">
                  <AssessmentBlock icon={CircleDashed} title="Missing Strengths">
                    {assessment.missingStrengths}
                  </AssessmentBlock>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
                      <Network className="size-4 shrink-0 text-primary" aria-hidden />
                      Developmental Insights
                    </div>
                    <AssessmentBlock icon={Network} title="Development" nested>
                      {assessment.development}
                    </AssessmentBlock>
                    <AssessmentBlock icon={GraduationCap} title="Masterclass" nested>
                      {assessment.masterclass}
                    </AssessmentBlock>
                    <AssessmentBlock icon={Bot} title="AI Coach" nested>
                      {assessment.aiCoach}
                    </AssessmentBlock>
                  </div>
                </div>
              ),
            },
            {
              id: "interview",
              title: "Interview use",
              subtitle: "Related competencies & question types",
              defaultOpen: false,
              content: (
                <div className="space-y-3">
                  <AssessmentBlock icon={Tags} title="Related Competencies">
                    {assessment.relatedCompetenciesNarrative}
                  </AssessmentBlock>
                  <AssessmentBlock icon={MessageCircleQuestion} title="Related Question Types">
                    {assessment.relatedQuestionTypes}
                  </AssessmentBlock>
                </div>
              ),
            },
          ]}
        />
      </div>
    );
  }

  const evidenceText = matchedSignals.map((s) => s.trim()).filter(Boolean);
  const missing = missingNextLevelSignals.map((s) => s.trim()).filter(Boolean);
  const related = secondaryCompetencies.filter((id) =>
    COMPETENCY_SPECS.some((spec) => spec.id === id),
  );

  if (!evidenceText.length && !missing.length && !related.length) return null;

  return (
    <div className="space-y-3 rounded-lg bg-primary/10 px-3.5 py-3 print:rounded-none print:border print:border-border print:bg-white">
      {evidenceText.length ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
            <FileCheck className="size-4 shrink-0 text-primary" aria-hidden />
            Evidence
          </div>
          {/* Quoted follow-up answers already carry their own punctuation, so
              they are listed rather than run into one sentence. */}
          <div className="space-y-1.5">
            {evidenceText.map((line, i) => (
              <p key={i} className="text-[14px] leading-6 text-text-secondary">
                {/[.!?”"]$/.test(line) ? line : `${line}.`}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {missing.length ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
            <CircleDashed className="size-4 shrink-0 text-primary" aria-hidden />
            Missing Strengths
          </div>
          <p className="text-body-sm leading-6 text-text-secondary">{missing.join(", ")}</p>
        </div>
      ) : null}

      {related.length ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
            <Tags className="size-4 shrink-0 text-primary" aria-hidden />
            Related Competencies
          </div>
          <div className="flex flex-wrap gap-2">
            {related.map((id) => {
              const driver = pillarForCompetency(id);
              const spec = competencySpec(id);
              return (
                <SuccessDriverCompetencyPill
                  key={id}
                  driver={driver}
                  label={
                    <>
                      {SUCCESS_DRIVERS[driver].shortLabel}
                      {" · "}
                      {spec.title}
                    </>
                  }
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AssessmentAccordion({
  items,
}: {
  items: {
    id: string;
    title: string;
    subtitle: string;
    defaultOpen?: boolean;
    content: ReactNode;
  }[];
}) {
  const [openId, setOpenId] = useState<string | null>(
    () => items.find((item) => item.defaultOpen)?.id ?? items[0]?.id ?? null,
  );

  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-md bg-card/70 ring-1 ring-border/70 print:bg-transparent print:ring-0"
          >
            <button
              type="button"
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 print:pointer-events-none"
              onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
            >
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-text-primary">{item.title}</div>
                <div className="text-[12px] leading-4 text-text-secondary">{item.subtitle}</div>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-text-secondary transition print:hidden",
                  open && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <div
              className={cn(
                "border-t border-border/70 px-3 py-3",
                open ? "block" : "hidden print:block",
              )}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssessmentBlock({
  icon: Icon,
  title,
  children,
  nested = false,
}: {
  icon: typeof FileCheck;
  title: string;
  children: ReactNode;
  nested?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", nested && "pl-1")}>
      <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
        {title}
      </div>
      <p className="text-[14px] leading-6 text-text-secondary">{children}</p>
    </div>
  );
}

function ReadOnlyCar({ car }: { car: CarBlock }) {
  return (
    <div className="space-y-3">
      {(
        [
          ["Context", car.context],
          ["Action", car.action],
          ["Result", car.result],
        ] as const
      ).map(([label, text]) => (
        <div key={label}>
          <div className="text-body-sm font-medium text-text-primary">{label}</div>
          <p className="mt-1 whitespace-pre-wrap text-caption leading-6 text-text-primary">
            {text.trim() || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

function DraftSectionCard({
  pillarLabel,
  driver,
  displayTitle,
  score,
  locked,
  onToggleLock,
  showEditLock,
  showLockToggle = true,
  showDeepenEdit = false,
  onDeepenEdit,
  regenCount = 0,
  regenLimit = COMPETENCY_REGEN_LIMIT,
  onRegenerate,
  children,
}: {
  pillarLabel: string;
  driver?: PillarId;
  displayTitle: string;
  score: number;
  locked: boolean;
  onToggleLock: () => void;
  showEditLock: boolean;
  /** Hide Lock/Unlock in read-only saved Dives. */
  showLockToggle?: boolean;
  /** Read-only: start a new Dive to edit only this section. */
  showDeepenEdit?: boolean;
  onDeepenEdit?: () => void;
  regenCount?: number;
  regenLimit?: number;
  onRegenerate?: (
    instruction: string,
  ) => { ok: true } | { ok: false; reason: "missing" | "limit" | "empty" };
  /** Renders section body; `sectionLocked` is true for read-only view, false for fields. */
  children: (sectionLocked: boolean) => ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftInput, setDraftInput] = useState("");
  const [selectedChipId, setSelectedChipId] = useState<StoryboardImproveChipId | null>(
    null,
  );
  /** Local view mode so Lock/Unlock switches read-only ↔ fields immediately (mock). */
  const [viewLocked, setViewLocked] = useState(locked);
  const regenBlocked = Boolean(onRegenerate && regenCount >= regenLimit);
  const regenRemaining = Math.max(0, regenLimit - regenCount);

  useEffect(() => {
    setViewLocked(locked);
  }, [locked]);

  function resetEditBar() {
    setIsEditing(false);
    setDraftInput("");
    setSelectedChipId(null);
  }

  function handleToggleLock() {
    setViewLocked((prev) => {
      const next = !prev;
      if (next) {
        setIsEditing(false);
        setDraftInput("");
        setSelectedChipId(null);
      }
      return next;
    });
    onToggleLock();
  }

  function handleSelectChip(chip: (typeof STORYBOARD_IMPROVE_CHIPS)[number]) {
    if (regenBlocked) return;
    setSelectedChipId(chip.id);
    setDraftInput(chip.prompt);
  }

  function handleSendQuickChange() {
    if (!onRegenerate) return;
    if (regenBlocked) return;
    const result = onRegenerate(draftInput);
    if (!result.ok) return;
    resetEditBar();
  }

  return (
    <Card className="gap-0 overflow-hidden py-0 print:break-inside-avoid print:rounded-none print:bg-white print:shadow-none">
      <div
        data-slot="storyboard-section-header"
        className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-[linear-gradient(189.44deg,rgba(255,255,255,0.2)_50.11%,rgba(14,154,181,0.1)_110.8%),linear-gradient(#fff,#fff)] px-4 py-3 print:border-b print:border-border print:bg-white print:[&>[data-slot=section-header-stroke]]:hidden"
      >
        <div className="min-w-0">
          {driver ? (
            <SuccessDriverMark
              driver={driver}
              className="text-overline"
              iconClassName="size-3.5"
            />
          ) : (
            <div className="text-overline text-text-secondary">{pillarLabel}</div>
          )}
          <h3 className="text-h6 text-text-primary">{displayTitle}</h3>
        </div>
        <span
          data-slot="section-header-stroke"
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-[linear-gradient(to_right,#F5F5F3,#6EC2D3)]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            title="Strength score (0–5 half-steps)."
            className={cn(
              "border-transparent text-white",
              score > 0 ? scoringFillClass(score) : "bg-muted text-text-secondary",
            )}
          >
            Strength <span className="font-gilroy tabular-nums">{score}</span> / 5
          </Badge>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {showDeepenEdit ? (
              /* Secondary, not ghost: this is the only way to change a saved
                 Dive, and as a ghost it was --extended-dark-cyan, which is
                 #01161B in light — the same ink as the body text beside it,
                 so the icon was carrying the entire affordance. */
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onDeepenEdit}
                title="A saved Dive is read-only — this starts a new Dive with only this section unlocked"
              >
                <SquarePen />
                Edit in a new Dive
              </Button>
            ) : null}
            {showEditLock ? (
              <>
                {showLockToggle ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleLock}
                    title={viewLocked ? "Unlock to edit fields" : "Lock to read-only view"}
                  >
                    {viewLocked ? <Unlock /> : <Lock />}
                    {viewLocked ? "Unlock" : "Lock"}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      resetEditBar();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  title={isEditing ? "Cancel edit" : "Show improve options"}
                >
                  {isEditing ? <X /> : <SquarePen />}
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className="p-4">
        {children(viewLocked)}
        {showEditLock && isEditing ? (
          <div className="mt-4 -mx-4 space-y-2 border-t border-border/40 px-4 pt-4 print:hidden">
            <div className="space-y-1.5">
              <p className="text-overline text-text-primary">
                How do you want to improve this?
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STORYBOARD_IMPROVE_CHIPS.map((chip) => (
                  <SelectionChip
                    key={chip.id}
                    selected={selectedChipId === chip.id}
                    disabled={regenBlocked}
                    className={improveChipClassName}
                    onClick={() => handleSelectChip(chip)}
                  >
                    {chip.label}
                  </SelectionChip>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="sr-only">Improvement instruction</span>
              <div className="mt-0.5 flex items-center rounded-full border border-border bg-card py-1 pr-1 pl-3 transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/50">
                <input
                  type="text"
                  value={draftInput}
                  onChange={(e) => setDraftInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendQuickChange();
                    }
                  }}
                  disabled={regenBlocked}
                  placeholder={
                    onRegenerate
                      ? "Pick a quick action or type the change you want…"
                      : "Type the change you want…"
                  }
                  className="min-w-0 flex-1 border-0 bg-transparent py-0.5 text-caption text-text-primary outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-60"
                />
                <IconButton
                  variant="solid"
                  aria-label="Send quick change"
                  title="Send quick change"
                  disabled={regenBlocked || !draftInput.trim()}
                  className="shrink-0 disabled:bg-primary disabled:text-primary-foreground disabled:opacity-50"
                  onClick={handleSendQuickChange}
                >
                  <ArrowUp />
                </IconButton>
              </div>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {onRegenerate ? (
                <p
                  className={cn(
                    "text-caption leading-5",
                    regenBlocked ? "text-destructive" : "text-text-secondary",
                  )}
                >
                  {regenBlocked
                    ? `Regeneration limit reached (${regenLimit} of ${regenLimit} used).`
                    : `${regenRemaining} of ${regenLimit} regenerations remaining.`}
                  {regenBlocked ? (
                    <>
                      {" "}
                      <a
                        href="/profile/billing?addon=storyboard"
                        className="app-link font-medium"
                      >
                        Purchase Storyboard add-on
                      </a>
                    </>
                  ) : null}
                </p>
              ) : (
                <span />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetEditBar}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function CarTextAreas({
  value,
  onChange,
  disabled,
}: {
  value: CarBlock;
  onChange: (c: CarBlock) => void;
  disabled: boolean;
}) {
  const patch = (k: keyof CarBlock, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-body-sm font-medium text-text-primary">Context</span>
        <p className="mb-1 text-caption text-text-secondary">
          Situation, constraints, stakes (2–3 sentences).
        </p>
        <textarea
          className={TA}
          rows={4}
          value={value.context}
          disabled={disabled}
          placeholder="Situation, constraints, and stakes…"
          onChange={(e) => patch("context", e.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-body-sm font-medium text-text-primary">Action</span>
        <p className="mb-1 text-caption text-text-secondary">
          What you personally did, decisions, and how you moved the work forward.
        </p>
        <textarea
          className={TA}
          rows={3}
          value={value.action}
          disabled={disabled}
          placeholder="What you personally did…"
          onChange={(e) => patch("action", e.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-body-sm font-medium text-text-primary">Result</span>
        <p className="mb-1 text-caption text-text-secondary">
          Outcomes, learning, business impact (measurable or qualitative — never invent metrics).
        </p>
        <textarea
          className={TA}
          rows={3}
          value={value.result}
          disabled={disabled}
          placeholder="Outcomes and impact…"
          onChange={(e) => patch("result", e.target.value)}
        />
      </label>
    </div>
  );
}
