"use client";

import {
  FileSpreadsheet,
  ImageIcon,
  Info,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuccessDriverCompetencyPill } from "@/components/ui/success-driver-card";
import { SUCCESS_DRIVER_ORDER, SUCCESS_DRIVERS } from "@/lib/successDrivers";
import {
  AVAILABLE_COURSES,
  COMPETENCY_FRAMEWORKS,
  COUNTRY_OPTIONS,
  INDUSTRY_OPTIONS,
  PHONE_COUNTRY_CODES,
  PRICING_PLANS,
  type CompetencyFramework,
} from "@/lib/superAdminOrganizationWizard";
import {
  ORGANIZATION_TYPE_LABEL,
  type Organization,
  type OrganizationType,
} from "@/lib/superAdminOrganizations";
import { DEFAULT_FRAMEWORK_ID } from "@/lib/superAdminCompetencyFrameworks";
import { useCompetencyFrameworks } from "@/lib/useCompetencyFrameworks";
import { useOrganizations } from "@/lib/useOrganizations";

type FormState = {
  orgType: OrganizationType | "";
  name: string;
  industry: string;
  country: string;
  city: string;
  region: string;
  logoFileName: string;
  domain: string;
  contactName: string;
  contactEmail: string;
  contactCountryCode: string;
  contactPhone: string;
  contactDesignation: string;
  competencyFrameworkId: string;
  selectedCourseIds: string[];
  pricingPlanId: string;
  discountPercent: string;
  numberOfUsers: string;
  startDate: string;
  expiryDate: string;
  csvFileName: string;
  userEmails: string[];
};

function createInitialFormState(): FormState {
  return {
    orgType: "",
    name: "",
    industry: "",
    country: "",
    city: "",
    region: "",
    logoFileName: "",
    domain: "",
    contactName: "",
    contactEmail: "",
    contactCountryCode: PHONE_COUNTRY_CODES[0].code,
    contactPhone: "",
    contactDesignation: "",
    competencyFrameworkId: COMPETENCY_FRAMEWORKS[0].id,
    selectedCourseIds: AVAILABLE_COURSES.filter((c) => c.selectedByDefault).map((c) => c.id),
    pricingPlanId: "",
    discountPercent: "",
    numberOfUsers: "",
    startDate: "",
    expiryDate: "",
    csvFileName: "",
    userEmails: [],
  };
}

function formFromOrganization(org: Organization): FormState {
  const plan = PRICING_PLANS.find((p) => p.name === org.subscriptionPlan);
  return {
    orgType: org.type,
    name: org.name,
    industry: org.industry,
    country: org.country,
    city: org.city,
    region: org.region,
    logoFileName: org.logoFileName,
    domain: org.domain,
    contactName: org.contactName,
    contactEmail: org.contactEmail,
    contactCountryCode: org.contactCountryCode,
    contactPhone: org.contactPhone,
    contactDesignation: org.contactDesignation,
    competencyFrameworkId: org.competencyFrameworkId,
    selectedCourseIds: [...org.courseIds],
    pricingPlanId: plan?.id ?? "",
    discountPercent: org.discountPercent ? String(org.discountPercent) : "",
    numberOfUsers: String(org.numberOfUsers),
    startDate: org.subscriptionStartDate,
    expiryDate: org.subscriptionExpiryDate,
    csvFileName: "",
    userEmails: [],
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FieldErrors = Record<string, string>;

const SECTION_ID_MAP: Record<string, string> = {
  details: "section-details",
  competencies: "section-competencies",
  courses: "section-courses",
  payment: "section-payment",
};

type AddOrganizationScreenProps = {
  mode?: "create" | "edit";
  organizationId?: string;
  section?: string;
};

export function AddOrganizationScreen({
  mode = "create",
  organizationId,
  section,
}: AddOrganizationScreenProps) {
  const router = useRouter();
  const { organizations, updateOrganization, existingNames, addOrganization, hydrated } =
    useOrganizations();
  const { summaries, createClone } = useCompetencyFrameworks();
  const isEdit = mode === "edit";

  const frameworks: CompetencyFramework[] =
    summaries.length > 0
      ? summaries.map((f) => ({ id: f.id, name: f.name, isDefault: f.isDefault }))
      : COMPETENCY_FRAMEWORKS;

  const existingOrganization = useMemo(
    () => (organizationId ? organizations.find((o) => o.id === organizationId) : undefined),
    [organizations, organizationId],
  );

  const [form, setForm] = useState<FormState>(createInitialFormState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [hydratedForm, setHydratedForm] = useState(!isEdit);
  const [isCreatingCompetency, setIsCreatingCompetency] = useState(false);
  const [newCompetencyName, setNewCompetencyName] = useState("");
  const [competencyNameError, setCompetencyNameError] = useState("");
  const [csvError, setCsvError] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !hydrated) return;
    if (!existingOrganization) {
      setHydratedForm(true);
      return;
    }
    setForm(formFromOrganization(existingOrganization));
    setErrors({});
    setHydratedForm(true);
  }, [isEdit, hydrated, existingOrganization]);

  useEffect(() => {
    if (!section || !hydratedForm) return;
    const sectionId = SECTION_ID_MAP[section] ?? `section-${section}`;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [section, hydratedForm]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  function handleLogoUpload(file: File | undefined) {
    setLogoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    updateField("logoFileName", file?.name ?? "");
  }

  function clearLogo() {
    handleLogoUpload(undefined);
  }

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

    if (!form.orgType) next.orgType = "Please select an organization type.";

    const trimmedName = form.name.trim();
    if (!trimmedName) next.name = "Organization Name is required.";
    else {
      const takenByOther =
        existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase()) &&
        (!existingOrganization || existingOrganization.name.toLowerCase() !== trimmedName.toLowerCase());
      if (takenByOther) next.name = "Organization Name already exists.";
    }
    if (!form.industry) next.industry = "Industry / Domain is required.";
    if (!form.country) next.country = "Country is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.region.trim()) next.region = "Region is required.";

    if (!form.contactName.trim()) next.contactName = "Primary Contact Name is required.";
    if (!form.contactEmail.trim()) next.contactEmail = "Email Address is required.";
    else if (!EMAIL_PATTERN.test(form.contactEmail.trim()))
      next.contactEmail = "Enter a valid email address.";
    if (!form.contactPhone.trim()) next.contactPhone = "Phone Number is required.";
    if (!form.contactDesignation.trim()) next.contactDesignation = "Designation is required.";

    if (!form.pricingPlanId) next.pricingPlanId = "Please select a pricing plan.";
    if (!form.numberOfUsers.trim() || Number(form.numberOfUsers) <= 0)
      next.numberOfUsers = "Number of Users is required.";
    if (!form.startDate) next.startDate = "Subscription Start Date is required.";
    if (!form.expiryDate) next.expiryDate = "Subscription Expiry Date is required.";
    if (form.startDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.startDate))
      next.expiryDate = "Expiry Date must be greater than Start Date.";

    return next;
  }

  function handleDiscard() {
    if (!existingOrganization) return;
    setForm(formFromOrganization(existingOrganization));
    setErrors({});
    setCsvError("");
  }

  function handleSubmit() {
    if (csvError) return;

    const nextErrors = validateAll();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const plan = PRICING_PLANS.find((p) => p.id === form.pricingPlanId);

    if (isEdit && existingOrganization) {
      const patch: Partial<Organization> = {
        name: form.name.trim(),
        type: form.orgType as OrganizationType,
        industry: form.industry,
        country: form.country,
        city: form.city.trim(),
        region: form.region.trim(),
        domain: form.domain.trim(),
        logoFileName: form.logoFileName,
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactCountryCode: form.contactCountryCode,
        contactPhone: form.contactPhone.trim(),
        contactDesignation: form.contactDesignation.trim(),
        competencyFrameworkId: form.competencyFrameworkId,
        courseIds: form.selectedCourseIds,
        subscriptionPlan: plan?.name ?? existingOrganization.subscriptionPlan,
        numberOfUsers: Number(form.numberOfUsers),
        subscriptionStartDate: form.startDate,
        subscriptionExpiryDate: form.expiryDate,
        discountPercent: form.discountPercent.trim() ? Number(form.discountPercent) : 0,
      };
      updateOrganization(existingOrganization.id, patch);
      toast.success("Organization updated successfully.");
      router.push("/superadmin/organizations");
      return;
    }

    const newOrganization: Organization = {
      id: `org_${Date.now()}`,
      name: form.name.trim(),
      type: form.orgType as OrganizationType,
      industry: form.industry,
      country: form.country,
      city: form.city.trim(),
      region: form.region.trim(),
      domain: form.domain.trim(),
      logoFileName: form.logoFileName,
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactCountryCode: form.contactCountryCode,
      contactPhone: form.contactPhone.trim(),
      contactDesignation: form.contactDesignation.trim(),
      competencyFrameworkId: form.competencyFrameworkId,
      courseIds: form.selectedCourseIds,
      subscriptionPlan: plan?.name ?? "Starter",
      subscriptionStatus: "active",
      numberOfUsers: Number(form.numberOfUsers),
      subscriptionStartDate: form.startDate,
      subscriptionExpiryDate: form.expiryDate,
      discountPercent: form.discountPercent.trim() ? Number(form.discountPercent) : 0,
      status: "active",
      totalUsers: form.userEmails.length,
      activeUsers: 0,
      inactiveUsers: form.userEmails.length,
    };
    addOrganization(newOrganization);
    toast.success(
      `"${newOrganization.name}" was created and an invitation was sent to the Organization Admin.`,
    );
    router.push("/superadmin/organizations");
  }

  function handleCsvUpload(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a valid CSV file.");
      updateField("csvFileName", "");
      updateField("userEmails", []);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const emails = text
        .split(/\r?\n/)
        .map((line) => line.split(",")[0]?.trim() ?? "")
        .filter((value) => EMAIL_PATTERN.test(value))
        .map((value) => value.toLowerCase());
      const uniqueEmails = Array.from(new Set(emails));
      if (uniqueEmails.length === 0) {
        setCsvError("Please upload a valid CSV file.");
        updateField("csvFileName", "");
        updateField("userEmails", []);
        return;
      }
      setCsvError("");
      updateField("csvFileName", file.name);
      updateField("userEmails", uniqueEmails);
    };
    reader.readAsText(file);
  }

  function handleRemoveCsv() {
    updateField("csvFileName", "");
    updateField("userEmails", []);
    setCsvError("");
  }

  function toggleCourse(courseId: string) {
    setForm((prev) => ({
      ...prev,
      selectedCourseIds: prev.selectedCourseIds.includes(courseId)
        ? prev.selectedCourseIds.filter((id) => id !== courseId)
        : [...prev.selectedCourseIds, courseId],
    }));
  }

  function startCreatingCompetency() {
    setNewCompetencyName("");
    setCompetencyNameError("");
    setIsCreatingCompetency(true);
  }

  function saveNewCompetency() {
    const trimmedName = newCompetencyName.trim();
    if (!trimmedName) {
      setCompetencyNameError("Competency version name is required.");
      return;
    }
    if (frameworks.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase())) {
      setCompetencyNameError("Competency version name already exists.");
      return;
    }
    const created = createClone(DEFAULT_FRAMEWORK_ID, trimmedName);
    if (!created) {
      setCompetencyNameError("Could not create competency framework clone.");
      return;
    }
    toast.success(`Draft framework "${created.name}" created.`);
    updateField("competencyFrameworkId", created.id);
    setIsCreatingCompetency(false);
  }

  const selectedFramework = frameworks.find((f) => f.id === form.competencyFrameworkId);

  if (isEdit && hydratedForm && !existingOrganization) {
    return (
      <div className="-mx-6 flex h-full min-w-0 flex-col overflow-hidden">
        <PageHeader>
          <PageBreadcrumb
            parentHref="/superadmin/organizations"
            parentLabel="Organizations"
            title="Organization not found"
          />
        </PageHeader>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-8">
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-caption text-muted-foreground">This organization does not exist.</p>
              <Button className="mt-4" asChild>
                <Link href="/superadmin/organizations">Back to listing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isEdit && !hydratedForm) {
    return null;
  }

  return (
    <div className="-mx-6 flex h-full min-w-0 flex-col overflow-hidden">
      <PageHeader>
        <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageBreadcrumb
            className="min-w-0"
            parentHref="/superadmin/organizations"
            parentLabel="Organizations"
            title={
              isEdit
                ? existingOrganization
                  ? `Edit: ${existingOrganization.name}`
                  : "Edit Organization"
                : "Add New Organization"
            }
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-4">
            {isEdit ? (
              <>
                <Button type="button" variant="ghost" onClick={handleDiscard}>
                  Discard Changes
                </Button>
                <Button type="button" onClick={handleSubmit}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" asChild>
                  <Link href="/superadmin/organizations">Cancel</Link>
                </Button>
                <Button type="button" onClick={handleSubmit}>
                  Send Invite
                </Button>
              </>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card id="section-details">
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-type">Organization Type</Label>
              <Select
                value={form.orgType}
                onValueChange={(v) => updateField("orgType", v as OrganizationType)}
              >
                <SelectTrigger id="org-type" className="w-full" aria-invalid={!!errors.orgType}>
                  <SelectValue placeholder="Select Organization Type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ORGANIZATION_TYPE_LABEL) as [OrganizationType, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {errors.orgType ? <p className="text-caption text-destructive">{errors.orgType}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Acme University"
                aria-invalid={!!errors.name}
              />
              {errors.name ? <p className="text-caption text-destructive">{errors.name}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-industry">Industry / Domain</Label>
              <Select value={form.industry} onValueChange={(v) => updateField("industry", v)}>
                <SelectTrigger id="org-industry" className="w-full" aria-invalid={!!errors.industry}>
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry ? (
                <p className="text-caption text-destructive">{errors.industry}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-country">Country</Label>
              <Select value={form.country} onValueChange={(v) => updateField("country", v)}>
                <SelectTrigger id="org-country" className="w-full" aria-invalid={!!errors.country}>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country ? <p className="text-caption text-destructive">{errors.country}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-city">City</Label>
              <Input
                id="org-city"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="San Francisco"
                aria-invalid={!!errors.city}
              />
              {errors.city ? <p className="text-caption text-destructive">{errors.city}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-region">Region</Label>
              <Input
                id="org-region"
                value={form.region}
                onChange={(e) => updateField("region", e.target.value)}
                placeholder="California"
                aria-invalid={!!errors.region}
              />
              {errors.region ? <p className="text-caption text-destructive">{errors.region}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card id="section-personalization">
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Personalization</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="org-logo">Organization Logo</Label>
              <div className="flex gap-4">
                <label
                  htmlFor="org-logo"
                  className="flex min-h-[140px] flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/30 px-6 py-8 text-center transition hover:bg-muted/50"
                >
                  <Upload className="size-8 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-body-sm font-medium text-foreground">
                      {form.logoFileName ? "Replace logo" : "Upload organization logo"}
                    </span>
                    <span className="text-caption text-muted-foreground">PNG, JPG, or SVG up to 5MB</span>
                    {form.logoFileName ? (
                      <span className="truncate text-caption text-muted-foreground">
                        {form.logoFileName}
                      </span>
                    ) : null}
                  </div>
                  <input
                    id="org-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  />
                </label>
                <div className="flex w-40 shrink-0 flex-col gap-2">
                  <span className="text-caption text-muted-foreground">Preview</span>
                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-border bg-background">
                    {logoPreviewUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreviewUrl}
                          alt="Organization logo preview"
                          className="size-full object-contain p-3"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 size-7 bg-background/90"
                          onClick={clearLogo}
                          aria-label="Remove logo"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                        <ImageIcon className="size-6" />
                        <span className="text-caption">No logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="org-domain">Domain Details</Label>
              <Input
                id="org-domain"
                value={form.domain}
                onChange={(e) => updateField("domain", e.target.value)}
                placeholder="e.g. acme.proofdive.com"
                className="sm:max-w-[calc(50%-0.5rem)]"
              />
            </div>
          </CardContent>
        </Card>

        <Card id="section-contact">
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Point of Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-name">Primary Contact Name</Label>
              <Input
                id="contact-name"
                value={form.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                placeholder="Jane Doe"
                aria-invalid={!!errors.contactName}
              />
              {errors.contactName ? (
                <p className="text-caption text-destructive">{errors.contactName}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email">Email Address</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                placeholder="you@company.com"
                aria-invalid={!!errors.contactEmail}
              />
              {errors.contactEmail ? (
                <p className="text-caption text-destructive">{errors.contactEmail}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-phone">Phone Number</Label>
              <div className="flex gap-2">
                <Select
                  value={form.contactCountryCode}
                  onValueChange={(v) => updateField("contactCountryCode", v)}
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
                  id="contact-phone"
                  value={form.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  placeholder="5551234567"
                  aria-invalid={!!errors.contactPhone}
                  className="flex-1"
                />
              </div>
              {errors.contactPhone ? (
                <p className="text-caption text-destructive">{errors.contactPhone}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-designation">Designation</Label>
              <Input
                id="contact-designation"
                value={form.contactDesignation}
                onChange={(e) => updateField("contactDesignation", e.target.value)}
                placeholder="Head of Talent"
                aria-invalid={!!errors.contactDesignation}
              />
              {errors.contactDesignation ? (
                <p className="text-caption text-destructive">{errors.contactDesignation}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card id="section-competencies">
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Competency Configuration</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!isCreatingCompetency ? (
              <>
                <div className="flex max-w-sm flex-col gap-1.5">
                  <Label htmlFor="competency-framework">Competency Framework</Label>
                  <div className="flex gap-2">
                    <Select
                      value={form.competencyFrameworkId}
                      onValueChange={(v) => updateField("competencyFrameworkId", v)}
                    >
                      <SelectTrigger id="competency-framework" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks.map((framework) => (
                          <SelectItem key={framework.id} value={framework.id}>
                            {framework.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={startCreatingCompetency}
                      aria-label="Create new competency version"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {selectedFramework ? (
                  <div className="flex flex-col gap-3 rounded-md border border-border p-4">
                    <span className="text-body-sm font-medium text-foreground">
                      {selectedFramework.name} — Success Drivers
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SUCCESS_DRIVER_ORDER.map((driverId) => (
                        <SuccessDriverCompetencyPill
                          key={driverId}
                          driver={driverId}
                          label={SUCCESS_DRIVERS[driverId].label}
                        />
                      ))}
                    </div>
                    <p className="text-caption text-muted-foreground">
                      Each framework includes 12 competencies (3 per Success Driver). Edit descriptors in
                      Competency Framework Management.
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-body-sm font-semibold text-foreground">Create Competency Version</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingCompetency(false)}>
                    Cancel
                  </Button>
                </div>
                <div className="flex max-w-sm flex-col gap-1.5">
                  <Label htmlFor="new-competency-name">Competency Version Name</Label>
                  <Input
                    id="new-competency-name"
                    value={newCompetencyName}
                    onChange={(e) => {
                      setNewCompetencyName(e.target.value);
                      setCompetencyNameError("");
                    }}
                    placeholder="e.g. Acme Robotics — Technical Track"
                    aria-invalid={!!competencyNameError}
                  />
                  {competencyNameError ? (
                    <p className="text-caption text-destructive">{competencyNameError}</p>
                  ) : null}
                </div>
                <p className="text-caption text-muted-foreground">
                  Creates a draft clone of the default framework. Open Competency Framework Management afterward
                  to edit definitions and level descriptors.
                </p>
                <Button type="button" onClick={saveNewCompetency} className="w-fit">
                  Save Competency Version
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="section-courses">
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Course Selection</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-body-sm text-muted-foreground">
              The following courses are included by default. You can review and adjust the selection below.
            </p>
            {AVAILABLE_COURSES.map((course) => (
              <label
                key={course.id}
                className="flex items-start gap-3 rounded-md border border-border p-4 hover:bg-muted/50"
              >
                <Checkbox
                  checked={form.selectedCourseIds.includes(course.id)}
                  onCheckedChange={() => toggleCourse(course.id)}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-sm font-medium text-foreground">{course.name}</span>
                  <span className="text-caption text-muted-foreground">{course.description}</span>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card id="section-payment">
          <CardHeader>
            <CardTitle className="text-h5 font-medium">Payment Plan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pricing-plan">Pricing Plan Template</Label>
              <Select value={form.pricingPlanId} onValueChange={(v) => updateField("pricingPlanId", v)}>
                <SelectTrigger
                  id="pricing-plan"
                  className="w-full"
                  aria-invalid={!!errors.pricingPlanId}
                >
                  <SelectValue placeholder="Select Pricing Plan" />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pricingPlanId ? (
                <p className="text-caption text-destructive">{errors.pricingPlanId}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discount">Discount (Optional)</Label>
              <div className="relative">
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) => updateField("discountPercent", e.target.value)}
                  placeholder="10"
                  className="pr-8"
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-caption text-muted-foreground">
                  %
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="number-of-users">Number of Users</Label>
              <Input
                id="number-of-users"
                type="number"
                min={1}
                value={form.numberOfUsers}
                onChange={(e) => updateField("numberOfUsers", e.target.value)}
                placeholder="25"
                aria-invalid={!!errors.numberOfUsers}
              />
              {errors.numberOfUsers ? (
                <p className="text-caption text-destructive">{errors.numberOfUsers}</p>
              ) : null}
            </div>
            <div className="hidden sm:block" />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start-date">Subscription Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                aria-invalid={!!errors.startDate}
              />
              {errors.startDate ? (
                <p className="text-caption text-destructive">{errors.startDate}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expiry-date">Subscription Expiry Date</Label>
              <Input
                id="expiry-date"
                type="date"
                value={form.expiryDate}
                onChange={(e) => updateField("expiryDate", e.target.value)}
                aria-invalid={!!errors.expiryDate}
              />
              {errors.expiryDate ? (
                <p className="text-caption text-destructive">{errors.expiryDate}</p>
              ) : null}
            </div>
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-4 py-3 sm:col-span-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-caption text-muted-foreground">
                The organization will automatically receive renewal reminder emails 14 days and 7 days before
                subscription expiry. Organizations are instructed to contact ProofDive directly to renew.
              </p>
            </div>
          </CardContent>
        </Card>

        {!isEdit ? (
          <Card id="section-users">
            <CardHeader>
              <CardTitle className="text-h5 font-medium">User Onboarding</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-body-sm text-muted-foreground">
                Optionally upload a CSV file of user email addresses to invite them to this organization.
                Invitations are sent once onboarding is complete and the Organization Admin has activated their
                account.
              </p>
              {!form.csvFileName ? (
                <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border px-6 py-10 text-center">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="user-csv" className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Upload CSV File
                      </label>
                    </Button>
                    <input
                      id="user-csv"
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => handleCsvUpload(e.target.files?.[0])}
                    />
                  </div>
                  {csvError ? <p className="text-caption text-destructive">{csvError}</p> : null}
                  <p className="text-caption text-muted-foreground">
                    This step is optional — you can invite users later.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-md border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-body-sm font-medium text-foreground">{form.csvFileName}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCsv}>
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    {form.userEmails.length} user{form.userEmails.length === 1 ? "" : "s"} will be invited once
                    onboarding is complete.
                  </p>
                  <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md bg-muted p-2">
                    {form.userEmails.slice(0, 8).map((email) => (
                      <span key={email} className="text-caption text-muted-foreground">
                        {email}
                      </span>
                    ))}
                    {form.userEmails.length > 8 ? (
                      <span className="text-caption text-muted-foreground">
                        +{form.userEmails.length - 8} more
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
      </div>
    </div>
  );
}
