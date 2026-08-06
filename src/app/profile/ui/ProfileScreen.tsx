"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, Fragment, useMemo, useRef, useState } from "react";
import { ChevronRight, Pencil, Trash2, UserRound } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { computeCandidateUsage, type UsageMeter } from "@/lib/candidateUsage";
import { removeSavedRole, rolesWithActive, upsertSavedRole } from "@/lib/proofdiveLogic";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { InterviewReport, RoleProfile, TrainingJourneyProgress } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useStoryboardDiveStore } from "@/lib/useStoryboardDiveStore";
import {
  useCandidateEntitlements,
  useCandidateSubscription,
} from "@/lib/useSubscriberPayments";

// ─── helpers ─────────────────────────────────────────────────────────────────

function initials(name?: string, role?: string): string {
  const source = (name ?? role ?? "?").trim();
  return (source[0] ?? "?").toUpperCase();
}

function labelBackgroundType(v: RoleProfile["backgroundType"]): string {
  switch (v) {
    case "fresh_grad": return "Freshie";
    case "under_grad": return "Undergraduate";
    case "diploma_holder": return "Diploma Holder";
    case "experienced": return "Experienced Professional";
    default: return "—";
  }
}

function labelExperienceLevel(v: RoleProfile["experienceLevel"]): string {
  switch (v) {
    case "1-5": return "1–5 years";
    case "5-10": return "5–10 years";
    case "10+": return "10+ years";
    default: return "—";
  }
}

function formatCareerStage(profile: RoleProfile): string | undefined {
  if (!profile.backgroundType) return undefined;
  if (profile.backgroundType === "experienced" && profile.experienceLevel) {
    return `${labelBackgroundType(profile.backgroundType)} · ${labelExperienceLevel(profile.experienceLevel)}`;
  }
  return labelBackgroundType(profile.backgroundType);
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

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-body-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

function UsageMeterRow({ meter }: { meter: UsageMeter }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm font-medium text-foreground">{meter.label}</span>
        <span className="text-caption text-muted-foreground">
          {meter.used}/{meter.limit} used
        </span>
      </div>
      <ProgressBar className="mt-2 h-1.5" value={meter.pct} />
    </div>
  );
}

function PrefRow({
  label,
  description,
  href,
}: {
  label: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 transition hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1">
        <div className="text-body-sm font-medium text-foreground">{label}</div>
        <div className="mt-0.5 text-caption text-muted-foreground">{description}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function RoleRow({
  profile,
  isSelected,
  onRemove,
}: {
  profile: RoleProfile;
  isSelected: boolean;
  onRemove: () => void;
}) {
  const careerStage = formatCareerStage(profile);
  const meta = [profile.industryVertical, careerStage].filter(Boolean).join(" · ");

  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-body-sm font-medium text-foreground">
          {profile.targetRole}
          {isSelected && (
            <Badge className="border-transparent bg-primary/10 text-primary">Selected</Badge>
          )}
        </div>
        {meta ? (
          <div className="mt-0.5 text-caption text-muted-foreground">{meta}</div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <IconButton
          variant="ghost"
          onClick={onRemove}
          disabled={isSelected}
          aria-label="Remove role"
          title={isSelected ? "Switch to another role before removing this one" : "Remove role"}
          className="text-destructive hover:bg-transparent hover:text-destructive/80 disabled:opacity-40"
        >
          <Trash2 />
        </IconButton>
      </div>
    </div>
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
  const [trainingProgress] = useLocalStorageState<Record<string, TrainingJourneyProgress>>(
    StorageKeys.trainingProgress,
    {},
  );
  const [subscription] = useCandidateSubscription();
  const [entitlements] = useCandidateEntitlements();
  const { bundles } = usePaymentBundles();
  const [diveStore] = useStoryboardDiveStore();
  const [storyboardGenerationCount] = useLocalStorageState<number>(
    StorageKeys.candidateStoryboardGenerations,
    0,
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
  }>({ name: "", email: "" });
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const roles = useMemo(() => rolesWithActive(savedRoles, roleProfile), [savedRoles, roleProfile]);

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
    };

    setSavedRoles((prev) => {
      const withActive = upsertSavedRole(prev, updated);
      // Name/email are account-level — keep every saved role in sync.
      return withActive.map((r) => ({
        ...r,
        name: updated.name,
        email: updated.email,
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

  const reportCount = Object.keys(reports ?? {}).length;

  const avatarText = initials(roleProfile?.name, roleProfile?.targetRole);
  const hasProfile = Boolean(roleProfile?.targetRole);

  const subtitleParts = [roleProfile?.targetRole, roleProfile?.industryVertical].filter(Boolean);

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
                <CardContent className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="h-14 w-14">
                      {avatarImage ? <AvatarImage src={avatarImage} alt="" /> : null}
                      <AvatarFallback className="select-none bg-primary/10 text-h6 text-primary">
                        {avatarText}
                      </AvatarFallback>
                    </Avatar>
                    <IconButton
                      variant="solid"
                      onClick={openAvatarDialog}
                      aria-label="Change profile photo"
                      className="absolute -bottom-1 -right-1"
                    >
                      <Pencil />
                    </IconButton>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-h6 leading-tight">
                      {roleProfile?.name?.trim() || "Your profile"}
                    </div>
                    {subtitleParts.length > 0 && (
                      <div className="mt-0.5 text-caption text-muted-foreground">
                        {subtitleParts.join(" · ")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Personal information card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>Personal information</CardTitle>
                    {!isEditingPersonalInfo && (
                      <Button variant="outline" size="sm" onClick={startEditPersonalInfo}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {isEditingPersonalInfo ? (
                    <>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="profile-name">Full name</Label>
                          <Input
                            id="profile-name"
                            value={personalInfoDraft.name}
                            onChange={(e) =>
                              setPersonalInfoDraft((d) => ({ ...d, name: e.target.value }))
                            }
                            placeholder="Jane Doe"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="profile-email">Email</Label>
                          <Input
                            id="profile-email"
                            type="email"
                            value={personalInfoDraft.email}
                            onChange={(e) =>
                              setPersonalInfoDraft((d) => ({ ...d, email: e.target.value }))
                            }
                            placeholder="you@company.com"
                          />
                        </div>
                        <DetailRow
                          label="Member since"
                          value={roleProfile!.createdAt ? memberSince(roleProfile!.createdAt) : undefined}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={savePersonalInfo}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingPersonalInfo(false)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                      <DetailRow label="Full name" value={roleProfile!.name} />
                      <DetailRow label="Email" value={roleProfile?.email} />
                      <DetailRow
                        label="Member since"
                        value={roleProfile!.createdAt ? memberSince(roleProfile!.createdAt) : undefined}
                      />
                    </div>
                  )}
                  {emailNotice && (
                    <p className="rounded-lg bg-primary/10 px-3 py-2 text-caption text-primary">
                      {emailNotice}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Roles card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>Roles you&apos;re preparing for</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/onboarding?newRole=1">+ Add role</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col">
                  {roles.map((r, i) => (
                    <Fragment key={r.targetRole.trim().toLowerCase()}>
                      {i > 0 && <Separator />}
                      <RoleRow
                        profile={r}
                        isSelected={
                          r.targetRole.trim().toLowerCase() ===
                          roleProfile!.targetRole.trim().toLowerCase()
                        }
                        onRemove={() => handleRemoveRole(r.targetRole)}
                      />
                    </Fragment>
                  ))}
                </CardContent>
              </Card>

              {/* Preferences card */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col">
                  <PrefRow label="Password" description="Change your password" href="/profile/change-password" />
                  <Separator />
                  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-body-sm font-medium text-foreground">Notifications</div>
                      <div className="mt-0.5 text-caption text-muted-foreground">
                        Practice reminders and score updates
                      </div>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                      aria-label="Practice reminders and score updates"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data & privacy card */}
              <Card>
                <CardHeader>
                  <CardTitle>Data &amp; privacy</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col">
                  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-body-sm font-medium text-foreground">
                        Use my recordings to improve AI
                      </div>
                      <div className="mt-0.5 text-caption text-muted-foreground">
                        Allow ProofDive to use your interview recordings to train and improve the AI.
                      </div>
                    </div>
                    <Switch
                      checked={aiTrainingConsent}
                      onCheckedChange={setAiTrainingConsent}
                      aria-label="Use my recordings to improve AI"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-body-sm font-medium text-foreground">Interview recordings</div>
                      <div className="mt-0.5 text-caption text-muted-foreground">
                        {recordingsCleared
                          ? "Your interview recordings have been removed."
                          : `${reportCount} recording${reportCount === 1 ? "" : "s"} stored on this device.`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={reportCount === 0}
                      onClick={() => {
                        setReports({});
                        setRecordingsCleared(true);
                      }}
                    >
                      Delete recordings
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-body-sm font-medium text-foreground">Delete my data</div>
                      <div className="mt-0.5 text-caption text-muted-foreground">
                        {deleteRequested
                          ? "Account deletion isn't available in this prototype yet."
                          : "Permanently remove your account and all associated data."}
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteRequested(true)}>
                      Delete my data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ══ right sidebar ════════════════════════════════════════════ */}
            <div className="space-y-4">

              {/* Usage limit card */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage limit</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-caption text-muted-foreground">Current plan</span>
                    <Badge variant="secondary" className="font-medium">
                      {usage.planLabel}
                    </Badge>
                  </div>

                  <UsageMeterRow meter={usage.mockInterviews} />
                  <UsageMeterRow meter={usage.storyboards} />

                  <Button asChild size="sm" className="w-full">
                    <Link href="/profile/pricing">Upgrade Plan</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/profile/billing">Payments & Subscription</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Account card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <DetailRow label="Status" value="Active" />

                  <Button variant="destructive" className="w-full" onClick={() => router.push("/login")}>
                    Sign out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* ── empty state ── */
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UserRound className="h-7 w-7 text-primary" />
              </div>
              <div className="text-h6">No profile yet</div>
              <p className="mt-2 text-caption leading-6 text-muted-foreground">
                Complete onboarding to set up your target role and personalize your journey.
              </p>
              <Button asChild className="mt-6">
                <Link href="/onboarding">Set up profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </AppShell>

      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update profile photo</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              {pendingAvatarImage ? <AvatarImage src={pendingAvatarImage} alt="" /> : null}
              <AvatarFallback className="select-none bg-primary/10 text-h5 text-primary">
                {avatarText}
              </AvatarFallback>
            </Avatar>

            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => avatarFileInputRef.current?.click()}>
                Choose photo
              </Button>
              {pendingAvatarImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setPendingAvatarImage(null)}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-center text-caption text-muted-foreground">
              Stored locally in your browser for this prototype — not uploaded anywhere.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAvatarDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAvatarImage}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
