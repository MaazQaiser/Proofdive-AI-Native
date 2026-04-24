"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, type ReactNode } from "react";

import {
  buildMockCraftingDraft,
  isPristineStoryboardDocument,
} from "@/app/storyboard/crafting/mockCraftingDraft";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { buildCarSnapshot } from "@/lib/proofdiveLogic";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  COMPETENCY_SPECS,
  type CarBlock,
  type PillarId,
  PILLAR_LABEL,
  type StoryboardDraftDocument,
  type StoryboardDraftStore,
  createStoryboardDraft,
  emptySection,
  normalizeStoryboardDocument,
  overallCompetencyStrength,
  pillarStrength,
  strengthScore,
} from "@/lib/storyboardDraft";
import type { Experience, RoleProfile, StoryboardFromCraft } from "@/lib/proofdiveTypes";
import { writeJson } from "@/lib/storage";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const PILLAR_ORDER: PillarId[] = ["thinking", "action", "people", "mastery"];

const TA =
  "min-h-24 w-full rounded-2xl border border-white/50 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none ring-0 placeholder:text-[var(--app-muted)] disabled:cursor-not-allowed disabled:opacity-60";

export function CraftingScreen() {
  const router = useRouter();
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [, setExperiences] = useLocalStorageState<Experience[]>(StorageKeys.experiences, []);
  const [store, setStore] = useLocalStorageState<StoryboardDraftStore>(StorageKeys.storyboardDraft, {
    version: 1,
    byRole: {},
  });

  const role = roleProfile?.targetRole?.trim() ?? "";

  const document = useMemo<StoryboardDraftDocument>(() => {
    if (!role) return createStoryboardDraft("");
    const raw = store.byRole[role] ?? createStoryboardDraft(role);
    return normalizeStoryboardDocument(raw);
  }, [store, role]);

  const updateDocument = useCallback(
    (updater: (d: StoryboardDraftDocument) => StoryboardDraftDocument) => {
      if (!role) return;
      setStore((prev) => {
        const cur = prev.byRole[role] ?? createStoryboardDraft(role);
        const next = updater(structuredClone(cur));
        return {
          ...prev,
          byRole: { ...prev.byRole, [role]: next },
        };
      });
    },
    [role, setStore],
  );

  useEffect(() => {
    if (!role) return;
    setStore((prev) => {
      const existing = prev.byRole[role];
      if (existing && !isPristineStoryboardDocument(existing)) return prev;
      return {
        ...prev,
        byRole: { ...prev.byRole, [role]: buildMockCraftingDraft(role) },
      };
    });
  }, [role, setStore]);

  useEffect(() => {
    if (!role) return;
    const mockId = `exp_crafting_mock:${role}`;
    setExperiences((prev) => {
      if (prev.some((e) => e.id === mockId)) return prev;
      const hasEnrichedForRole = prev
        .filter((e) => e.role === role)
        .some((e) => buildCarSnapshot(e) !== null);
      if (hasEnrichedForRole) return prev;
      const at = new Date().toISOString();
      const mock: Experience = {
        id: mockId,
        role,
        title: "Cross-functional roadmap reset",
        raw: "Seeded preview experience for storyboard crafting.",
        createdAt: at,
        enrichment: {
          goalObjective:
            "Reduce thrash between GTM and engineering by agreeing on one launch milestone and measurable success criteria before build started.",
          breakdownTools:
            "RICE-style scoring, written assumptions, and a single decision log so async teams could comment with evidence.",
          prioritization:
            "Cut three nice-to-have features, sequenced two spikes first, and negotiated a two-week buffer for integration risk.",
          execution:
            "Facilitated weekly checkpoints, unblocked two teams with API contracts, and ran short syncs only during the risk window.",
          people:
            "Aligned design, data, and eng leads by framing conflicts as customer-impact trade-offs and documenting owners for each decision.",
          outcome:
            "Shipped on time: activation +12% in four weeks, support tickets down 18%, and leadership reused the template next cycle.",
          updatedAt: at,
        },
      };
      return [...prev, mock];
    });
  }, [role, setExperiences]);

  const handleSaveStoryboard = useCallback(() => {
    if (!role) return;
    writeJson(StorageKeys.storyboardDraft, store);
    const payload: StoryboardFromCraft = { v: 1, role, at: new Date().toISOString() };
    writeJson(StorageKeys.storyboardFromCraft, payload);
    router.push("/storyboard");
  }, [store, role, router]);

  const overall = overallCompetencyStrength(document);
  const byPillar = PILLAR_ORDER.map((p) => ({ id: p, v: pillarStrength(document, p) }));

  if (!role) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <div className="mx-auto w-full max-w-3xl space-y-6">
            <Card>
              <CardBody>
                <div className="text-xs font-semibold tracking-[0.18em] text-[var(--app-muted)]">STATUS</div>
                <div className="mt-3 text-base font-bold tracking-tight">No role set</div>
                <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                  Go to onboarding to set your target role.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/storyboard">
                    <Button variant="secondary">Back to Storyboard</Button>
                  </Link>
                  <Link href="/coach?journey=1">
                    <Button variant="secondary">Coach</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <h1 className="text-4xl font-extrabold tracking-tight">Storyboard draft</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
                  Set a target role in onboarding to edit your 13 sections here.
                </p>
                <div className="mt-6">
                  <Link href="/onboarding">
                    <Button>Go to onboarding</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        <CoachBottomChatBar />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CoachFloatingNav />
      <div className="pb-44">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <Link
            href="/coach?journey=1"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-black/65 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to home
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Storyboard draft</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
              One <strong>Core Introduction</strong> + twelve fixed competencies (CAR: Context, Action,
              Result). Lock a section when it&apos;s interview-ready. Edits save in this browser.
            </p>
          </div>

          <Card className="shadow-[var(--app-shadow-soft)]">
            <CardBody>
              <div className="text-xs font-semibold tracking-[0.18em] text-[var(--app-muted)]">
                STORY STRENGTH
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                0–5 placeholder from CAR completeness. Overall = mean of the 12 competencies (intro
                excluded).
              </p>
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <div className="text-sm font-bold tracking-tight">Overall (12 competencies)</div>
                  <div className="text-xs text-[var(--app-muted)]">Mean strength</div>
                </div>
                <div
                  className="text-4xl font-extrabold tabular-nums tracking-tight"
                  title="Mean of 12 section strength scores"
                >
                  {overall.toFixed(1)}
                  <span className="text-lg font-extrabold text-[var(--app-muted)]"> / 5</span>
                </div>
              </div>

              <details className="mt-6 border-t border-white/50 pt-4" open>
                <summary className="cursor-pointer list-none text-sm font-bold tracking-tight text-gray-900 [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2">
                    Pillar scores
                    <span className="text-xs font-normal text-[var(--app-muted)]">
                      (4 pillars · 3 sections each)
                    </span>
                  </span>
                </summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {byPillar.map(({ id, v }) => (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-white/50 bg-white/60 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold tracking-tight">
                          {PILLAR_LABEL[id]}
                        </div>
                        <div className="text-xs text-[var(--app-muted)]">Mean / 5</div>
                      </div>
                      <div className="shrink-0 text-lg font-extrabold tabular-nums">
                        {v.toFixed(1)}
                        <span className="text-sm font-extrabold text-[var(--app-muted)]"> / 5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </CardBody>
          </Card>

          <section>
            <DraftSectionCard
              key="intro"
              pillarLabel="Introduction"
              displayTitle="Core Introduction"
              idLabel="intro"
              score={strengthScore(document.intro.car)}
              locked={document.intro.locked}
              onToggleLock={() =>
                updateDocument((d) => ({
                  ...d,
                  intro: { ...d.intro, locked: !d.intro.locked },
                }))
              }
            >
              <CarTextAreas
                value={document.intro.car}
                onChange={(car) => updateDocument((d) => ({ ...d, intro: { ...d.intro, car } }))}
                disabled={document.intro.locked}
                introVariant
              />
            </DraftSectionCard>
          </section>

          {PILLAR_ORDER.map((pillar) => {
            const rows = COMPETENCY_SPECS.map((spec, globalIndex) => ({ spec, globalIndex })).filter(
              (x) => x.spec.pillar === pillar,
            );
            return (
              <section key={pillar}>
                <div className="space-y-4">
                  {rows.map(({ spec, globalIndex: index }) => {
                    const s = document.competencies[index] ?? emptySection();
                    return (
                      <DraftSectionCard
                        key={spec.id}
                        pillarLabel={PILLAR_LABEL[spec.pillar]}
                        displayTitle={spec.title}
                        idLabel={spec.id}
                        score={strengthScore(s.car)}
                        locked={s.locked}
                        onToggleLock={() =>
                          updateDocument((d) => {
                            const comp = d.competencies.map((c, i) =>
                              i === index ? { ...c, locked: !c.locked } : c,
                            );
                            return { ...d, competencies: comp };
                          })
                        }
                      >
                        <CarTextAreas
                          value={s.car}
                          onChange={(car) =>
                            updateDocument((d) => {
                              const comp = d.competencies.map((c, i) =>
                                i === index ? { ...c, car } : c,
                              );
                              return { ...d, competencies: comp };
                            })
                          }
                          disabled={s.locked}
                        />
                      </DraftSectionCard>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div className="space-y-3 border-t border-white/40 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-[var(--app-muted)]">
                Continue building in Storyboard or save this draft to the browser.
              </p>
              <div className="flex flex-wrap gap-2 sm:shrink-0">
                <Link href="/storyboard">
                  <Button variant="secondary" type="button">
                    Add another experience
                  </Button>
                </Link>
                <Button type="button" onClick={handleSaveStoryboard}>
                  Save storyboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CoachBottomChatBar />
    </AppShell>
  );
}

function DraftSectionCard({
  pillarLabel,
  displayTitle,
  idLabel,
  score,
  locked,
  onToggleLock,
  children,
}: {
  pillarLabel: string;
  displayTitle: string;
  idLabel: string;
  score: number;
  locked: boolean;
  onToggleLock: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/50 bg-white shadow-[var(--app-shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/50 bg-[var(--app-surface)] px-4 py-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-muted)]">
            {pillarLabel}
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">{displayTitle}</h3>
          <div className="mt-0.5 text-xs text-[var(--app-muted)]">id: {idLabel}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full bg-black px-2.5 py-0.5 text-xs font-bold text-white"
            title="Strength score (0–5), based on how complete the CAR is (placeholder)."
          >
            Strength {score} / 5
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={onToggleLock}
            className="text-xs"
            title={locked ? "Unlock to edit" : "Lock to prevent edits"}
          >
            {locked ? "Unlock" : "Lock"}
          </Button>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CarTextAreas({
  value,
  onChange,
  disabled,
  introVariant,
}: {
  value: CarBlock;
  onChange: (c: CarBlock) => void;
  disabled: boolean;
  introVariant?: boolean;
}) {
  const patch = (k: keyof CarBlock, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-xs font-bold tracking-tight">Context</span>
        <p className="mb-1 text-xs text-[var(--app-muted)]">
          {introVariant
            ? "Primary interview opener: role, scope, and how the stories connect (2–3 sentences; may carry most of the intro)."
            : "Situation, constraints, stakes (2–3 sentences)."}
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
        <span className="text-xs font-bold tracking-tight">Action</span>
        <p className="mb-1 text-xs text-[var(--app-muted)]">
          {introVariant
            ? "Optional for intro. Add if you want a distinct “how you operate” line."
            : "What you did, decisions, and how you moved the work forward."}
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
        <span className="text-xs font-bold tracking-tight">Result</span>
        <p className="mb-1 text-xs text-[var(--app-muted)]">
          {introVariant
            ? "Optional. Outcomes, themes, or what the listener should take away."
            : "Outcomes, learning, business impact (measurable or qualitative)."}
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
