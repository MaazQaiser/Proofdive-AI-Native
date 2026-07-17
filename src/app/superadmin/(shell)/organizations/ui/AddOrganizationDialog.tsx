"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  Info,
  Layers,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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

type StepId = "landing" | "details" | "competency" | "courses" | "payment" | "users" | "review";

const STEP_ORDER: StepId[] = ["landing", "details", "competency", "courses", "payment", "users", "review"];
const TOTAL_STEPS = STEP_ORDER.length - 1;

const STEP_TITLES: Record<StepId, string> = {
  landing: "Add New Organization",
  details: "Organization Details",
  competency: "Competency Configuration",
  courses: "Course Configuration",
  payment: "Payment Plan Configuration",
  users: "User Onboarding",
  review: "Review & Send Invite",
};

const STEP_CARDS: { step: number; id: StepId; title: string; icon: typeof Building2 }[] = [
  { step: 1, id: "details", title: "Org Details", icon: Building2 },
  { step: 2, id: "competency", title: "Competency", icon: Layers },
  { step: 3, id: "courses", title: "Course Selection", icon: GraduationCap },
  { step: 4, id: "payment", title: "Payment Plan", icon: CreditCard },
  { step: 5, id: "users", title: "User Onboarding", icon: Users },
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Record<string, string>;

type AddOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingOrganizationNames: string[];
  frameworks: CompetencyFramework[];
  onCreateFramework: (framework: CompetencyFramework) => void;
  onCreate: (organization: Organization) => void;
};

export function AddOrganizationDialog({
  open,
  onOpenChange,
  existingOrganizationNames,
  frameworks,
  onCreateFramework,
  onCreate,
}: AddOrganizationDialogProps) {
  const [step, setStep] = useState<StepId>("landing");
  const [form, setForm] = useState<FormState>(createInitialFormState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isCreatingCompetency, setIsCreatingCompetency] = useState(false);
  const [newCompetencyName, setNewCompetencyName] = useState("");
  const [newCompetencyPillars, setNewCompetencyPillars] = useState<string[]>([]);
  const [competencyNameError, setCompetencyNameError] = useState("");
  const [csvError, setCsvError] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("landing");
      setForm(createInitialFormState());
      setErrors({});
      setIsCreatingCompetency(false);
      setCompetencyNameError("");
      setCsvError("");
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

  function validateDetails(): FieldErrors {
    const next: FieldErrors = {};
    const trimmedName = form.name.trim();
    if (!trimmedName) next.name = "Organization Name is required.";
    else if (existingOrganizationNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase()))
      next.name = "Organization Name already exists.";
    if (!form.industry) next.industry = "Industry / Domain is required.";
    if (!form.country) next.country = "Country is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.region.trim()) next.region = "Region is required.";
    if (!form.contactName.trim()) next.contactName = "Primary Contact Name is required.";
    if (!form.contactEmail.trim()) next.contactEmail = "Email Address is required.";
    else if (!EMAIL_PATTERN.test(form.contactEmail.trim())) next.contactEmail = "Enter a valid email address.";
    if (!form.contactPhone.trim()) next.contactPhone = "Phone Number is required.";
    if (!form.contactDesignation.trim()) next.contactDesignation = "Designation is required.";
    return next;
  }

  function validatePayment(): FieldErrors {
    const next: FieldErrors = {};
    if (!form.pricingPlanId) next.pricingPlanId = "Please select a pricing plan.";
    if (!form.numberOfUsers.trim() || Number(form.numberOfUsers) <= 0)
      next.numberOfUsers = "Number of Users is required.";
    if (!form.startDate) next.startDate = "Subscription Start Date is required.";
    if (!form.expiryDate) next.expiryDate = "Subscription Expiry Date is required.";
    if (form.startDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.startDate))
      next.expiryDate = "Expiry Date must be greater than Start Date.";
    return next;
  }

  function handleNext() {
    if (step === "landing") {
      if (!form.orgType) {
        setErrors({ orgType: "Please select an organization type." });
        return;
      }
      goToStep("details");
      return;
    }
    if (step === "details") {
      const validation = validateDetails();
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        return;
      }
      goToStep("competency");
      return;
    }
    if (step === "competency") {
      goToStep("courses");
      return;
    }
    if (step === "courses") {
      goToStep("payment");
      return;
    }
    if (step === "payment") {
      const validation = validatePayment();
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        return;
      }
      goToStep("users");
      return;
    }
    if (step === "users") {
      if (csvError) return;
      goToStep("review");
      return;
    }
    if (step === "review") {
      const plan = PRICING_PLANS.find((p) => p.id === form.pricingPlanId);
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
      onCreate(newOrganization);
    }
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

  function handleSkipUsers() {
    updateField("csvFileName", "");
    updateField("userEmails", []);
    setCsvError("");
    goToStep("review");
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
    const defaultFramework = frameworks.find((f) => f.isDefault) ?? frameworks[0];
    setNewCompetencyName("");
    setNewCompetencyPillars([...(defaultFramework?.pillars ?? [])]);
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
    const newFramework: CompetencyFramework = {
      id: `framework_${Date.now()}`,
      name: trimmedName,
      isDefault: false,
      pillars: newCompetencyPillars.map((p) => p.trim()).filter(Boolean),
    };
    onCreateFramework(newFramework);
    updateField("competencyFrameworkId", newFramework.id);
    setIsCreatingCompetency(false);
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const isLastStep = step === "review";
  const selectedFramework = frameworks.find((f) => f.id === form.competencyFrameworkId);
  const selectedPlan = PRICING_PLANS.find((p) => p.id === form.pricingPlanId);
  const selectedCourses = AVAILABLE_COURSES.filter((c) => form.selectedCourseIds.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[85vh] max-h-[760px] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          {step === "landing" ? (
            <DialogTitle className="text-h6 font-semibold text-foreground">Add New Organization</DialogTitle>
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
                    Add New Organization
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{STEP_TITLES[step]}</span>
                </div>
              </DialogTitle>
            </div>
          )}
          {step !== "landing" && (
            <span className="text-caption text-muted-foreground">
              Step {stepIndex} of {TOTAL_STEPS}
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
          {step === "landing" && (
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
              <div className="flex flex-col gap-2">
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
                {errors.orgType && <p className="text-caption text-destructive">{errors.orgType}</p>}
              </div>

              <div className="flex flex-col gap-6">
                <h2 className="text-body-lg text-center font-semibold text-foreground">
                  Follow the steps below to add new organization
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
                      {index < STEP_CARDS.length - 1 && <div className="h-px flex-1 bg-border" />}
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
          )}

          {step === "details" && (
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
              <div className="rounded-md border border-border bg-muted px-4 py-2 text-body-sm text-muted-foreground">
                Organization Type:{" "}
                <span className="font-medium text-foreground">
                  {form.orgType ? ORGANIZATION_TYPE_LABEL[form.orgType as OrganizationType] : "—"}
                </span>
              </div>

              <section className="flex flex-col gap-4">
                <h3 className="text-overline text-muted-foreground">Core Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex flex-col gap-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g. Acme University"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="text-caption text-destructive">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
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
                    {errors.industry && <p className="text-caption text-destructive">{errors.industry}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
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
                    {errors.country && <p className="text-caption text-destructive">{errors.country}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="org-city">City</Label>
                    <Input
                      id="org-city"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      aria-invalid={!!errors.city}
                    />
                    {errors.city && <p className="text-caption text-destructive">{errors.city}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="org-region">Region</Label>
                    <Input
                      id="org-region"
                      value={form.region}
                      onChange={(e) => updateField("region", e.target.value)}
                      aria-invalid={!!errors.region}
                    />
                    {errors.region && <p className="text-caption text-destructive">{errors.region}</p>}
                  </div>
                </div>
              </section>

              <Separator />

              <section className="flex flex-col gap-4">
                <h3 className="text-overline text-muted-foreground">White Labelling</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="org-logo">Organization Logo</Label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="org-logo" className="cursor-pointer">
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </label>
                      </Button>
                      <input
                        id="org-logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => updateField("logoFileName", e.target.files?.[0]?.name ?? "")}
                      />
                      {form.logoFileName && (
                        <span className="text-caption truncate text-muted-foreground">{form.logoFileName}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="org-domain">Domain Details</Label>
                    <Input
                      id="org-domain"
                      value={form.domain}
                      onChange={(e) => updateField("domain", e.target.value)}
                      placeholder="e.g. acme.proofdive.com"
                    />
                  </div>
                </div>
              </section>

              <Separator />

              <section className="flex flex-col gap-4">
                <h3 className="text-overline text-muted-foreground">Point of Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-name">Primary Contact Name</Label>
                    <Input
                      id="contact-name"
                      value={form.contactName}
                      onChange={(e) => updateField("contactName", e.target.value)}
                      aria-invalid={!!errors.contactName}
                    />
                    {errors.contactName && <p className="text-caption text-destructive">{errors.contactName}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-email">Email Address</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => updateField("contactEmail", e.target.value)}
                      aria-invalid={!!errors.contactEmail}
                    />
                    {errors.contactEmail && <p className="text-caption text-destructive">{errors.contactEmail}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.contactCountryCode}
                        onValueChange={(v) => updateField("contactCountryCode", v)}
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
                        id="contact-phone"
                        value={form.contactPhone}
                        onChange={(e) => updateField("contactPhone", e.target.value)}
                        aria-invalid={!!errors.contactPhone}
                        className="flex-1"
                      />
                    </div>
                    {errors.contactPhone && <p className="text-caption text-destructive">{errors.contactPhone}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-designation">Designation</Label>
                    <Input
                      id="contact-designation"
                      value={form.contactDesignation}
                      onChange={(e) => updateField("contactDesignation", e.target.value)}
                      aria-invalid={!!errors.contactDesignation}
                    />
                    {errors.contactDesignation && (
                      <p className="text-caption text-destructive">{errors.contactDesignation}</p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === "competency" && (
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              {!isCreatingCompetency ? (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="competency-framework">Competency Framework</Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.competencyFrameworkId}
                        onValueChange={(v) => updateField("competencyFrameworkId", v)}
                      >
                        <SelectTrigger id="competency-framework" className="flex-1">
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
                  {selectedFramework && (
                    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
                      <span className="text-body-sm font-medium text-foreground">
                        {selectedFramework.name} — Competency Pillars
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedFramework.pillars.map((pillar) => (
                          <span
                            key={pillar}
                            className="text-caption rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground"
                          >
                            {pillar}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-body-sm font-semibold text-foreground">Create Competency Version</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsCreatingCompetency(false)}>
                      Cancel
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
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
                    {competencyNameError && (
                      <p className="text-caption text-destructive">{competencyNameError}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Competency Pillars</Label>
                    <div className="flex flex-col gap-2">
                      {newCompetencyPillars.map((pillar, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={pillar}
                            onChange={(e) =>
                              setNewCompetencyPillars((prev) =>
                                prev.map((p, i) => (i === index ? e.target.value : p)),
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setNewCompetencyPillars((prev) => prev.filter((_, i) => i !== index))
                            }
                            aria-label="Remove pillar"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => setNewCompetencyPillars((prev) => [...prev, ""])}
                    >
                      <Plus className="h-4 w-4" />
                      Add Pillar
                    </Button>
                  </div>
                  <Button type="button" onClick={saveNewCompetency} className="w-fit">
                    Save Competency Version
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "courses" && (
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
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
            </div>
          )}

          {step === "payment" && (
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pricing-plan">Pricing Plan Template</Label>
                  <Select value={form.pricingPlanId} onValueChange={(v) => updateField("pricingPlanId", v)}>
                    <SelectTrigger id="pricing-plan" className="w-full" aria-invalid={!!errors.pricingPlanId}>
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
                  {errors.pricingPlanId && <p className="text-caption text-destructive">{errors.pricingPlanId}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="discount">Discount (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="discount"
                      type="number"
                      min={0}
                      max={100}
                      value={form.discountPercent}
                      onChange={(e) => updateField("discountPercent", e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-caption text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="number-of-users">Number of Users</Label>
                  <Input
                    id="number-of-users"
                    type="number"
                    min={1}
                    value={form.numberOfUsers}
                    onChange={(e) => updateField("numberOfUsers", e.target.value)}
                    aria-invalid={!!errors.numberOfUsers}
                  />
                  {errors.numberOfUsers && <p className="text-caption text-destructive">{errors.numberOfUsers}</p>}
                </div>
                <div />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="start-date">Subscription Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    aria-invalid={!!errors.startDate}
                  />
                  {errors.startDate && <p className="text-caption text-destructive">{errors.startDate}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="expiry-date">Subscription Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => updateField("expiryDate", e.target.value)}
                    aria-invalid={!!errors.expiryDate}
                  />
                  {errors.expiryDate && <p className="text-caption text-destructive">{errors.expiryDate}</p>}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-4 py-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-caption text-muted-foreground">
                  The organization will automatically receive renewal reminder emails 14 days and 7 days before
                  subscription expiry. Organizations are instructed to contact ProofDive directly to renew.
                </p>
              </div>
            </div>
          )}

          {step === "users" && (
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
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
                  {csvError && <p className="text-caption text-destructive">{csvError}</p>}
                  <p className="text-caption text-muted-foreground">
                    This step is optional — you can skip it and invite users later.
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
                    {form.userEmails.length > 8 && (
                      <span className="text-caption text-muted-foreground">
                        +{form.userEmails.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "review" && (
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              <p className="text-body-sm text-muted-foreground">
                Review the organization&apos;s configuration below. Clicking Send Invite will create the
                organization and email the Organization Admin an invitation to activate their account.
              </p>

              <ReviewSection title="Organization Details">
                <div className="grid grid-cols-2 gap-4">
                  <ReviewRow label="Organization Name" value={form.name} />
                  <ReviewRow
                    label="Organization Type"
                    value={form.orgType ? ORGANIZATION_TYPE_LABEL[form.orgType as OrganizationType] : ""}
                  />
                  <ReviewRow label="Industry / Domain" value={form.industry} />
                  <ReviewRow label="Country" value={form.country} />
                  <ReviewRow label="City" value={form.city} />
                  <ReviewRow label="Region" value={form.region} />
                  <ReviewRow label="Domain Details" value={form.domain} />
                  <ReviewRow label="Organization Logo" value={form.logoFileName || "Not uploaded"} />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <ReviewRow label="Primary Contact Name" value={form.contactName} />
                  <ReviewRow label="Email Address" value={form.contactEmail} />
                  <ReviewRow
                    label="Phone Number"
                    value={form.contactPhone ? `${form.contactCountryCode} ${form.contactPhone}` : ""}
                  />
                  <ReviewRow label="Designation" value={form.contactDesignation} />
                </div>
              </ReviewSection>

              <ReviewSection title="Competency Configuration">
                <ReviewRow label="Assigned Competency Framework" value={selectedFramework?.name} />
              </ReviewSection>

              <ReviewSection title="Course Configuration">
                {selectedCourses.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground">No courses assigned.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {selectedCourses.map((course) => (
                      <li key={course.id} className="text-body-sm text-foreground">
                        {course.name}
                      </li>
                    ))}
                  </ul>
                )}
              </ReviewSection>

              <ReviewSection title="Subscription Configuration">
                <div className="grid grid-cols-2 gap-4">
                  <ReviewRow label="Assigned Plan" value={selectedPlan?.name} />
                  <ReviewRow label="Number of Users" value={form.numberOfUsers} />
                  <ReviewRow label="Subscription Start Date" value={form.startDate} />
                  <ReviewRow label="Subscription Expiry Date" value={form.expiryDate} />
                  <ReviewRow
                    label="Applied Discount"
                    value={form.discountPercent ? `${form.discountPercent}%` : "None"}
                  />
                </div>
              </ReviewSection>

              <ReviewSection title="User Upload Summary">
                {form.userEmails.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground">
                    No users uploaded. You can invite users later.
                  </p>
                ) : (
                  <p className="text-body-sm text-foreground">
                    {form.csvFileName} — {form.userEmails.length} user
                    {form.userEmails.length === 1 ? "" : "s"} will be invited.
                  </p>
                )}
              </ReviewSection>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            Close
          </Button>
          {!isCreatingCompetency && (
            <div className="flex items-center gap-2">
              {step === "users" && (
                <Button variant="ghost" onClick={handleSkipUsers}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext}>
                {isLastStep ? "Send Invite" : "Next"}
                {!isLastStep && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
