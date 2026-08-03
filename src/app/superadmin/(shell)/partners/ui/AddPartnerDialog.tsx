"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronRight,
  Handshake,
  Percent,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { COUNTRY_OPTIONS, PHONE_COUNTRY_CODES } from "@/lib/superAdminOrganizationWizard";
import {
  AUDIENCE_TYPE_LABEL,
  COMMISSION_TYPE_LABEL,
  ENTITY_TYPE_LABEL,
  PARTNER_TYPE_LABEL,
  generateReferralCode,
  type AudienceType,
  type CommissionType,
  type EntityType,
  type Partner,
  type PartnerType,
} from "@/lib/superAdminPartners";

type StepId = "landing" | "basic" | "entity" | "type" | "volume" | "commission" | "review";

const STEP_ORDER: StepId[] = ["landing", "basic", "entity", "type", "volume", "commission", "review"];
const TOTAL_STEPS = STEP_ORDER.length - 1;

const STEP_TITLES: Record<StepId, string> = {
  landing: "Add New Partner",
  basic: "Basic Details",
  entity: "Entity Details",
  type: "Partner Type",
  volume: "Expected User Volume",
  commission: "Commission Structure",
  review: "Review & Send Invite",
};

const STEP_CARDS: { step: number; id: StepId; title: string; icon: typeof User }[] = [
  { step: 1, id: "basic", title: "Basic Details", icon: User },
  { step: 2, id: "entity", title: "Entity", icon: Building2 },
  { step: 3, id: "type", title: "Partner Type", icon: Handshake },
  { step: 4, id: "volume", title: "User Volume", icon: Users },
  { step: 5, id: "commission", title: "Commission", icon: Percent },
];

function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-body-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-md border border-border p-4">
      <h3 className="text-overline text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

type FormState = {
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  country: string;
  entityType: EntityType | "";
  companyName: string;
  website: string;
  audienceType: AudienceType | "";
  partnerType: PartnerType | "";
  expectedUserVolume: string;
  commissionType: CommissionType | "";
  commissionPercent: string;
  commissionFixedDollars: string;
};

function createInitialFormState(): FormState {
  return {
    fullName: "",
    email: "",
    phoneCountryCode: PHONE_COUNTRY_CODES[0].code,
    phone: "",
    country: "",
    entityType: "",
    companyName: "",
    website: "",
    audienceType: "",
    partnerType: "",
    expectedUserVolume: "",
    commissionType: "",
    commissionPercent: "15",
    commissionFixedDollars: "25",
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FieldErrors = Record<string, string>;

type AddPartnerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmails: string[];
  existingReferralCodes: string[];
  onCreate: (partner: Partner) => void;
};

export function AddPartnerDialog({
  open,
  onOpenChange,
  existingEmails,
  existingReferralCodes,
  onCreate,
}: AddPartnerDialogProps) {
  const [step, setStep] = useState<StepId>("landing");
  const [form, setForm] = useState<FormState>(createInitialFormState);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) {
      setStep("landing");
      setForm(createInitialFormState());
      setErrors({});
    }
  }, [open]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function goToStep(target: StepId) {
    setErrors({});
    setStep(target);
  }

  function handleBack() {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex > 0) goToStep(STEP_ORDER[currentIndex - 1]);
  }

  function validateBasic(): FieldErrors {
    const next: FieldErrors = {};
    if (!form.fullName.trim()) next.fullName = "Full Name is required.";
    if (!form.email.trim()) next.email = "Email Address is required.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Please enter a valid email address.";
    else if (existingEmails.includes(form.email.trim().toLowerCase()))
      next.email = "Email address already exists.";
    if (!form.phone.trim()) next.phone = "Please enter a valid phone number.";
    else if (!/^\d{6,12}$/.test(form.phone.trim())) next.phone = "Please enter a valid phone number.";
    if (!form.country) next.country = "Country / Region is required.";
    return next;
  }

  function validateEntity(): FieldErrors {
    const next: FieldErrors = {};
    if (form.entityType === "company" && !form.companyName.trim())
      next.companyName = "Company Name is required.";
    if (!form.audienceType) next.audienceType = "Audience Type is required.";
    return next;
  }

  function validateType(): FieldErrors {
    const next: FieldErrors = {};
    if (!form.partnerType) next.partnerType = "Partner Type is required.";
    return next;
  }

  function validateVolume(): FieldErrors {
    const next: FieldErrors = {};
    const volume = Number(form.expectedUserVolume);
    if (!form.expectedUserVolume.trim() || Number.isNaN(volume) || volume < 1)
      next.expectedUserVolume = "Enter an expected user volume of at least 1.";
    return next;
  }

  function validateCommission(): FieldErrors {
    const next: FieldErrors = {};
    if (!form.commissionType) next.commissionType = "Commission Type is required.";
    if (form.commissionType === "percentage") {
      const pct = Number(form.commissionPercent);
      if (Number.isNaN(pct) || pct <= 0 || pct > 100)
        next.commissionPercent = "Enter a percentage between 1 and 100.";
    }
    if (form.commissionType === "fixed") {
      const dollars = Number(form.commissionFixedDollars);
      if (Number.isNaN(dollars) || dollars <= 0)
        next.commissionFixedDollars = "Enter a fixed amount greater than zero.";
    }
    return next;
  }

  function handleNext() {
    let nextErrors: FieldErrors = {};
    if (step === "landing") {
      if (!form.entityType) {
        setErrors({ entityType: "Please select an entity type." });
        return;
      }
    } else if (step === "basic") nextErrors = validateBasic();
    else if (step === "entity") nextErrors = validateEntity();
    else if (step === "type") nextErrors = validateType();
    else if (step === "volume") nextErrors = validateVolume();
    else if (step === "commission") nextErrors = validateCommission();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (step === "review") {
      handleSubmit();
      return;
    }

    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex < STEP_ORDER.length - 1) goToStep(STEP_ORDER[currentIndex + 1]);
  }

  function handleSubmit() {
    const referralCode = generateReferralCode(form.fullName, existingReferralCodes);
    const partner: Partner = {
      id: `partner_${Date.now()}`,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phoneCountryCode: form.phoneCountryCode,
      phone: form.phone.trim(),
      country: form.country,
      entityType: form.entityType as EntityType,
      companyName: form.entityType === "company" ? form.companyName.trim() : "",
      website: form.website.trim(),
      audienceType: form.audienceType as AudienceType,
      partnerType: form.partnerType as PartnerType,
      expectedUserVolume: Number(form.expectedUserVolume),
      referralCode,
      commissionType: form.commissionType as CommissionType,
      commissionPercent: Number(form.commissionPercent) || 10,
      commissionFixedCents: Math.round((Number(form.commissionFixedDollars) || 25) * 100),
      commissionTiers: [
        { minReferrals: 0, ratePercent: 10 },
        { minReferrals: 50, ratePercent: 15 },
        { minReferrals: 100, ratePercent: 20 },
      ],
      payoutFrequency: "monthly",
      status: "active",
      performance: {
        totalReferrals: 0,
        totalSignups: 0,
        totalConversions: 0,
        totalEarningsCents: 0,
      },
    };
    onCreate(partner);
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const isLanding = step === "landing";
  const isReview = step === "review";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[85vh] max-h-[760px] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          {isLanding ? (
            <DialogTitle className="text-h6 font-semibold text-foreground">Add New Partner</DialogTitle>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle asChild>
                <div className="flex items-center gap-1.5 text-body-sm">
                  <button
                    type="button"
                    onClick={() => goToStep("landing")}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Add New Partner
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{STEP_TITLES[step]}</span>
                </div>
              </DialogTitle>
            </div>
          )}
          {!isLanding ? (
            <span className="text-caption text-muted-foreground">
              Step {stepIndex} of {TOTAL_STEPS}
            </span>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
          {isLanding ? (
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
              <div className="flex flex-col gap-2">
                <Label htmlFor="partner-entity-type">Entity Type</Label>
                <Select
                  value={form.entityType}
                  onValueChange={(v) => updateField("entityType", v as EntityType)}
                >
                  <SelectTrigger
                    id="partner-entity-type"
                    className="w-full"
                    aria-invalid={!!errors.entityType}
                  >
                    <SelectValue placeholder="Select Entity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ENTITY_TYPE_LABEL) as [EntityType, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {errors.entityType ? (
                  <p className="text-caption text-destructive">{errors.entityType}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-6">
                <h2 className="text-body-lg text-center font-semibold text-foreground">
                  Follow the steps below to add a new partner
                </h2>
                <div className="flex items-center">
                  {STEP_CARDS.map((card, index) => (
                    <div key={card.id} className="flex flex-1 items-center last:flex-none">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full border text-body-sm font-semibold",
                          index === 0
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {card.step}
                      </div>
                      {index < STEP_CARDS.length - 1 ? <div className="h-px flex-1 bg-border" /> : null}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {STEP_CARDS.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.id}
                        className={cn(
                          "flex flex-col gap-3 rounded-lg border p-3",
                          index === 0 ? "border-primary bg-extended-light-cyan/20" : "border-border",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-9 items-center justify-center rounded-md",
                            index === 0
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-overline text-muted-foreground">STEP {card.step}</span>
                          <span className="text-body-sm font-medium text-foreground">{card.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {step === "basic" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="partner-full-name">Full Name</Label>
                <Input
                  id="partner-full-name"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName ? <p className="text-caption text-destructive">{errors.fullName}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="partner-email">Email Address</Label>
                <Input
                  id="partner-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email ? <p className="text-caption text-destructive">{errors.email}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.phoneCountryCode}
                    onValueChange={(v) => updateField("phoneCountryCode", v)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PHONE_COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                    placeholder="Phone"
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone ? <p className="text-caption text-destructive">{errors.phone}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Country / Region</Label>
                <Select value={form.country} onValueChange={(v) => updateField("country", v)}>
                  <SelectTrigger aria-invalid={!!errors.country}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country ? <p className="text-caption text-destructive">{errors.country}</p> : null}
              </div>
            </div>
          ) : null}

          {step === "entity" ? (
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              <div className="rounded-md border border-border bg-muted px-4 py-2 text-body-sm text-muted-foreground">
                Entity Type:{" "}
                <span className="font-medium text-foreground">
                  {form.entityType ? ENTITY_TYPE_LABEL[form.entityType] : "—"}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label>Audience Type</Label>
                  <Select
                    value={form.audienceType}
                    onValueChange={(v) => updateField("audienceType", v as AudienceType)}
                  >
                    <SelectTrigger aria-invalid={!!errors.audienceType}>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(AUDIENCE_TYPE_LABEL) as [AudienceType, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  {errors.audienceType ? (
                    <p className="text-caption text-destructive">{errors.audienceType}</p>
                  ) : null}
                </div>
                {form.entityType === "company" ? (
                  <>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="partner-company">Company Name</Label>
                      <Input
                        id="partner-company"
                        value={form.companyName}
                        onChange={(e) => updateField("companyName", e.target.value)}
                        aria-invalid={!!errors.companyName}
                      />
                      {errors.companyName ? (
                        <p className="text-caption text-destructive">{errors.companyName}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="partner-website">Website (optional)</Label>
                      <Input
                        id="partner-website"
                        value={form.website}
                        onChange={(e) => updateField("website", e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === "type" ? (
            <div className="flex flex-col gap-3">
              <p className="text-body-sm text-muted-foreground">Select the partner category that best fits this affiliate.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.entries(PARTNER_TYPE_LABEL) as [PartnerType, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField("partnerType", value)}
                    className={cn(
                      "rounded-md border p-4 text-left text-body-sm transition",
                      form.partnerType === value
                        ? "border-primary bg-primary/5 font-medium text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.partnerType ? <p className="text-caption text-destructive">{errors.partnerType}</p> : null}
            </div>
          ) : null}

          {step === "volume" ? (
            <div className="flex max-w-sm flex-col gap-1.5">
              <Label htmlFor="partner-volume">Expected User Volume</Label>
              <Input
                id="partner-volume"
                type="number"
                min={1}
                value={form.expectedUserVolume}
                onChange={(e) => updateField("expectedUserVolume", e.target.value)}
                aria-invalid={!!errors.expectedUserVolume}
              />
              {errors.expectedUserVolume ? (
                <p className="text-caption text-destructive">{errors.expectedUserVolume}</p>
              ) : null}
              <p className="text-caption text-muted-foreground">
                Approximate number of users this partner expects to refer.
              </p>
            </div>
          ) : null}

          {step === "commission" ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Commission Type</Label>
                <Select
                  value={form.commissionType}
                  onValueChange={(v) => updateField("commissionType", v as CommissionType)}
                >
                  <SelectTrigger className="max-w-sm" aria-invalid={!!errors.commissionType}>
                    <SelectValue placeholder="Select commission model" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(COMMISSION_TYPE_LABEL) as [CommissionType, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {errors.commissionType ? (
                  <p className="text-caption text-destructive">{errors.commissionType}</p>
                ) : null}
              </div>
              {form.commissionType === "percentage" ? (
                <div className="flex max-w-xs flex-col gap-1.5">
                  <Label htmlFor="commission-pct">Commission Rate (%)</Label>
                  <Input
                    id="commission-pct"
                    type="number"
                    min={1}
                    max={100}
                    value={form.commissionPercent}
                    onChange={(e) => updateField("commissionPercent", e.target.value)}
                    aria-invalid={!!errors.commissionPercent}
                  />
                  {errors.commissionPercent ? (
                    <p className="text-caption text-destructive">{errors.commissionPercent}</p>
                  ) : null}
                </div>
              ) : null}
              {form.commissionType === "fixed" ? (
                <div className="flex max-w-xs flex-col gap-1.5">
                  <Label htmlFor="commission-fixed">Fixed Amount (USD)</Label>
                  <Input
                    id="commission-fixed"
                    type="number"
                    min={1}
                    step="0.01"
                    value={form.commissionFixedDollars}
                    onChange={(e) => updateField("commissionFixedDollars", e.target.value)}
                    aria-invalid={!!errors.commissionFixedDollars}
                  />
                  {errors.commissionFixedDollars ? (
                    <p className="text-caption text-destructive">{errors.commissionFixedDollars}</p>
                  ) : null}
                </div>
              ) : null}
              {form.commissionType === "tiered" ? (
                <p className="text-body-sm text-muted-foreground">
                  Default tiers will be applied: 0+ → 10%, 50+ → 15%, 100+ → 20%. You can adjust these after
                  onboarding from the partner detail view.
                </p>
              ) : null}
            </div>
          ) : null}

          {isReview ? (
            <div className="flex flex-col gap-4">
              <ReviewSection title="Basic Details">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewRow label="Full Name" value={form.fullName} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow label="Phone" value={`${form.phoneCountryCode} ${form.phone}`} />
                  <ReviewRow label="Country" value={form.country} />
                </div>
              </ReviewSection>
              <ReviewSection title="Entity & Type">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewRow
                    label="Entity Type"
                    value={form.entityType ? ENTITY_TYPE_LABEL[form.entityType] : "—"}
                  />
                  <ReviewRow
                    label="Audience"
                    value={form.audienceType ? AUDIENCE_TYPE_LABEL[form.audienceType] : "—"}
                  />
                  {form.entityType === "company" ? (
                    <>
                      <ReviewRow label="Company" value={form.companyName} />
                      <ReviewRow label="Website" value={form.website || "—"} />
                    </>
                  ) : null}
                  <ReviewRow
                    label="Partner Type"
                    value={form.partnerType ? PARTNER_TYPE_LABEL[form.partnerType] : "—"}
                  />
                  <ReviewRow label="Expected Volume" value={form.expectedUserVolume} />
                </div>
              </ReviewSection>
              <ReviewSection title="Commission">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewRow
                    label="Type"
                    value={form.commissionType ? COMMISSION_TYPE_LABEL[form.commissionType] : "—"}
                  />
                  {form.commissionType === "percentage" ? (
                    <ReviewRow label="Rate" value={`${form.commissionPercent}%`} />
                  ) : null}
                  {form.commissionType === "fixed" ? (
                    <ReviewRow label="Amount" value={`$${form.commissionFixedDollars}`} />
                  ) : null}
                  {form.commissionType === "tiered" ? (
                    <ReviewRow label="Tiers" value="0+ 10% · 50+ 15% · 100+ 20%" />
                  ) : null}
                </div>
              </ReviewSection>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            Close
          </Button>
          <Button onClick={handleNext}>
            {isReview ? "Generate Referral Code & Send Invite" : "Next"}
            {!isReview ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
