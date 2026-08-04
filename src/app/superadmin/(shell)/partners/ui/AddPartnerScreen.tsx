"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { usePartners } from "@/lib/usePartners";

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
  discountPercent: string;
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
    discountPercent: "",
    commissionType: "",
    commissionPercent: "15",
    commissionFixedDollars: "25",
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FieldErrors = Record<string, string>;

export function AddPartnerScreen() {
  const router = useRouter();
  const { addPartner, existingEmails, existingReferralCodes } = usePartners();
  const [form, setForm] = useState<FormState>(createInitialFormState);
  const [errors, setErrors] = useState<FieldErrors>({});

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateAll(): FieldErrors {
    const next: FieldErrors = {};

    if (!form.fullName.trim()) next.fullName = "Full Name is required.";
    if (!form.email.trim()) next.email = "Email Address is required.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Please enter a valid email address.";
    else if (existingEmails.includes(form.email.trim().toLowerCase()))
      next.email = "Email address already exists.";
    if (!form.phone.trim()) next.phone = "Please enter a valid phone number.";
    else if (!/^\d{6,12}$/.test(form.phone.trim())) next.phone = "Please enter a valid phone number.";
    if (!form.country) next.country = "Country / Region is required.";

    if (!form.entityType) next.entityType = "Entity Type is required.";
    if (form.entityType === "company" && !form.companyName.trim())
      next.companyName = "Company Name is required.";
    if (!form.audienceType) next.audienceType = "Audience Type is required.";

    if (!form.partnerType) next.partnerType = "Partner Category is required.";

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
    if (form.discountPercent.trim()) {
      const discount = Number(form.discountPercent);
      if (Number.isNaN(discount) || discount < 0 || discount > 100)
        next.discountPercent = "Enter a discount between 0 and 100.";
    }

    return next;
  }

  function handleSubmit() {
    const nextErrors = validateAll();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

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
      expectedUserVolume: 0,
      discountPercent: form.discountPercent.trim() ? Number(form.discountPercent) : 0,
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

    addPartner(partner);
    toast.success(
      `"${partner.fullName}" was onboarded. Referral code ${partner.referralCode} generated and invitation sent.`,
    );
    router.push("/superadmin/partners");
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader sticky bleed>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageBreadcrumb
            parentHref="/superadmin/partners"
            parentLabel="Partners"
            title="Add New Partner"
          />
          <div className="flex shrink-0 flex-wrap items-center gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/superadmin/partners">Cancel</Link>
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Generate Referral Code &amp; Send Invite
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="partner-full-name">Full Name</Label>
              <Input
                id="partner-full-name"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName ? (
                <p className="text-caption text-destructive">{errors.fullName}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
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
              <Label>Country / Region</Label>
              <Select value={form.country} onValueChange={(v) => updateField("country", v)}>
                <SelectTrigger className="w-full" aria-invalid={!!errors.country}>
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
              {errors.country ? (
                <p className="text-caption text-destructive">{errors.country}</p>
              ) : null}
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
              <Label>Partner Category</Label>
              <Select
                value={form.partnerType}
                onValueChange={(v) => updateField("partnerType", v as PartnerType)}
              >
                <SelectTrigger className="w-full" aria-invalid={!!errors.partnerType}>
                  <SelectValue placeholder="Select partner category" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PARTNER_TYPE_LABEL) as [PartnerType, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {errors.partnerType ? (
                <p className="text-caption text-destructive">{errors.partnerType}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Entity Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
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
            <div className="flex flex-col gap-1.5">
              <Label>Audience Type</Label>
              <Select
                value={form.audienceType}
                onValueChange={(v) => updateField("audienceType", v as AudienceType)}
              >
                <SelectTrigger className="w-full" aria-invalid={!!errors.audienceType}>
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
                <div className="flex flex-col gap-1.5">
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
                <div className="flex flex-col gap-1.5">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Commission Structure</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
                Default tiers will be applied: 0+ → 10%, 50+ → 15%, 100+ → 20%. You can adjust these
                after onboarding from the partner detail view.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Discount Configuration</CardTitle>
          </CardHeader>
          <CardContent className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="partner-discount">Discount (Optional)</Label>
            <div className="relative">
              <Input
                id="partner-discount"
                type="number"
                min={0}
                max={100}
                value={form.discountPercent}
                onChange={(e) => updateField("discountPercent", e.target.value)}
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
            <p className="text-caption text-muted-foreground">
              Optional referral discount for candidates who sign up with this partner&apos;s code.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
