"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Card, CardBody } from "@/components/Card";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { InterviewReport, RoleProfile } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { Button } from "@/components/Button";

// ─── helpers ─────────────────────────────────────────────────────────────────

function initials(name?: string, role?: string): string {
  const source = name ?? role ?? "?";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function labelBackgroundType(v: RoleProfile["backgroundType"]): string {
  switch (v) {
    case "fresh_grad": return "fresh-grad";
    case "under_grad": return "undergrad";
    case "diploma_holder": return "diploma";
    case "experienced": return "experienced";
    default: return "—";
  }
}

function memberSince(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─── small primitives ────────────────────────────────────────────────────────

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <span className="text-h6">{title}</span>
        {action && (
          <Link
            href={action.href}
            className="text-caption font-semibold text-[#0e7a6e] hover:opacity-80 transition"
          >
            {action.label}
          </Link>
        )}
      </div>
      <div className="h-px bg-[var(--app-hairline)] mx-6" />
    </>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-overline uppercase text-[var(--app-muted)]">
        {label}
      </span>
      <span className="text-caption font-semibold leading-snug">{value || "—"}</span>
    </div>
  );
}

function PrefRow({
  label,
  description,
  value,
  last,
}: {
  label: string;
  description: string;
  value?: string;
  last?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="text-caption font-semibold">{label}</div>
          <div className="mt-0.5 text-caption text-[var(--app-muted)]">{description}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-caption font-semibold text-[var(--app-muted)]">
          {value && <span>{value}</span>}
          <ChevronRightIcon />
        </div>
      </div>
      {!last && <div className="h-px bg-[var(--app-hairline)] mx-6" />}
    </>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const router = useRouter();

  const [roleProfile] = useLocalStorageState<RoleProfile | null>(StorageKeys.roleProfile, null);
  const [reports, setReports] = useLocalStorageState<Record<string, InterviewReport>>(
    StorageKeys.reports,
    {},
  );
  const [aiTrainingConsent, setAiTrainingConsent] = useLocalStorageState<boolean>(
    StorageKeys.aiTrainingConsent,
    true,
  );
  const [recordingsCleared, setRecordingsCleared] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const reportCount = Object.keys(reports ?? {}).length;
  const usageUsed = reportCount;
  const usageLimit = 12;
  const usagePct = Math.min(100, Math.round((usageUsed / usageLimit) * 100));

  const avatarText = initials(roleProfile?.name, roleProfile?.targetRole);
  const hasProfile = Boolean(roleProfile?.targetRole);

  const careerStage = roleProfile?.backgroundType
    ? labelBackgroundType(roleProfile.backgroundType)
    : undefined;

  const subtitleParts = [careerStage, roleProfile?.targetRole].filter(Boolean);

  return (
    <>
      <CoachFloatingNav />
      <AppShell>
        {hasProfile ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

            {/* ══ left column ══════════════════════════════════════════════ */}
            <div className="space-y-4">

              {/* Profile header card */}
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar with pencil badge */}
                    <div className="relative shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0d6b60] text-white text-h6 select-none">
                        {avatarText}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--app-surface)] bg-white shadow-sm">
                        <PencilIcon />
                      </div>
                    </div>

                    {/* Name + subtitle */}
                    <div className="min-w-0 flex-1">
                      <div className="text-h6 leading-tight">
                        Your profile
                      </div>
                      {subtitleParts.length > 0 && (
                        <div className="mt-0.5 text-caption text-[var(--app-muted)]">
                          {subtitleParts.join(" · ")}
                        </div>
                      )}
                    </div>

                    {/* Edit profile button */}
                    <Link href="/onboarding">
                      <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] px-4 py-2 text-caption font-semibold shadow-sm transition hover:bg-black/[.03] active:bg-black/[.06]">
                        Edit profile
                        <ArrowUpRightIcon />
                      </button>
                    </Link>
                  </div>
                </CardBody>
              </Card>

              {/* Personal information card */}
              <Card>
                <SectionHeader
                  title="Personal information"
                  action={{ label: "Edit", href: "/onboarding" }}
                />
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
                  <InfoField label="Full name" value={roleProfile!.name} />
                  <InfoField label="Email" />
                  <InfoField label="Career stage" value={careerStage} />
                  <InfoField label="Target role" value={roleProfile!.targetRole} />
                  <InfoField label="Industry" />
                  <InfoField
                    label="Member since"
                    value={roleProfile!.createdAt ? memberSince(roleProfile!.createdAt) : undefined}
                  />
                </div>
              </Card>

              {/* Preferences card */}
              <Card>
                <SectionHeader
                  title="Preferences"
                  action={{ label: "Manage", href: "#" }}
                />
                <PrefRow
                  label="Password"
                  description="Change your password"
                />
                <PrefRow
                  label="Notifications"
                  description="Practice reminders and score updates"
                  value="On"
                />
                <PrefRow
                  label="Language"
                  description="Interface and interview language"
                  value="English"
                  last
                />
              </Card>

              {/* Data & privacy card */}
              <Card>
                <SectionHeader title="Data &amp; privacy" />

                {/* AI training consent toggle */}
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-caption font-semibold">Use my recordings to improve AI</div>
                    <div className="mt-0.5 text-caption text-[var(--app-muted)]">
                      Allow ProofDive to use your interview recordings to train and improve the AI.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={aiTrainingConsent}
                    aria-label="Use my recordings to improve AI"
                    onClick={() => setAiTrainingConsent((v) => !v)}
                    className={[
                      "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                      aiTrainingConsent
                        ? "border-black/10 bg-black"
                        : "border-black/15 bg-white/60 hover:bg-white/80",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition",
                        aiTrainingConsent ? "translate-x-6" : "translate-x-1",
                      ].join(" ")}
                    />
                  </button>
                </div>
                <div className="h-px bg-[var(--app-hairline)] mx-6" />

                {/* Delete interview recordings */}
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-caption font-semibold">Interview recordings</div>
                    <div className="mt-0.5 text-caption text-[var(--app-muted)]">
                      {recordingsCleared
                        ? "Your interview recordings have been removed."
                        : `${reportCount} recording${reportCount === 1 ? "" : "s"} stored on this device.`}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={reportCount === 0}
                    onClick={() => {
                      setReports({});
                      setRecordingsCleared(true);
                    }}
                    className="shrink-0 rounded-full border border-red-300 bg-transparent px-4 py-2 text-caption font-semibold text-red-500 transition hover:bg-red-50 active:bg-red-100 disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/30 disabled:hover:bg-transparent"
                  >
                    Delete recordings
                  </button>
                </div>
                <div className="h-px bg-[var(--app-hairline)] mx-6" />

                {/* Delete my data (showcase) */}
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-caption font-semibold">Delete my data</div>
                    <div className="mt-0.5 text-caption text-[var(--app-muted)]">
                      {deleteRequested
                        ? "Account deletion isn't available in this prototype yet."
                        : "Permanently remove your account and all associated data."}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteRequested(true)}
                    className="shrink-0 rounded-full border border-red-300 bg-transparent px-4 py-2 text-caption font-semibold text-red-500 transition hover:bg-red-50 active:bg-red-100"
                  >
                    Delete my data
                  </button>
                </div>
              </Card>
            </div>

            {/* ══ right sidebar ════════════════════════════════════════════ */}
            <div className="space-y-4">

              {/* Usage limit card */}
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-h6">Usage limit</span>
                    <button className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6b60]/10 px-3 py-1 text-overline text-[#0d6b60] transition hover:bg-[#0d6b60]/15">
                      <SparkleIcon />
                      AI insights
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="text-h5">
                      {usageUsed}/{usageLimit} used
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-overline text-[var(--app-muted)]">Rolling 30-day window</span>
                      <span className="text-overline text-[#0d6b60]">{usagePct}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/[.07]">
                      <div
                        className="h-full rounded-full bg-[#0d6b60] transition-all"
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-caption leading-5 text-[var(--app-muted)]">
                    We count generated feedback reports toward this limit. Upgrade limits will be
                    wired once billing lands.
                  </p>
                </CardBody>
              </Card>

              {/* Account card */}
              <Card>
                <CardBody className="p-6 space-y-4">
                  <span className="text-h6">Account</span>

                  <div>
                    <div className="text-overline uppercase text-[var(--app-muted)] mb-1">
                      Status
                    </div>
                    <div className="text-caption font-semibold">Active</div>
                    <p className="mt-1.5 text-caption leading-5 text-[var(--app-muted)]">
                      This is a prototype account stored locally in your browser for now.
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/login")}
                    className="w-full rounded-full border border-red-300 bg-transparent py-2.5 text-caption font-semibold text-red-500 transition hover:bg-red-50 active:bg-red-100"
                  >
                    Sign out
                  </button>
                </CardBody>
              </Card>
            </div>
          </div>
        ) : (
          /* ── empty state ── */
          <Card className="shadow-none">
            <CardBody className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0d6b60]/10">
                <ProfileEmptyIcon />
              </div>
              <div className="text-h6">No profile yet</div>
              <p className="mt-2 text-caption leading-6 text-[var(--app-muted)]">
                Complete onboarding to set up your target role and personalize your journey.
              </p>
              <div className="mt-6">
                <Link href="/onboarding">
                  <Button>Set up profile</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        )}
      </AppShell>
    </>
  );
}

// ─── icons ────────────────────────────────────────────────────────────────────

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        d="M7.5 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M4 12L12 4M12 4H6M12 4v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5 text-black/50" aria-hidden>
      <path
        d="M8.5 1.5l2 2L3 11H1v-2L8.5 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden>
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1Z" />
    </svg>
  );
}

function ProfileEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[#0d6b60]" aria-hidden>
      <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
      <path d="M5 21a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
