"use client";

import { Ban, CheckCircle2, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  discountPercent: string;
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
    discountPercent: partner.discountPercent ? String(partner.discountPercent) : "",
    commissionType: partner.commissionType,
    commissionPercent: String(partner.commissionPercent),
    commissionFixedDollars: String(partner.commissionFixedCents / 100),
  };
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
    if (form.commissionType === "percentage") {
      const pct = Number(form.commissionPercent);
      if (Number.isNaN(pct) || pct <= 0 || pct > 100) next.commissionPercent = "Enter a percentage between 1 and 100.";
    }
    if (form.commissionType === "fixed") {
      const dollars = Number(form.commissionFixedDollars);
      if (Number.isNaN(dollars) || dollars <= 0) next.commissionFixedDollars = "Enter a fixed amount greater than zero.";
    }
    if (form.discountPercent.trim()) {
      const discount = Number(form.discountPercent);
      if (Number.isNaN(discount) || discount < 0 || discount > 100)
        next.discountPercent = "Enter a discount between 0 and 100.";
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
      expectedUserVolume: partner.expectedUserVolume,
      discountPercent: form.discountPercent.trim() ? Number(form.discountPercent) : 0,
      commissionType: form.commissionType,
      commissionPercent: Number(form.commissionPercent) || partner.commissionPercent,
      commissionFixedCents: Math.round((Number(form.commissionFixedDollars) || 0) * 100),
    });
    setIsEditing(false);
    toast.success("Partner updated successfully.");
  }

  return (
    <Sheet open={!!partner} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex w-1/2 max-w-[50vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[50vw]"
      >
        <SheetHeader className="flex min-h-14 shrink-0 flex-row flex-wrap items-center justify-end gap-2 space-y-0 border-b border-border py-4 pl-6 pr-4">
          <SheetTitle className="sr-only">{partner.fullName}</SheetTitle>
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
          <Button
            size="sm"
            variant="outline"
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
          <SheetClose asChild>
            <Button size="sm" variant="ghost" className="size-8 shrink-0 p-0!" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col gap-0">
          <TabsList variant="underline" className="shrink-0 px-6">
            <TabsTrigger variant="underline" value="details">
              Details
            </TabsTrigger>
            <TabsTrigger variant="underline" value="performance">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-8 flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-h4 text-foreground">{partner.fullName}</p>
                <PartnerStatusPill status={partner.status} />
              </div>
              <p className="truncate text-caption text-muted-foreground">{partner.email}</p>
            </div>
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label>Full Name</Label>
                    <Input
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Jane Doe"
                      aria-invalid={!!errors.fullName}
                    />
                    {errors.fullName ? <p className="text-caption text-destructive">{errors.fullName}</p> : null}
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label>Email Address</Label>
                    <Input
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@company.com"
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
                        placeholder="5551234567"
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
                          placeholder="Acme Partners"
                          aria-invalid={!!errors.companyName}
                        />
                        {errors.companyName ? (
                          <p className="text-caption text-destructive">{errors.companyName}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label>Website</Label>
                        <Input
                          value={form.website}
                          onChange={(e) => updateField("website", e.target.value)}
                          placeholder="https://"
                        />
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
                    <Label>Discount (Optional)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={form.discountPercent}
                        onChange={(e) => updateField("discountPercent", e.target.value)}
                        placeholder="10"
                        className="pr-8"
                        aria-invalid={!!errors.discountPercent}
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-caption text-muted-foreground">
                        %
                      </span>
                    </div>
                    {errors.discountPercent ? (
                      <p className="text-caption text-destructive">{errors.discountPercent}</p>
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
                        placeholder="15"
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
                        placeholder="50"
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
              <div className="flex flex-col gap-8">
                <DetailSection title="Basic Details">
                  <DetailGrid>
                    <DetailField label="Full Name" value={partner.fullName} />
                    <DetailField label="Email Address" value={partner.email} />
                    <DetailField
                      label="Phone Number"
                      value={`${partner.phoneCountryCode} ${partner.phone}`}
                    />
                    <DetailField label="Country / Region" value={partner.country} />
                  </DetailGrid>
                </DetailSection>
                <Separator />
                <DetailSection title="Entity Details">
                  <DetailGrid>
                    <DetailField label="Entity Type" value={ENTITY_TYPE_LABEL[partner.entityType]} />
                    <DetailField label="Audience Type" value={AUDIENCE_TYPE_LABEL[partner.audienceType]} />
                    {partner.entityType === "company" ? (
                      <>
                        <DetailField label="Company Name" value={partner.companyName} />
                        <DetailField label="Website" value={partner.website} />
                      </>
                    ) : null}
                  </DetailGrid>
                </DetailSection>
                <Separator />
                <DetailSection title="Partner Configuration">
                  <DetailGrid>
                    <DetailField label="Partner Type" value={PARTNER_TYPE_LABEL[partner.partnerType]} />
                    <DetailField
                      label="Referral Code"
                      value={<span className="font-mono">{partner.referralCode}</span>}
                    />
                    <DetailField
                      label="Applied Discount"
                      value={partner.discountPercent ? `${partner.discountPercent}%` : "None"}
                      muted={!partner.discountPercent}
                    />
                  </DetailGrid>
                </DetailSection>
                <Separator />
                <DetailSection title="Commission Configuration">
                  <DetailGrid>
                    <DetailField
                      label="Commission Type"
                      value={COMMISSION_TYPE_LABEL[partner.commissionType]}
                    />
                    <DetailField label="Settings" value={formatCommissionSummary(partner)} />
                    <DetailField
                      label="Payout Frequency"
                      value={PAYOUT_FREQUENCY_LABEL[partner.payoutFrequency]}
                    />
                    <DetailField label="Payment Method" value="Stripe" />
                  </DetailGrid>
                </DetailSection>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-4">
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
