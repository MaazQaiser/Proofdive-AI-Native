"use client";

import { Pencil, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ORG_ADMIN_DEMO_ORG } from "@/lib/orgAdminDemo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { ORGANIZATION_TYPE_LABEL, type Organization } from "@/lib/superAdminOrganizations";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

type FormState = Pick<
  Organization,
  "name" | "contactName" | "contactCountryCode" | "contactPhone" | "contactDesignation" | "logoFileName"
>;

function buildForm(org: Organization): FormState {
  return {
    name: org.name,
    contactName: org.contactName,
    contactCountryCode: org.contactCountryCode,
    contactPhone: org.contactPhone,
    contactDesignation: org.contactDesignation,
    logoFileName: org.logoFileName,
  };
}

export function ProfileDetailsSection() {
  const [overrides, setOverrides] = useLocalStorageState<Partial<Organization>>(
    StorageKeys.orgAdminProfileOverrides,
    {},
  );
  const org: Organization = { ...ORG_ADMIN_DEMO_ORG, ...overrides };

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => buildForm(org));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function startEditing() {
    setForm(buildForm(org));
    setErrors({});
    setIsEditing(true);
  }

  function handleSave() {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Organization Name is required.";
    if (!form.contactName.trim()) nextErrors.contactName = "Primary Contact Name is required.";
    if (!form.contactDesignation.trim()) nextErrors.contactDesignation = "Designation is required.";

    const countryCode = form.contactCountryCode.trim();
    const phone = form.contactPhone.trim();
    if (!/^\+\d{1,4}$/.test(countryCode)) {
      nextErrors.contactPhone = "Phone number country code is invalid.";
    } else if (!/^\d{6,12}$/.test(phone)) {
      nextErrors.contactPhone = "Please enter a valid phone number.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setOverrides((prev) => ({
      ...prev,
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      contactCountryCode: countryCode,
      contactPhone: phone,
      contactDesignation: form.contactDesignation.trim(),
      logoFileName: form.logoFileName,
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
            <CardDescription>Onboarding information configured by the Super Admin.</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <DetailSection title="Organization Details">
          <DetailGrid className="sm:grid-cols-2">
            {isEditing ? (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="profile-org-name">Organization Name</Label>
                <Input
                  id="profile-org-name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Acme University"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-caption text-destructive">{errors.name}</p>}
              </div>
            ) : (
              <DetailField label="Organization Name" value={org.name} />
            )}
            <DetailField label="Organization Type" value={ORGANIZATION_TYPE_LABEL[org.type]} />
            <DetailField label="Industry" value={org.industry} />
            <DetailField label="Country" value={org.country} />
            <DetailField label="City" value={org.city} />
            <DetailField label="Region" value={org.region} />
          </DetailGrid>
        </DetailSection>

        <Separator />

        <DetailSection title="Point of Contact">
          {!isEditing ? (
            <div className="flex flex-col gap-1">
              <p className="text-body-sm font-medium text-text-primary">{org.contactName}</p>
              <p className="text-caption text-muted-foreground">{org.contactDesignation}</p>
            </div>
          ) : null}
          <DetailGrid className="sm:grid-cols-2">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-contact-name">Primary Contact Name</Label>
                <Input
                  id="profile-contact-name"
                  value={form.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  placeholder="Jane Doe"
                  aria-invalid={!!errors.contactName}
                />
                {errors.contactName && <p className="text-caption text-destructive">{errors.contactName}</p>}
              </div>
            ) : null}
            <DetailField label="Email" value={org.contactEmail} />
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-contact-phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.contactCountryCode}
                    onChange={(e) => updateField("contactCountryCode", e.target.value)}
                    className="w-16 shrink-0"
                    placeholder="+1"
                    aria-label="Country code"
                    aria-invalid={!!errors.contactPhone}
                  />
                  <Input
                    id="profile-contact-phone"
                    value={form.contactPhone}
                    onChange={(e) => updateField("contactPhone", e.target.value)}
                    placeholder="5551234567"
                    aria-invalid={!!errors.contactPhone}
                    className="flex-1"
                  />
                </div>
                {errors.contactPhone && <p className="text-caption text-destructive">{errors.contactPhone}</p>}
              </div>
            ) : (
              <DetailField label="Phone" value={`${org.contactCountryCode} ${org.contactPhone}`} />
            )}
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-designation">Designation</Label>
                <Input
                  id="profile-designation"
                  value={form.contactDesignation}
                  onChange={(e) => updateField("contactDesignation", e.target.value)}
                  placeholder="Head of Talent"
                  aria-invalid={!!errors.contactDesignation}
                />
                {errors.contactDesignation && (
                  <p className="text-caption text-destructive">{errors.contactDesignation}</p>
                )}
              </div>
            ) : null}
          </DetailGrid>
        </DetailSection>

        <Separator />

        <DetailSection title="Branding">
          {isEditing ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="profile-logo" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </label>
              </Button>
              <input
                id="profile-logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !file.type.startsWith("image/")) {
                    setErrors((prev) => ({ ...prev, logo: "Invalid file format." }));
                    return;
                  }
                  setErrors((prev) => {
                    if (!prev.logo) return prev;
                    const next = { ...prev };
                    delete next.logo;
                    return next;
                  });
                  updateField("logoFileName", file?.name ?? "");
                }}
              />
              {form.logoFileName && (
                <span className="text-caption truncate text-muted-foreground">{form.logoFileName}</span>
              )}
            </div>
          ) : (
            <DetailGrid>
              <DetailField
                label="Logo"
                value={org.logoFileName || "Not uploaded"}
                muted={!org.logoFileName}
              />
            </DetailGrid>
          )}
          {errors.logo && <p className="mt-1 text-caption text-destructive">{errors.logo}</p>}
        </DetailSection>

        <Separator />

        <DetailSection title="Account">
          <div className="flex items-end justify-between gap-3">
            <DetailField label="Password" value="••••••••" />
            <Button variant="outline" size="sm" asChild>
              <Link href="/orgadmin/profile/password">Change Password</Link>
            </Button>
          </div>
        </DetailSection>
      </CardContent>
    </Card>
  );
}
