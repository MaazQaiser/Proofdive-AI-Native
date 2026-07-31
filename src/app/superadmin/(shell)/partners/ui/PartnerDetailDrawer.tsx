"use client";

import { Ban, CheckCircle2, Pencil } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCents } from "@/lib/partnerMockData";
import { COUNTRY_OPTIONS, PHONE_COUNTRY_CODES } from "@/lib/superAdminOrganizationWizard";
import {
  AUDIENCE_TYPE_LABEL,
  COMMISSION_TYPE_LABEL,
  ENTITY_TYPE_LABEL,
  PARTNER_TYPE_LABEL,
  PAYOUT_FREQUENCY_LABEL,
  formatCommissionSummary,
  type AudienceType,
  type CommissionType,
  type EntityType,
  type Partner,
  type PartnerType,
} from "@/lib/superAdminPartners";
import { cn } from "@/lib/utils";

import { PartnerStatusPill } from "./PartnerStatusPills";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FieldErrors = Record<string, string>;

type EditFormState = {
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  country: string;
  entityType: EntityType;
  companyName: string;
  website: string;
  audienceType: AudienceType;
  partnerType: PartnerType;
  expectedUserVolume: string;
  commissionType: CommissionType;
  commissionPercent: string;
  commissionFixedDollars: string;
};

function buildForm(partner: Partner): EditFormState {
  return {
    fullName: partner.fullName,
    email: partner.email,
    phoneCountryCode: partner.phoneCountryCode,
    phone: partner.phone,
    country: partner.country,
    entityType: partner.entityType,
    companyName: partner.companyName,
    website: partner.website,
    audienceType: partner.audienceType,
    partnerType: partner.partnerType,
    expectedUserVolume: String(partner.expectedUserVolume),
    commissionType: partner.commissionType,
    commissionPercent: String(partner.commissionPercent),
    commissionFixedDollars: String(partner.commissionFixedCents / 100),
  };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-body-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border p-4">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-h6 font-semibold text-foreground">{value}</span>
    </div>
  );
}

type PartnerDetailDrawerProps = {
  partner: Partner | null;
  onOpenChange: (open: boolean) => void;
  existingEmails: string[];
  onUpdate: (id: string, patch: Partial<Partner>) => void;
  onRequestStatusChange: (partner: Partner) => void;
};

export function PartnerDetailDrawer({
  partner,
  onOpenChange,
  existingEmails,
  onUpdate,
  onRequestStatusChange,
}: PartnerDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!partner) return;
    setIsEditing(false);
    setForm(buildForm(partner));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner?.id]);

  if (!partner || !form) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  function updateField<K extends keyof EditFormState>(key: K, value: EditFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSave() {
    if (!form || !partner) return;
    const next: FieldErrors = {};
    if (!form.fullName.trim()) next.fullName = "Full Name is required.";
    if (!form.email.trim()) next.email = "Email Address is required.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Please enter a valid email address.";
    else if (
      existingEmails.includes(form.email.trim().toLowerCase()) &&
      form.email.trim().toLowerCase() !== partner.email.toLowerCase()
    ) {
      next.email = "Email address already exists.";
    }
    if (!form.phone.trim() || !/^\d{6,12}$/.test(form.phone.trim()))
      next.phone = "Please enter a valid phone number.";
    if (!form.country) next.country = "Country / Region is required.";
    if (form.entityType === "company" && !form.companyName.trim())
      next.companyName = "Company Name is required.";
    const volume = Number(form.expectedUserVolume);
    if (Number.isNaN(volume) || volume < 1) next.expectedUserVolume = "Enter a valid expected user volume.";
    if (form.commissionType === "percentage") {
      const pct = Number(form.commissionPercent);
      if (Number.isNaN(pct) || pct <= 0 || pct > 100) next.commissionPercent = "Enter a percentage between 1 and 100.";
    }
    if (form.commissionType === "fixed") {
      const dollars = Number(form.commissionFixedDollars);
      if (Number.isNaN(dollars) || dollars <= 0) next.commissionFixedDollars = "Enter a fixed amount greater than zero.";
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    onUpdate(partner.id, {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phoneCountryCode: form.phoneCountryCode,
      phone: form.phone.trim(),
      country: form.country,
      entityType: form.entityType,
      companyName: form.entityType === "company" ? form.companyName.trim() : "",
      website: form.website.trim(),
      audienceType: form.audienceType,
      partnerType: form.partnerType,
      expectedUserVolume: volume,
      commissionType: form.commissionType,
      commissionPercent: Number(form.commissionPercent) || partner.commissionPercent,
      commissionFixedCents: Math.round((Number(form.commissionFixedDollars) || 0) * 100),
    });
    setIsEditing(false);
    toast.success("Partner updated successfully.");
  }

  return (
    <Sheet open={!!partner} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-3 border-b border-border pb-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex min-w-0 flex-col gap-1">
              <SheetTitle className="truncate text-h6">{partner.fullName}</SheetTitle>
              <p className="truncate text-caption text-muted-foreground">{partner.email}</p>
            </div>
            <PartnerStatusPill status={partner.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-extended-light-cyan text-extended-green-blue hover:bg-extended-light-cyan/80"
              onClick={() => {
                setForm(buildForm(partner));
                setErrors({});
                setIsEditing(true);
              }}
              disabled={isEditing}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Partner
            </Button>
            <Button
              size="sm"
              variant={partner.status === "active" ? "destructive" : "default"}
              onClick={() => onRequestStatusChange(partner)}
            >
              {partner.status === "active" ? (
                <>
                  <Ban className="h-3.5 w-3.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-0 mt-4 w-full shrink-0 justify-start rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Details
            </TabsTrigger>
            <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0 min-h-0 flex-1 overflow-y-auto py-4">
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label>Full Name</Label>
                    <Input
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      aria-invalid={!!errors.fullName}
                    />
                    {errors.fullName ? <p className="text-caption text-destructive">{errors.fullName}</p> : null}
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label>Email Address</Label>
                    <Input
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email ? <p className="text-caption text-destructive">{errors.email}</p> : null}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Phone</Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.phoneCountryCode}
                        onValueChange={(v) => updateField("phoneCountryCode", v)}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PHONE_COUNTRY_CODES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                        aria-invalid={!!errors.phone}
                      />
                    </div>
                    {errors.phone ? <p className="text-caption text-destructive">{errors.phone}</p> : null}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Country</Label>
                    <Select value={form.country} onValueChange={(v) => updateField("country", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Entity Type</Label>
                    <Select
                      value={form.entityType}
                      onValueChange={(v) => updateField("entityType", v as EntityType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(ENTITY_TYPE_LABEL) as [EntityType, string][]).map(([v, l]) => (
                          <SelectItem key={v} value={v}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Audience Type</Label>
                    <Select
                      value={form.audienceType}
                      onValueChange={(v) => updateField("audienceType", v as AudienceType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(AUDIENCE_TYPE_LABEL) as [AudienceType, string][]).map(([v, l]) => (
                          <SelectItem key={v} value={v}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.entityType === "company" ? (
                    <>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label>Company Name</Label>
                        <Input
                          value={form.companyName}
                          onChange={(e) => updateField("companyName", e.target.value)}
                          aria-invalid={!!errors.companyName}
                        />
                        {errors.companyName ? (
                          <p className="text-caption text-destructive">{errors.companyName}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label>Website</Label>
                        <Input value={form.website} onChange={(e) => updateField("website", e.target.value)} />
                      </div>
                    </>
                  ) : null}
                  <div className="flex flex-col gap-1.5">
                    <Label>Partner Type</Label>
                    <Select
                      value={form.partnerType}
                      onValueChange={(v) => updateField("partnerType", v as PartnerType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(PARTNER_TYPE_LABEL) as [PartnerType, string][]).map(([v, l]) => (
                          <SelectItem key={v} value={v}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Expected User Volume</Label>
                    <Input
                      type="number"
                      value={form.expectedUserVolume}
                      onChange={(e) => updateField("expectedUserVolume", e.target.value)}
                      aria-invalid={!!errors.expectedUserVolume}
                    />
                    {errors.expectedUserVolume ? (
                      <p className="text-caption text-destructive">{errors.expectedUserVolume}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label>Commission Type</Label>
                    <Select
                      value={form.commissionType}
                      onValueChange={(v) => updateField("commissionType", v as CommissionType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(COMMISSION_TYPE_LABEL) as [CommissionType, string][]).map(
                          ([v, l]) => (
                            <SelectItem key={v} value={v}>
                              {l}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.commissionType === "percentage" ? (
                    <div className="flex flex-col gap-1.5">
                      <Label>Rate (%)</Label>
                      <Input
                        type="number"
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
                    <div className="flex flex-col gap-1.5">
                      <Label>Fixed Amount (USD)</Label>
                      <Input
                        type="number"
                        value={form.commissionFixedDollars}
                        onChange={(e) => updateField("commissionFixedDollars", e.target.value)}
                        aria-invalid={!!errors.commissionFixedDollars}
                      />
                      {errors.commissionFixedDollars ? (
                        <p className="text-caption text-destructive">{errors.commissionFixedDollars}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setForm(buildForm(partner));
                      setErrors({});
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <section className="flex flex-col gap-3">
                  <h3 className="text-overline text-muted-foreground">Basic Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow label="Full Name" value={partner.fullName} />
                    <DetailRow label="Email Address" value={partner.email} />
                    <DetailRow
                      label="Phone Number"
                      value={`${partner.phoneCountryCode} ${partner.phone}`}
                    />
                    <DetailRow label="Country / Region" value={partner.country} />
                  </div>
                </section>
                <Separator />
                <section className="flex flex-col gap-3">
                  <h3 className="text-overline text-muted-foreground">Entity Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow label="Entity Type" value={ENTITY_TYPE_LABEL[partner.entityType]} />
                    <DetailRow label="Audience Type" value={AUDIENCE_TYPE_LABEL[partner.audienceType]} />
                    {partner.entityType === "company" ? (
                      <>
                        <DetailRow label="Company Name" value={partner.companyName} />
                        <DetailRow label="Website" value={partner.website || "—"} />
                      </>
                    ) : null}
                  </div>
                </section>
                <Separator />
                <section className="flex flex-col gap-3">
                  <h3 className="text-overline text-muted-foreground">Partner Configuration</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow label="Partner Type" value={PARTNER_TYPE_LABEL[partner.partnerType]} />
                    <DetailRow label="Expected User Volume" value={partner.expectedUserVolume} />
                    <DetailRow
                      label="Referral Code"
                      value={<span className="font-mono">{partner.referralCode}</span>}
                    />
                  </div>
                </section>
                <Separator />
                <section className="flex flex-col gap-3">
                  <h3 className="text-overline text-muted-foreground">Commission Configuration</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow
                      label="Commission Type"
                      value={COMMISSION_TYPE_LABEL[partner.commissionType]}
                    />
                    <DetailRow label="Settings" value={formatCommissionSummary(partner)} />
                    <DetailRow
                      label="Payout Frequency"
                      value={PAYOUT_FREQUENCY_LABEL[partner.payoutFrequency]}
                    />
                    <DetailRow label="Payment Method" value="Stripe" />
                  </div>
                </section>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-0 min-h-0 flex-1 overflow-y-auto py-4">
            <div className={cn("grid gap-3 sm:grid-cols-2")}>
              <StatTile label="Total Referrals" value={String(partner.performance.totalReferrals)} />
              <StatTile label="Total Signups" value={String(partner.performance.totalSignups)} />
              <StatTile label="Total Conversions" value={String(partner.performance.totalConversions)} />
              <StatTile
                label="Total Earnings"
                value={formatCents(partner.performance.totalEarningsCents)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
