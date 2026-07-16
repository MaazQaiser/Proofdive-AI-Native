"use client";

import { Ban, CheckCircle2, Pencil, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AVAILABLE_COURSES,
  COUNTRY_OPTIONS,
  INDUSTRY_OPTIONS,
  PHONE_COUNTRY_CODES,
  PRICING_PLANS,
  type CompetencyFramework,
} from "@/lib/superAdminOrganizationWizard";
import { ORGANIZATION_TYPE_LABEL, type Organization } from "@/lib/superAdminOrganizations";

import { OrganizationStatusPill } from "./StatusPills";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Record<string, string>;

type DetailsFormState = {
  name: string;
  industry: string;
  country: string;
  city: string;
  region: string;
  domain: string;
  logoFileName: string;
  contactName: string;
  contactEmail: string;
  contactCountryCode: string;
  contactPhone: string;
  contactDesignation: string;
};

function buildDetailsForm(org: Organization): DetailsFormState {
  return {
    name: org.name,
    industry: org.industry,
    country: org.country,
    city: org.city,
    region: org.region,
    domain: org.domain,
    logoFileName: org.logoFileName,
    contactName: org.contactName,
    contactEmail: org.contactEmail,
    contactCountryCode: org.contactCountryCode,
    contactPhone: org.contactPhone,
    contactDesignation: org.contactDesignation,
  };
}

type PaymentFormState = {
  pricingPlanName: string;
  numberOfUsers: string;
  startDate: string;
  expiryDate: string;
  discountPercent: string;
};

function buildPaymentForm(org: Organization): PaymentFormState {
  return {
    pricingPlanName: org.subscriptionPlan,
    numberOfUsers: String(org.numberOfUsers),
    startDate: org.subscriptionStartDate,
    expiryDate: org.subscriptionExpiryDate,
    discountPercent: org.discountPercent ? String(org.discountPercent) : "",
  };
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-body-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: "green" | "muted" }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border p-4">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-h6 font-semibold",
          tone === "green" ? "text-scoring-green" : tone === "muted" ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ManageButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="bg-extended-light-cyan text-extended-green-blue hover:bg-extended-light-cyan/80"
    >
      <Pencil className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}

type OrganizationDetailDrawerProps = {
  organization: Organization | null;
  onOpenChange: (open: boolean) => void;
  existingOrganizationNames: string[];
  frameworks: CompetencyFramework[];
  onUpdate: (id: string, patch: Partial<Organization>) => void;
  onRequestStatusChange: (org: Organization) => void;
};

export function OrganizationDetailDrawer({
  organization,
  onOpenChange,
  existingOrganizationNames,
  frameworks,
  onUpdate,
  onRequestStatusChange,
}: OrganizationDetailDrawerProps) {
  const [isDetailsEditing, setIsDetailsEditing] = useState(false);
  const [detailsForm, setDetailsForm] = useState<DetailsFormState | null>(null);
  const [detailsErrors, setDetailsErrors] = useState<FieldErrors>({});

  const [isCompetencyEditing, setIsCompetencyEditing] = useState(false);
  const [competencyDraftId, setCompetencyDraftId] = useState("");

  const [isCoursesEditing, setIsCoursesEditing] = useState(false);
  const [courseDraftIds, setCourseDraftIds] = useState<string[]>([]);

  const [isPaymentEditing, setIsPaymentEditing] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState | null>(null);
  const [paymentErrors, setPaymentErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!organization) return;
    setIsDetailsEditing(false);
    setIsCompetencyEditing(false);
    setIsCoursesEditing(false);
    setIsPaymentEditing(false);
    setDetailsForm(buildDetailsForm(organization));
    setDetailsErrors({});
    setCompetencyDraftId(organization.competencyFrameworkId);
    setCourseDraftIds(organization.courseIds);
    setPaymentForm(buildPaymentForm(organization));
    setPaymentErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  if (!organization || !detailsForm || !paymentForm) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const org = organization;
  const assignedFramework = frameworks.find((f) => f.id === org.competencyFrameworkId);
  const assignedCourses = AVAILABLE_COURSES.filter((c) => org.courseIds.includes(c.id));

  function updateDetailsField<K extends keyof DetailsFormState>(key: K, value: DetailsFormState[K]) {
    setDetailsForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDetailsErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSaveDetails() {
    if (!detailsForm) return;
    const trimmedName = detailsForm.name.trim();
    const errors: FieldErrors = {};
    if (!trimmedName) errors.name = "Organization Name is required.";
    else if (
      existingOrganizationNames.some(
        (n) => n.toLowerCase() === trimmedName.toLowerCase() && n.toLowerCase() !== org.name.toLowerCase(),
      )
    )
      errors.name = "Organization Name already exists.";
    if (!detailsForm.industry) errors.industry = "Industry / Domain is required.";
    if (!detailsForm.country) errors.country = "Country is required.";
    if (!detailsForm.city.trim()) errors.city = "City is required.";
    if (!detailsForm.region.trim()) errors.region = "Region is required.";
    if (!detailsForm.contactName.trim()) errors.contactName = "Primary Contact Name is required.";
    if (!detailsForm.contactEmail.trim()) errors.contactEmail = "Email Address is required.";
    else if (!EMAIL_PATTERN.test(detailsForm.contactEmail.trim())) errors.contactEmail = "Enter a valid email address.";
    if (!detailsForm.contactPhone.trim()) errors.contactPhone = "Phone Number is required.";
    if (!detailsForm.contactDesignation.trim()) errors.contactDesignation = "Designation is required.";

    if (Object.keys(errors).length > 0) {
      setDetailsErrors(errors);
      return;
    }

    onUpdate(org.id, {
      name: trimmedName,
      industry: detailsForm.industry,
      country: detailsForm.country,
      city: detailsForm.city.trim(),
      region: detailsForm.region.trim(),
      domain: detailsForm.domain.trim(),
      logoFileName: detailsForm.logoFileName,
      contactName: detailsForm.contactName.trim(),
      contactEmail: detailsForm.contactEmail.trim(),
      contactCountryCode: detailsForm.contactCountryCode,
      contactPhone: detailsForm.contactPhone.trim(),
      contactDesignation: detailsForm.contactDesignation.trim(),
    });
    setIsDetailsEditing(false);
    toast.success("Organization updated successfully.");
  }

  function handleSaveCompetency() {
    onUpdate(org.id, { competencyFrameworkId: competencyDraftId });
    setIsCompetencyEditing(false);
    toast.success("Organization updated successfully.");
  }

  function toggleDraftCourse(courseId: string) {
    setCourseDraftIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  }

  function handleSaveCourses() {
    onUpdate(org.id, { courseIds: courseDraftIds });
    setIsCoursesEditing(false);
    toast.success("Organization updated successfully.");
  }

  function updatePaymentField<K extends keyof PaymentFormState>(key: K, value: PaymentFormState[K]) {
    setPaymentForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setPaymentErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSavePayment() {
    if (!paymentForm) return;
    const errors: FieldErrors = {};
    if (!paymentForm.pricingPlanName) errors.pricingPlanName = "Please select a pricing plan.";
    if (!paymentForm.numberOfUsers.trim() || Number(paymentForm.numberOfUsers) <= 0)
      errors.numberOfUsers = "Number of Users is required.";
    if (!paymentForm.startDate) errors.startDate = "Subscription Start Date is required.";
    if (!paymentForm.expiryDate) errors.expiryDate = "Subscription Expiry Date is required.";
    if (
      paymentForm.startDate &&
      paymentForm.expiryDate &&
      new Date(paymentForm.expiryDate) <= new Date(paymentForm.startDate)
    )
      errors.expiryDate = "Subscription Expiry Date must be greater than Subscription Start Date.";

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }

    onUpdate(org.id, {
      subscriptionPlan: paymentForm.pricingPlanName,
      numberOfUsers: Number(paymentForm.numberOfUsers),
      subscriptionStartDate: paymentForm.startDate,
      subscriptionExpiryDate: paymentForm.expiryDate,
      discountPercent: paymentForm.discountPercent.trim() ? Number(paymentForm.discountPercent) : 0,
    });
    setIsPaymentEditing(false);
    toast.success("Organization updated successfully.");
  }

  return (
    <Sheet open={!!organization} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Organization Details</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-border px-6 py-5">
            {!isDetailsEditing ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-h6 text-foreground">{organization.name}</h2>
                    <p className="text-body-sm text-muted-foreground">{ORGANIZATION_TYPE_LABEL[organization.type]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrganizationStatusPill status={organization.status} />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsDetailsEditing(true)}
                      aria-label="Edit organization details"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Industry / Domain" value={organization.industry} />
                  <DetailRow label="Country" value={organization.country} />
                  <DetailRow label="City" value={organization.city} />
                  <DetailRow label="Region" value={organization.region} />
                  <DetailRow label="Domain Details" value={organization.domain} />
                  <DetailRow label="Organization Logo" value={organization.logoFileName || "Not uploaded"} />
                </div>

                <Separator />

                <h3 className="text-overline text-muted-foreground">Point of Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Primary Contact Name" value={organization.contactName} />
                  <DetailRow label="Email Address" value={organization.contactEmail} />
                  <DetailRow
                    label="Phone Number"
                    value={`${organization.contactCountryCode} ${organization.contactPhone}`}
                  />
                  <DetailRow label="Designation" value={organization.contactDesignation} />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => onRequestStatusChange(organization)}
                >
                  {organization.status === "active" ? (
                    <>
                      <Ban className="h-4 w-4" />
                      Deactivate Organization
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Activate Organization
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-body-sm font-semibold text-foreground">Edit Organization Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsDetailsEditing(false)}>
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex flex-col gap-2">
                    <Label htmlFor="edit-org-name">Organization Name</Label>
                    <Input
                      id="edit-org-name"
                      value={detailsForm.name}
                      onChange={(e) => updateDetailsField("name", e.target.value)}
                      aria-invalid={!!detailsErrors.name}
                    />
                    {detailsErrors.name && <p className="text-caption text-destructive">{detailsErrors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-org-industry">Industry / Domain</Label>
                    <Select
                      value={detailsForm.industry}
                      onValueChange={(v) => updateDetailsField("industry", v)}
                    >
                      <SelectTrigger id="edit-org-industry" className="w-full" aria-invalid={!!detailsErrors.industry}>
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
                    {detailsErrors.industry && (
                      <p className="text-caption text-destructive">{detailsErrors.industry}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-org-country">Country</Label>
                    <Select value={detailsForm.country} onValueChange={(v) => updateDetailsField("country", v)}>
                      <SelectTrigger id="edit-org-country" className="w-full" aria-invalid={!!detailsErrors.country}>
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
                    {detailsErrors.country && (
                      <p className="text-caption text-destructive">{detailsErrors.country}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-org-city">City</Label>
                    <Input
                      id="edit-org-city"
                      value={detailsForm.city}
                      onChange={(e) => updateDetailsField("city", e.target.value)}
                      aria-invalid={!!detailsErrors.city}
                    />
                    {detailsErrors.city && <p className="text-caption text-destructive">{detailsErrors.city}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-org-region">Region</Label>
                    <Input
                      id="edit-org-region"
                      value={detailsForm.region}
                      onChange={(e) => updateDetailsField("region", e.target.value)}
                      aria-invalid={!!detailsErrors.region}
                    />
                    {detailsErrors.region && <p className="text-caption text-destructive">{detailsErrors.region}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-org-domain">Domain Details</Label>
                    <Input
                      id="edit-org-domain"
                      value={detailsForm.domain}
                      onChange={(e) => updateDetailsField("domain", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-org-logo">Organization Logo</Label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="edit-org-logo" className="cursor-pointer">
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </label>
                      </Button>
                      <input
                        id="edit-org-logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => updateDetailsField("logoFileName", e.target.files?.[0]?.name ?? "")}
                      />
                      {detailsForm.logoFileName && (
                        <span className="text-caption truncate text-muted-foreground">
                          {detailsForm.logoFileName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <h3 className="text-overline text-muted-foreground">Point of Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-contact-name">Primary Contact Name</Label>
                    <Input
                      id="edit-contact-name"
                      value={detailsForm.contactName}
                      onChange={(e) => updateDetailsField("contactName", e.target.value)}
                      aria-invalid={!!detailsErrors.contactName}
                    />
                    {detailsErrors.contactName && (
                      <p className="text-caption text-destructive">{detailsErrors.contactName}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-contact-email">Email Address</Label>
                    <Input
                      id="edit-contact-email"
                      type="email"
                      value={detailsForm.contactEmail}
                      onChange={(e) => updateDetailsField("contactEmail", e.target.value)}
                      aria-invalid={!!detailsErrors.contactEmail}
                    />
                    {detailsErrors.contactEmail && (
                      <p className="text-caption text-destructive">{detailsErrors.contactEmail}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-contact-phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select
                        value={detailsForm.contactCountryCode}
                        onValueChange={(v) => updateDetailsField("contactCountryCode", v)}
                      >
                        <SelectTrigger className="w-28 shrink-0">
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
                        id="edit-contact-phone"
                        value={detailsForm.contactPhone}
                        onChange={(e) => updateDetailsField("contactPhone", e.target.value)}
                        aria-invalid={!!detailsErrors.contactPhone}
                        className="flex-1"
                      />
                    </div>
                    {detailsErrors.contactPhone && (
                      <p className="text-caption text-destructive">{detailsErrors.contactPhone}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-contact-designation">Designation</Label>
                    <Input
                      id="edit-contact-designation"
                      value={detailsForm.contactDesignation}
                      onChange={(e) => updateDetailsField("contactDesignation", e.target.value)}
                      aria-invalid={!!detailsErrors.contactDesignation}
                    />
                    {detailsErrors.contactDesignation && (
                      <p className="text-caption text-destructive">{detailsErrors.contactDesignation}</p>
                    )}
                  </div>
                </div>

                <Button onClick={handleSaveDetails} className="w-fit">
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <Tabs defaultValue="competencies" className="gap-0">
            <TabsList className="mx-6 mt-4 w-fit">
              <TabsTrigger value="competencies">Competencies</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <div className="px-6 py-5">
              <TabsContent value="competencies" className="flex flex-col gap-4">
                {!isCompetencyEditing ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-body-sm font-semibold text-foreground">Assigned Competency Framework</h3>
                      <ManageButton onClick={() => setIsCompetencyEditing(true)}>Manage Competencies</ManageButton>
                    </div>
                    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
                      <span className="text-body-sm font-medium text-foreground">
                        {assignedFramework?.name ?? "Not assigned"}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {assignedFramework?.pillars.map((pillar) => (
                          <span
                            key={pillar}
                            className="text-caption rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground"
                          >
                            {pillar}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-body-sm font-semibold text-foreground">Change Competency Framework</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsCompetencyEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                    <Select value={competencyDraftId} onValueChange={setCompetencyDraftId}>
                      <SelectTrigger className="w-full">
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
                    <Button onClick={handleSaveCompetency} className="w-fit">
                      Save Changes
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="courses" className="flex flex-col gap-4">
                {!isCoursesEditing ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-body-sm font-semibold text-foreground">Assigned Courses</h3>
                      <ManageButton onClick={() => setIsCoursesEditing(true)}>Manage Courses</ManageButton>
                    </div>
                    {assignedCourses.length === 0 ? (
                      <p className="text-body-sm text-muted-foreground">No courses assigned.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {assignedCourses.map((course) => (
                          <div key={course.id} className="flex items-center gap-2 rounded-md border border-border p-3">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-scoring-green" />
                            <span className="text-body-sm text-foreground">{course.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-body-sm font-semibold text-foreground">Update Assigned Courses</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsCoursesEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                    {AVAILABLE_COURSES.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-start gap-3 rounded-md border border-border p-4 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={courseDraftIds.includes(course.id)}
                          onCheckedChange={() => toggleDraftCourse(course.id)}
                          className="mt-0.5"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-body-sm font-medium text-foreground">{course.name}</span>
                          <span className="text-caption text-muted-foreground">{course.description}</span>
                        </div>
                      </label>
                    ))}
                    <Button onClick={handleSaveCourses} className="w-fit">
                      Save Changes
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="payment" className="flex flex-col gap-4">
                {!isPaymentEditing ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-body-sm font-semibold text-foreground">Subscription Configuration</h3>
                      <ManageButton onClick={() => setIsPaymentEditing(true)}>Manage Payment</ManageButton>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailRow label="Assigned Plan" value={organization.subscriptionPlan} />
                      <DetailRow label="Number of Users" value={organization.numberOfUsers} />
                      <DetailRow label="Subscription Start Date" value={organization.subscriptionStartDate} />
                      <DetailRow label="Subscription Expiry Date" value={organization.subscriptionExpiryDate} />
                      <DetailRow
                        label="Applied Discount"
                        value={organization.discountPercent ? `${organization.discountPercent}%` : "None"}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-body-sm font-semibold text-foreground">Update Subscription</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsPaymentEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-pricing-plan">Pricing Plan Template</Label>
                        <Select
                          value={paymentForm.pricingPlanName}
                          onValueChange={(v) => updatePaymentField("pricingPlanName", v)}
                        >
                          <SelectTrigger
                            id="edit-pricing-plan"
                            className="w-full"
                            aria-invalid={!!paymentErrors.pricingPlanName}
                          >
                            <SelectValue placeholder="Select Pricing Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRICING_PLANS.map((plan) => (
                              <SelectItem key={plan.id} value={plan.name}>
                                {plan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {paymentErrors.pricingPlanName && (
                          <p className="text-caption text-destructive">{paymentErrors.pricingPlanName}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-discount">Discount (Optional)</Label>
                        <div className="relative">
                          <Input
                            id="edit-discount"
                            type="number"
                            min={0}
                            max={100}
                            value={paymentForm.discountPercent}
                            onChange={(e) => updatePaymentField("discountPercent", e.target.value)}
                            className="pr-8"
                          />
                          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-caption text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-number-of-users">Number of Users</Label>
                        <Input
                          id="edit-number-of-users"
                          type="number"
                          min={1}
                          value={paymentForm.numberOfUsers}
                          onChange={(e) => updatePaymentField("numberOfUsers", e.target.value)}
                          aria-invalid={!!paymentErrors.numberOfUsers}
                        />
                        {paymentErrors.numberOfUsers && (
                          <p className="text-caption text-destructive">{paymentErrors.numberOfUsers}</p>
                        )}
                      </div>
                      <div />
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-start-date">Subscription Start Date</Label>
                        <Input
                          id="edit-start-date"
                          type="date"
                          value={paymentForm.startDate}
                          onChange={(e) => updatePaymentField("startDate", e.target.value)}
                          aria-invalid={!!paymentErrors.startDate}
                        />
                        {paymentErrors.startDate && (
                          <p className="text-caption text-destructive">{paymentErrors.startDate}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-expiry-date">Subscription Expiry Date</Label>
                        <Input
                          id="edit-expiry-date"
                          type="date"
                          value={paymentForm.expiryDate}
                          onChange={(e) => updatePaymentField("expiryDate", e.target.value)}
                          aria-invalid={!!paymentErrors.expiryDate}
                        />
                        {paymentErrors.expiryDate && (
                          <p className="text-caption text-destructive">{paymentErrors.expiryDate}</p>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleSavePayment} className="w-fit">
                      Save Changes
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="users" className="flex flex-col gap-4">
                <h3 className="text-body-sm font-semibold text-foreground">User Summary</h3>
                <div className="grid grid-cols-3 gap-3">
                  <StatTile label="Total Users" value={organization.totalUsers} />
                  <StatTile label="Active Users" value={organization.activeUsers} tone="green" />
                  <StatTile label="Inactive Users" value={organization.inactiveUsers} tone="muted" />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
