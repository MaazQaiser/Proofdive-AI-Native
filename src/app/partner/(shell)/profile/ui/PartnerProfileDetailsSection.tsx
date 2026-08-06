"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PARTNER_DEMO } from "@/lib/partnerDemo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  AUDIENCE_TYPE_LABEL,
  COMMISSION_TYPE_LABEL,
  ENTITY_TYPE_LABEL,
  PARTNER_TYPE_LABEL,
  PAYOUT_FREQUENCY_LABEL,
  formatCommissionSummary,
  type Partner,
} from "@/lib/superAdminPartners";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePartners } from "@/lib/usePartners";

type EditableFields = Pick<Partner, "fullName" | "phoneCountryCode" | "phone">;

export function PartnerProfileDetailsSection() {
  const { partners } = usePartners();
  const livePartner = partners.find((p) => p.id === PARTNER_DEMO.id) ?? PARTNER_DEMO;
  const [overrides, setOverrides] = useLocalStorageState<Partial<Partner>>(
    StorageKeys.partnerProfileOverrides,
    {},
  );
  const partner: Partner = { ...livePartner, ...overrides };

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditableFields>({
    fullName: partner.fullName,
    phoneCountryCode: partner.phoneCountryCode,
    phone: partner.phone,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function startEditing() {
    setForm({
      fullName: partner.fullName,
      phoneCountryCode: partner.phoneCountryCode,
      phone: partner.phone,
    });
    setErrors({});
    setIsEditing(true);
  }

  function handleSave() {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full Name is required.";
    const countryCode = form.phoneCountryCode.trim();
    const phone = form.phone.trim();
    if (!/^\+\d{1,4}$/.test(countryCode)) {
      nextErrors.phone = "Phone number country code is invalid.";
    } else if (!/^\d{6,12}$/.test(phone)) {
      nextErrors.phone = "Please enter a valid phone number.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setOverrides((prev) => ({
      ...prev,
      fullName: form.fullName.trim(),
      phoneCountryCode: countryCode,
      phone,
    }));
    setIsEditing(false);
    toast.success("Profile updated successfully.");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Account Info</CardTitle>
            <CardDescription>
              Personal details you can edit, plus onboarding configuration set by Super Admin.
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button size="sm" variant="outline" onClick={startEditing}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {isEditing ? (
          <div className="flex max-w-md flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Jane Doe"
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName ? <p className="text-caption text-destructive">{errors.fullName}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  className="w-24"
                  value={form.phoneCountryCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, phoneCountryCode: e.target.value }))}
                  placeholder="+1"
                />
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "") }))
                  }
                  placeholder="5551234567"
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone ? <p className="text-caption text-destructive">{errors.phone}</p> : null}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <>
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
                <DetailField label="Partner Type" value={PARTNER_TYPE_LABEL[partner.partnerType]} />
              </DetailGrid>
            </DetailSection>
            <Separator />
            <DetailSection title="Commission">
              <DetailGrid>
                <DetailField
                  label="Commission Structure"
                  value={COMMISSION_TYPE_LABEL[partner.commissionType]}
                />
                <DetailField label="Commission Settings" value={formatCommissionSummary(partner)} />
                <DetailField
                  label="Payout Frequency"
                  value={PAYOUT_FREQUENCY_LABEL[partner.payoutFrequency]}
                />
                <DetailField label="Payment Method" value="Stripe" />
                <DetailField
                  label="Referral Code"
                  value={<span className="font-mono">{partner.referralCode}</span>}
                />
              </DetailGrid>
            </DetailSection>
          </>
        )}
      </CardContent>
    </Card>
  );
}
