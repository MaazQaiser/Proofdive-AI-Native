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
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Link2,
  Lock,
  Pencil,
  Plus,
  Radar,
  Save,
  Sparkles,
  Unlock,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardNested,
} from "@/components/ui/card";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { SuccessDriverMark } from "@/components/ui/success-driver-card";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  COMPETENCY_SPECS,
  type CarBlock,
  type CompetencyId,
  type PillarId,
  type StoryboardDive,
  canStartNewDive,
  classifySecondaryCompetencies,
  commitSavedDive,
  diveById,
  editingDiveForRole,
  introStrengthScore,
  latestSavedDive,
  normalizeDive,
  recomputeDiveScores,
  remainingDives,
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
import { scoringFillClass } from "@/lib/scoringPalette";
import type { RoleProfile } from "@/lib/proofdiveTypes";
import {
  competencySpec,
  pillarForCompetency,
} from "@/lib/demoFocusCompetencies";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { useStoryboardDiveStore } from "@/lib/useStoryboardDiveStore";
import { cn } from "@/lib/utils";

const PILLAR_ORDER = SUCCESS_DRIVER_ORDER;

const TA =
  "min-h-24 w-full rounded-md border border-border bg-card px-4 py-3 text-caption leading-6 text-text-primary outline-none ring-0 placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-60 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const COMPETENCY_REGEN_LIMIT = 2;

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

export function CraftingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasTriggeredPrintRef = useRef(false);
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [diveStore, setDiveStore, diveHydrated] = useStoryboardDiveStore();
  const [pasteWarning, setPasteWarning] = useState<string | null>(null);

  const role = roleProfile?.targetRole?.trim() ?? "";
  const diveParam = (searchParams.get("dive") ?? "").trim();

  const activeDive = useMemo(() => {
    if (!role || !diveHydrated) return null;
    if (diveParam) {
      return diveById(diveStore, role, diveParam);
    }
    return editingDiveForRole(diveStore, role) ?? latestSavedDive(diveStore, role);
  }, [role, diveHydrated, diveParam, diveStore]);

  const latestSaved = useMemo(
    () => (role && diveHydrated ? latestSavedDive(diveStore, role) : null),
    [role, diveHydrated, diveStore],
  );

  const readOnly = Boolean(activeDive && activeDive.status === "saved");
  const isLatestSaved =
    Boolean(readOnly && activeDive && latestSaved && activeDive.id === latestSaved.id);
  const divesLeft = role && diveHydrated ? remainingDives(diveStore, role) : 0;
  const canDeepen =
    isLatestSaved && role ? canStartNewDive(diveStore, role) && divesLeft > 0 : false;

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
      return { ok: true as const };
    },
    [activeDive, updateActiveDive],
  );

  const handleIntroRegenerate = useCallback(
    (instruction: string) => {
      if (!activeDive) return { ok: false, reason: "missing" as const };
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
      return { ok: true as const };
    },
    [activeDive, updateActiveDive],
  );

  useEffect(() => {
    if (searchParams.get("print") !== "1") return;
    if (hasTriggeredPrintRef.current) return;
    hasTriggeredPrintRef.current = true;
    const id = window.setTimeout(() => window.print(), 200);
    const diveQs = diveParam ? `?dive=${encodeURIComponent(diveParam)}` : "";
    router.replace(`/storyboard/crafting${diveQs}`);
    return () => window.clearTimeout(id);
  }, [searchParams, router, diveParam]);

  const handleSaveStoryboard = useCallback(() => {
    if (!role || !activeDive || activeDive.status === "saved") return;
    setDiveStore((prev) => commitSavedDive(prev, activeDive));
    router.push("/storyboard");
  }, [role, activeDive, setDiveStore, router]);

  /** Add evidence while Dive 1 is still editing — does not start a new Dive. */
  const handleAddCompetencyWhileEditing = useCallback(() => {
    if (!activeDive || activeDive.status === "saved" || activeDive.diveNumber !== 1) {
      return;
    }
    try {
      sessionStorage.setItem(StorageKeys.preferStoryboardIntake, "1");
    } catch {
      // ignore
    }
    router.push("/storyboard?new=1");
  }, [activeDive, router]);

  /** From a saved Dive: open competency picker, then Dive confirm on storyboard. */
  const handleAddCompetencyFromReadOnly = useCallback(() => {
    if (!canDeepen) return;
    router.push("/storyboard?addCompetency=1");
  }, [canDeepen, router]);

  const handleDownload = useCallback(() => {
    if (!activeDive) return;
    router.push(`/storyboard/crafting?dive=${encodeURIComponent(activeDive.id)}&print=1`);
  }, [activeDive, router]);

  const overall = activeDive?.overallScore ?? 0;
  const byPillar = PILLAR_ORDER.map((p) => ({
    id: p,
    v: activeDive?.pillarScores?.[p] ?? 0,
  }));

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
                    <Link href="/coach?journey=1">Coach</Link>
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
      <div className="pb-44">
        <div className="mx-auto w-[800px] max-w-full space-y-6">
          <Link
            href="/storyboard"
            className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background print:hidden"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Back to Storyboard
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-extended-light-cyan px-2.5 py-0.5 text-overline font-medium text-text-primary">
                  Dive {activeDive.diveNumber}
                  {readOnly ? " · Saved" : " · Editing"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h1 className="text-h4 text-text-primary">
                  {readOnly ? "Your storyboard" : "Edit your storyboard"}
                </h1>
              </div>
              <p className="mt-1 text-caption leading-6 text-text-secondary">
                Target role: <span className="font-semibold text-text-primary">{role}</span>
                {readOnly ? null : " — edits auto-save until you finalize."}
              </p>
            </div>
            {readOnly ? (
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                {canDeepen ? (
                  <Button
                    type="button"
                    className="border-0 bg-extended-light-cyan text-text-primary hover:bg-extended-light-cyan/80 hover:text-text-primary"
                    onClick={handleAddCompetencyFromReadOnly}
                  >
                    <Plus />
                    Add Competency
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="shrink-0 border-0 bg-card text-extended-cyan-green hover:bg-card hover:text-extended-cyan-green"
                  aria-label="Download storyboard"
                  title="Download"
                  onClick={handleDownload}
                >
                  <Download />
                </Button>
              </div>
            ) : null}
          </div>

          {pasteWarning ? (
            <p className="text-caption text-destructive print:hidden">{pasteWarning}</p>
          ) : null}

          <Card className="gap-0 py-0">
            <CardContent className="space-y-3 p-5">
              <div className="text-overline text-text-secondary">Story strength</div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-caption font-semibold text-text-primary">Overall</div>
                  <div className="text-overline text-text-secondary">Mean of 12 competencies</div>
                </div>
                <div className="text-h5 text-text-primary">
                  {overall.toFixed(1)}
                  <span className="pl-1 text-body text-text-secondary">/ 5</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {byPillar.map(({ id, v }) => (
                  <CardNested key={id} className="space-y-1 px-3 py-2">
                    <SuccessDriverMark
                      driver={id}
                      label="short"
                      className="text-overline"
                      iconClassName="size-3.5"
                    />
                    <div className="text-caption font-semibold tabular-nums text-text-primary">
                      {v > 0 ? v.toFixed(1) : "—"}
                      <span className="text-text-secondary"> / 5</span>
                    </div>
                  </CardNested>
                ))}
              </div>
            </CardContent>
          </Card>

          <section>
            <DraftSectionCard
              pillarLabel="Introduction"
              displayTitle="Core Introduction"
              score={introStrengthScore(activeDive.intro.text)}
              locked={activeDive.intro.locked || readOnly}
              showEditLock={!activeDive.intro.locked || readOnly}
              showLockToggle={!readOnly}
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
              {readOnly || activeDive.intro.locked ? (
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
              )}
            </DraftSectionCard>
          </section>

          {PILLAR_ORDER.map((pillar) => {
            const rows = COMPETENCY_SPECS.map((spec, globalIndex) => ({
              spec,
              globalIndex,
            })).filter((x) => x.spec.pillar === pillar);
            return (
              <section key={pillar} className="space-y-4">
                {rows.map(({ spec, globalIndex: index }) => {
                  const s = activeDive.competencies[index]!;
                  return (
                    <DraftSectionCard
                      key={spec.id}
                      pillarLabel={spec.pillar}
                      driver={spec.pillar}
                      displayTitle={spec.title}
                      score={s.score || strengthScore(s.car)}
                      locked={s.locked || readOnly}
                      showEditLock={!s.locked || readOnly}
                      showLockToggle={!readOnly}
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
                      <div className="space-y-4">
                        <CompetencyClassificationDetails
                          matchedSignals={s.matchedSignals}
                          missingNextLevelSignals={s.missingNextLevelSignals}
                          secondaryCompetencies={
                            s.secondaryCompetencies?.length
                              ? s.secondaryCompetencies
                              : classifySecondaryCompetencies(spec.id, s.car)
                          }
                        />
                        {readOnly || s.locked ? (
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
                                  context: clampToWordCap(car.context, Math.floor(CAR_WORD_HARD_CAP / 3)),
                                  action: clampToWordCap(car.action, Math.floor(CAR_WORD_HARD_CAP / 3)),
                                  result: clampToWordCap(car.result, Math.ceil(CAR_WORD_HARD_CAP / 3)),
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
                    </DraftSectionCard>
                  );
                })}
              </section>
            );
          })}

          {!readOnly ? (
            <div className="space-y-3 border-t border-border pt-6 print:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-caption leading-6 text-text-secondary">
                  Edits auto-save. Finalize to lock this Dive as read-only.
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeDive?.diveNumber === 1 ? (
                    <Button
                      type="button"
                      className="border-0 bg-extended-light-cyan text-text-primary hover:bg-extended-light-cyan/80 hover:text-text-primary"
                      onClick={handleAddCompetencyWhileEditing}
                    >
                      <Plus />
                      Add Competency
                    </Button>
                  ) : null}
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
    </AppShell>
  );
}

function CompetencyClassificationDetails({
  matchedSignals,
  missingNextLevelSignals,
  secondaryCompetencies,
}: {
  matchedSignals: string[];
  missingNextLevelSignals: string[];
  secondaryCompetencies: CompetencyId[];
}) {
  const evidenceText = matchedSignals.map((s) => s.trim()).filter(Boolean);
  const missing = missingNextLevelSignals.map((s) => s.trim()).filter(Boolean);
  const related = secondaryCompetencies.filter((id) =>
    COMPETENCY_SPECS.some((spec) => spec.id === id),
  );

  if (!evidenceText.length && !missing.length && !related.length) return null;

  return (
    <div className="space-y-3 rounded-lg bg-primary/10 px-3.5 py-3">
      {evidenceText.length ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
            <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
            Evidence
          </div>
          <p className="text-[14px] leading-6 text-text-secondary">{evidenceText.join(". ")}.</p>
        </div>
      ) : null}

      {missing.length ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
            <Radar className="size-4 shrink-0 text-primary" aria-hidden />
            Missing Strengths
          </div>
          <p className="text-body-sm leading-6 text-text-secondary">{missing.join(", ")}</p>
        </div>
      ) : null}

      {related.length ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[14px] font-medium text-text-primary">
            <Link2 className="size-4 shrink-0 text-primary" aria-hidden />
            Related Competencies
          </div>
          <div className="flex flex-wrap gap-2">
            {related.map((id) => {
              const driver = pillarForCompetency(id);
              const spec = competencySpec(id);
              return (
                <div
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full bg-extended-cyan-green/10 py-1.5 pl-1.5 pr-3"
                >
                  <SuccessDriverIcon driver={driver} className="size-4" />
                  <span className="text-overline font-medium text-text-primary">
                    {SUCCESS_DRIVERS[driver].shortLabel}
                    {" · "}
                    {spec.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
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
  children: ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftInput, setDraftInput] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const regenBlocked = Boolean(onRegenerate && regenCount >= regenLimit);
  const progress = onRegenerate ? Math.min(1, regenCount / regenLimit) : 0;
  const circumference = 2 * Math.PI * 8;
  const dashOffset = circumference * (1 - progress);

  function handleSendQuickChange() {
    if (!onRegenerate) return;
    const result = onRegenerate(draftInput);
    if (!result.ok && result.reason === "limit") {
      setTooltipOpen(true);
      return;
    }
    if (!result.ok) return;
    setDraftInput("");
    setIsEditing(false);
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            title="Strength score (0–5 half-steps)."
            className={cn(
              "border-transparent text-white",
              score > 0 ? scoringFillClass(score) : "bg-muted text-text-secondary",
            )}
          >
            Strength {score} / 5
          </Badge>
          {showDeepenEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDeepenEdit}
              className="print:hidden"
              title="Edit this section in a new Dive"
            >
              <Pencil />
              Edit
            </Button>
          ) : null}
          {showEditLock ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing((v) => !v)}
                className="print:hidden"
                title="Show an inline edit field"
              >
                <Pencil />
                {isEditing ? "Close" : "Edit"}
              </Button>
              {onRegenerate ? (
                <>
                  {showLockToggle ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onToggleLock}
                      className="print:hidden"
                      title={locked ? "Unlock to edit" : "Lock to prevent edits"}
                    >
                      {locked ? <Unlock /> : <Lock />}
                      {locked ? "Unlock" : "Lock"}
                    </Button>
                  ) : null}
                  {isEditing ? (
                    <div className="relative print:hidden">
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        aria-label={
                          regenBlocked
                            ? "Regenerate limit reached"
                            : `${regenLimit - regenCount} regenerations remaining`
                        }
                        onMouseEnter={() => setTooltipOpen(true)}
                        onMouseLeave={() => setTooltipOpen(false)}
                        onFocus={() => setTooltipOpen(true)}
                        onBlur={() => setTooltipOpen(false)}
                      >
                        <svg
                          aria-hidden
                          viewBox="0 0 20 20"
                          className="size-4 -rotate-90"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="opacity-20"
                          />
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className={regenBlocked ? "text-destructive" : "text-primary"}
                          />
                        </svg>
                      </button>
                      {tooltipOpen ? (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 rounded-lg border border-border bg-white p-3 text-caption leading-snug text-text-primary shadow-[0_8px_20px_rgba(14,154,181,0.12)]">
                          {regenBlocked
                            ? `The ${regenLimit} regeneration limit for this competency has been exceeded.`
                            : `${regenLimit - regenCount} of ${regenLimit} regenerations remaining for this competency.`}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : showLockToggle ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onToggleLock}
                  className="print:hidden"
                  title={locked ? "Unlock to edit" : "Lock to prevent edits"}
                >
                  {locked ? <Unlock /> : <Lock />}
                  {locked ? "Unlock" : "Lock"}
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <div className="p-4">
        {children}
        {showEditLock && isEditing ? (
          <div className="mt-4">
            <label className="block">
              <span className="text-overline text-text-secondary">
                {onRegenerate
                  ? "Share the quick change you want updated in this competency"
                  : "Share the quick change you want updated in this area of the story"}
              </span>
              <div className="relative mt-1.5 overflow-hidden rounded-md">
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
                  placeholder={onRegenerate ? "Type the change you want..." : "Type here..."}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 pr-12 text-caption text-text-primary outline-none placeholder:text-placeholder focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
                <button
                  type="button"
                  aria-label="Send quick change"
                  title="Send quick change"
                  className="absolute right-1.5 top-1/2 z-10 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90"
                  onClick={handleSendQuickChange}
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </label>
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
          onChange={(e) => patch("result", e.target.value)}
        />
      </label>
    </div>
  );
}
