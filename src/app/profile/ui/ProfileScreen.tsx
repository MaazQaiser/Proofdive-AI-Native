"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Card, CardBody } from "@/components/Card";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { removeSavedRole, rolesWithActive, upsertSavedRole } from "@/lib/proofdiveLogic";
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
  action?: { label: string } & ({ href: string } | { onClick: () => void });
}) {
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <span className="text-h6">{title}</span>
        {action && "href" in action ? (
          <Link
            href={action.href}
            className="text-caption font-semibold text-[#0e7a6e] hover:opacity-80 transition"
          >
            {action.label}
          </Link>
        ) : action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="text-caption font-semibold text-[#0e7a6e] hover:opacity-80 transition"
          >
            {action.label}
          </button>
        ) : null}
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

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-overline uppercase text-[var(--app-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--app-hairline)] bg-[var(--app-surface)] px-3 py-2 text-caption font-semibold leading-snug outline-none transition focus:border-[#0d6b60] focus:ring-2 focus:ring-[#0d6b60]/20"
      />
    </label>
  );
}

const CAREER_STAGE_OPTIONS: Array<{ value: NonNullable<RoleProfile["backgroundType"]>; label: string }> = [
  { value: "fresh_grad", label: "Fresh grad" },
  { value: "under_grad", label: "Under grad" },
  { value: "diploma_holder", label: "Diploma holder" },
  { value: "experienced", label: "Experienced professional" },
];

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-overline uppercase text-[var(--app-muted)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--app-hairline)] bg-[var(--app-surface)] px-3 py-2 text-caption font-semibold leading-snug outline-none transition focus:border-[#0d6b60] focus:ring-2 focus:ring-[#0d6b60]/20"
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PrefRow({
  label,
  description,
  href,
  last,
}: {
  label: string;
  description: string;
  href: string;
  last?: boolean;
}) {
  return (
    <>
      <Link
        href={href}
        className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-black/[.02]"
      >
        <div className="min-w-0 flex-1">
          <div className="text-caption font-semibold">{label}</div>
          <div className="mt-0.5 text-caption text-[var(--app-muted)]">{description}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-caption font-semibold text-[var(--app-muted)]">
          <ChevronRightIcon />
        </div>
      </Link>
      {!last && <div className="h-px bg-[var(--app-hairline)] mx-6" />}
    </>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={[
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
        checked
          ? "border-black/10 bg-black"
          : "border-black/15 bg-white/60 hover:bg-white/80",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function RoleRow({
  profile,
  isActive,
  onSetActive,
  onRemove,
  last,
}: {
  profile: RoleProfile;
  isActive: boolean;
  onSetActive: () => void;
  onRemove: () => void;
  last?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-caption font-semibold">
            {profile.targetRole}
            {isActive && (
              <span className="rounded-full bg-[#0d6b60]/10 px-2 py-0.5 text-overline text-[#0d6b60]">
                Active
              </span>
            )}
          </div>
          {profile.industryVertical && (
            <div className="mt-0.5 text-caption text-[var(--app-muted)]">
              {profile.industryVertical}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!isActive && (
            <button
              type="button"
              onClick={onSetActive}
              className="rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] px-3 py-1.5 text-caption font-semibold shadow-sm transition hover:bg-black/[.03] active:bg-black/[.06]"
            >
              Set active
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            disabled={isActive}
            title={isActive ? "Switch to another role before removing this one" : undefined}
            className="rounded-full border border-red-300 bg-transparent px-3 py-1.5 text-caption font-semibold text-red-500 transition hover:bg-red-50 active:bg-red-100 disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/30 disabled:hover:bg-transparent"
          >
            Remove
          </button>
        </div>
      </div>
      {!last && <div className="h-px bg-[var(--app-hairline)] mx-6" />}
    </>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const router = useRouter();

  const [roleProfile, setRoleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [savedRoles, setSavedRoles] = useLocalStorageState<RoleProfile[]>(
    StorageKeys.savedRoles,
    [],
  );
  const [reports, setReports] = useLocalStorageState<Record<string, InterviewReport>>(
    StorageKeys.reports,
    {},
  );
  const [aiTrainingConsent, setAiTrainingConsent] = useLocalStorageState<boolean>(
    StorageKeys.aiTrainingConsent,
    true,
  );
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorageState<boolean>(
    StorageKeys.candidateNotificationsEnabled,
    true,
  );
  const [recordingsCleared, setRecordingsCleared] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const [avatarImage, setAvatarImage] = useLocalStorageState<string | null>(
    StorageKeys.candidateAvatarImage,
    null,
  );
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [pendingAvatarImage, setPendingAvatarImage] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [personalInfoDraft, setPersonalInfoDraft] = useState<{
    name: string;
    email: string;
    careerStage: RoleProfile["backgroundType"] | "";
  }>({ name: "", email: "", careerStage: "" });
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const roles = useMemo(() => rolesWithActive(savedRoles, roleProfile), [savedRoles, roleProfile]);

  function handleSetActiveRole(profile: RoleProfile) {
    setSavedRoles((prev) =>
      roleProfile?.targetRole?.trim() ? upsertSavedRole(prev, roleProfile) : prev,
    );
    setRoleProfile(profile);
    setEmailNotice(null);
  }

  function handleRemoveRole(targetRole: string) {
    setSavedRoles((prev) => removeSavedRole(prev, targetRole));
  }

  function openAvatarDialog() {
    setPendingAvatarImage(avatarImage);
    setAvatarDialogOpen(true);
  }

  function handleAvatarFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPendingAvatarImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function saveAvatarImage() {
    setAvatarImage(pendingAvatarImage);
    setAvatarDialogOpen(false);
  }

  function startEditPersonalInfo() {
    setPersonalInfoDraft({
      name: roleProfile?.name ?? "",
      email: roleProfile?.email ?? "",
      careerStage: roleProfile?.backgroundType ?? "",
    });
    setEmailNotice(null);
    setIsEditingPersonalInfo(true);
  }

  function savePersonalInfo() {
    if (!roleProfile) return;
    const trimmedName = personalInfoDraft.name.trim();
    const trimmedEmail = personalInfoDraft.email.trim();

    const updated: RoleProfile = {
      ...roleProfile,
      name: trimmedName || undefined,
      email: trimmedEmail || undefined,
      backgroundType: personalInfoDraft.careerStage || undefined,
    };

    setSavedRoles((prev) => {
      const withActive = upsertSavedRole(prev, updated);
      // Name/email/career stage are account-level, not per-role — keep every saved role in sync.
      return withActive.map((r) => ({
        ...r,
        name: updated.name,
        email: updated.email,
        backgroundType: updated.backgroundType,
      }));
    });
    setRoleProfile(updated);

    const emailChanged = trimmedEmail !== (roleProfile.email ?? "").trim();
    setEmailNotice(
      emailChanged && trimmedEmail
        ? `Verification email sent to ${trimmedEmail}. Please verify to confirm the change.`
        : null,
    );
    setIsEditingPersonalInfo(false);
  }

  const reportCount = Object.keys(reports ?? {}).length;
  const usageUsed = reportCount;
  const usageLimit = 12;
  const usagePct = Math.min(100, Math.round((usageUsed / usageLimit) * 100));

  const avatarText = initials(roleProfile?.name, roleProfile?.targetRole);
  const hasProfile = Boolean(roleProfile?.targetRole);

  const careerStage = roleProfile?.backgroundType
    ? labelBackgroundType(roleProfile.backgroundType)
    : undefined;

  const subtitleParts = [careerStage, roleProfile?.targetRole, roleProfile?.industryVertical].filter(
    Boolean,
  );

  const careerStageChanged =
    (personalInfoDraft.careerStage || "") !== (roleProfile?.backgroundType || "");

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
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#0d6b60] text-white text-h6 select-none">
                        {avatarImage ? (
                          // eslint-disable-next-line @next/next/no-img-element -- locally-stored data URL, not an optimizable remote asset
                          <img src={avatarImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          avatarText
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={openAvatarDialog}
                        aria-label="Change profile photo"
                        className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--app-surface)] bg-white shadow-sm transition hover:bg-black/[.03]"
                      >
                        <PencilIcon />
                      </button>
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
                  </div>
                </CardBody>
              </Card>

              {/* Personal information card */}
              <Card>
                <SectionHeader
                  title="Personal information"
                  action={
                    isEditingPersonalInfo
                      ? undefined
                      : { label: "Edit", onClick: startEditPersonalInfo }
                  }
                />
                {isEditingPersonalInfo ? (
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <EditField
                        label="Full name"
                        value={personalInfoDraft.name}
                        onChange={(v) => setPersonalInfoDraft((d) => ({ ...d, name: v }))}
                      />
                      <EditField
                        label="Email"
                        type="email"
                        value={personalInfoDraft.email}
                        onChange={(v) => setPersonalInfoDraft((d) => ({ ...d, email: v }))}
                      />
                      <SelectField
                        label="Career stage"
                        value={personalInfoDraft.careerStage ?? ""}
                        onChange={(v) =>
                          setPersonalInfoDraft((d) => ({
                            ...d,
                            careerStage: v as RoleProfile["backgroundType"] | "",
                          }))
                        }
                        options={CAREER_STAGE_OPTIONS}
                      />
                      <InfoField
                        label="Member since"
                        value={roleProfile!.createdAt ? memberSince(roleProfile!.createdAt) : undefined}
                      />
                    </div>
                    {careerStageChanged && (
                      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-caption text-amber-800">
                        Changing your career stage will also adjust your Storyboard, Training
                        modules, and Mock Interview practice to match the new stage.
                      </p>
                    )}
                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={savePersonalInfo}
                        className="rounded-full bg-[#0d6b60] px-4 py-2 text-caption font-semibold text-white transition hover:bg-[#0d6b60]/90"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPersonalInfo(false)}
                        className="rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] px-4 py-2 text-caption font-semibold shadow-sm transition hover:bg-black/[.03] active:bg-black/[.06]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
                    <InfoField label="Full name" value={roleProfile!.name} />
                    <InfoField label="Email" value={roleProfile?.email} />
                    <InfoField label="Career stage" value={careerStage} />
                    <InfoField
                      label="Member since"
                      value={roleProfile!.createdAt ? memberSince(roleProfile!.createdAt) : undefined}
                    />
                  </div>
                )}
                {emailNotice && (
                  <div className="px-6 pb-5">
                    <p className="rounded-lg bg-[#0d6b60]/10 px-3 py-2 text-caption text-[#0d6b60]">
                      {emailNotice}
                    </p>
                  </div>
                )}
              </Card>

              {/* Roles card */}
              <Card>
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                  <span className="text-h6">Roles you&apos;re preparing for</span>
                  <Link
                    href="/onboarding?newRole=1"
                    className="text-caption font-semibold text-[#0e7a6e] hover:opacity-80 transition"
                  >
                    + Add role
                  </Link>
                </div>
                <div className="h-px bg-[var(--app-hairline)] mx-6" />
                {roles.map((r, i) => (
                  <RoleRow
                    key={r.targetRole.trim().toLowerCase()}
                    profile={r}
                    isActive={r.targetRole.trim().toLowerCase() === roleProfile!.targetRole.trim().toLowerCase()}
                    onSetActive={() => handleSetActiveRole(r)}
                    onRemove={() => handleRemoveRole(r.targetRole)}
                    last={i === roles.length - 1}
                  />
                ))}
              </Card>

              {/* Preferences card */}
              <Card>
                <SectionHeader title="Preferences" />
                <PrefRow label="Password" description="Change your password" href="/profile/change-password" />
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-caption font-semibold">Notifications</div>
                    <div className="mt-0.5 text-caption text-[var(--app-muted)]">
                      Practice reminders and score updates
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled((v) => !v)}
                    label="Practice reminders and score updates"
                  />
                </div>
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
                  <ToggleSwitch
                    checked={aiTrainingConsent}
                    onChange={() => setAiTrainingConsent((v) => !v)}
                    label="Use my recordings to improve AI"
                  />
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

      {avatarDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setAvatarDialogOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-black/10 bg-[var(--app-surface)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span id="avatar-dialog-title" className="text-h6">
                Update profile photo
              </span>
              <button
                type="button"
                onClick={() => setAvatarDialogOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 transition hover:bg-black/[.05] hover:text-black"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#0d6b60] text-white text-h5 select-none">
                {pendingAvatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- locally-stored data URL, not an optimizable remote asset
                  <img src={pendingAvatarImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  avatarText
                )}
              </div>

              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] px-4 py-2 text-caption font-semibold shadow-sm transition hover:bg-black/[.03] active:bg-black/[.06]"
                >
                  Choose photo
                </button>
                {pendingAvatarImage && (
                  <button
                    type="button"
                    onClick={() => setPendingAvatarImage(null)}
                    className="rounded-full border border-red-300 bg-transparent px-4 py-2 text-caption font-semibold text-red-500 transition hover:bg-red-50 active:bg-red-100"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-center text-caption text-[var(--app-muted)]">
                Stored locally in your browser for this prototype — not uploaded anywhere.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAvatarDialogOpen(false)}
                className="rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] px-4 py-2 text-caption font-semibold shadow-sm transition hover:bg-black/[.03] active:bg-black/[.06]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAvatarImage}
                className="rounded-full bg-[#0d6b60] px-4 py-2 text-caption font-semibold text-white transition hover:bg-[#0d6b60]/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
