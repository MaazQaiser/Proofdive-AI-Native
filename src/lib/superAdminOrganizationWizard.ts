export type CompetencyFramework = {
  id: string;
  name: string;
  isDefault: boolean;
  pillars: string[];
};

const DEFAULT_COMPETENCY_PILLARS = [
  "Technical Proficiency",
  "Communication",
  "Problem Solving",
  "Leadership",
  "Adaptability",
];

/** Mutated in-memory when a Super Admin saves a new custom competency version — reusable across organizations for the session. */
export const COMPETENCY_FRAMEWORKS: CompetencyFramework[] = [
  {
    id: "framework_default",
    name: "ProofDive Default Competency Framework",
    isDefault: true,
    pillars: DEFAULT_COMPETENCY_PILLARS,
  },
];

export type Course = {
  id: string;
  name: string;
  description: string;
  selectedByDefault: boolean;
};

export const AVAILABLE_COURSES: Course[] = [
  {
    id: "course_1",
    name: "Workplace Communication Fundamentals",
    description: "Core verbal, written, and interpersonal communication skills for the modern workplace.",
    selectedByDefault: true,
  },
  {
    id: "course_2",
    name: "Professional Etiquette & Soft Skills",
    description: "Collaboration, time management, and professionalism essentials.",
    selectedByDefault: true,
  },
];

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  { id: "starter", name: "Starter", description: "Up to 50 users, core competencies and courses." },
  { id: "growth", name: "Growth", description: "Up to 500 users, custom competency frameworks." },
  { id: "enterprise", name: "Enterprise", description: "Unlimited users, dedicated support and SSO." },
];

export const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Government",
  "Other",
];

export const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "Singapore",
  "Pakistan",
  "Australia",
  "United Arab Emirates",
];

export const PHONE_COUNTRY_CODES = [
  { code: "+1", label: "+1 (US/CA)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+49", label: "+49 (DE)" },
  { code: "+65", label: "+65 (SG)" },
  { code: "+61", label: "+61 (AU)" },
  { code: "+92", label: "+92 (PK)" },
  { code: "+971", label: "+971 (UAE)" },
];
