import { AVAILABLE_COURSES, COMPETENCY_FRAMEWORKS } from "@/lib/superAdminOrganizationWizard";

export type OrganizationType = "university" | "training_center" | "employer";
export type SubscriptionStatus = "active" | "expired" | "expiring_soon";
export type OrganizationStatus = "active" | "inactive";

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
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
  competencyFrameworkId: string;
  courseIds: string[];
  subscriptionPlan: string;
  subscriptionStatus: SubscriptionStatus;
  numberOfUsers: number;
  subscriptionStartDate: string;
  subscriptionExpiryDate: string;
  discountPercent: number;
  status: OrganizationStatus;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
};

export const ORGANIZATION_TYPE_LABEL: Record<OrganizationType, string> = {
  university: "University",
  training_center: "Training Center",
  employer: "Employer",
};

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: "Active",
  expired: "Expired",
  expiring_soon: "Expiring Soon",
};

export const ORGANIZATION_STATUS_LABEL: Record<OrganizationStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

const COUNTRY_CITY: Record<string, string> = {
  "United States": "San Francisco",
  Canada: "Toronto",
  "United Kingdom": "London",
  Germany: "Berlin",
  Singapore: "Singapore",
  Pakistan: "Lahore",
  Australia: "Sydney",
  "United Arab Emirates": "Dubai",
};

const COUNTRY_REGION: Record<string, string> = {
  "United States": "California",
  Canada: "Ontario",
  "United Kingdom": "England",
  Germany: "Berlin",
  Singapore: "Central Region",
  Pakistan: "Punjab",
  Australia: "New South Wales",
  "United Arab Emirates": "Dubai Emirate",
};

/** Start/expiry dates keyed by subscription status, anchored around the current date so seed data reads sensibly. */
const SUBSCRIPTION_DATE_RANGE: Record<SubscriptionStatus, { start: string; expiry: string }> = {
  active: { start: "2025-01-15", expiry: "2027-06-30" },
  expiring_soon: { start: "2025-08-01", expiry: "2026-08-10" },
  expired: { start: "2024-05-01", expiry: "2026-05-01" },
};

const NUMBER_OF_USERS_BY_PLAN: Record<string, number> = {
  Starter: 25,
  Growth: 120,
  Enterprise: 500,
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type SeedInput = {
  id: string;
  name: string;
  type: OrganizationType;
  country: string;
  subscriptionPlan: string;
  subscriptionStatus: SubscriptionStatus;
  status: OrganizationStatus;
};

function seedOrganization(input: SeedInput): Organization {
  const numberOfUsers = NUMBER_OF_USERS_BY_PLAN[input.subscriptionPlan] ?? 25;
  const inactiveUsers = input.status === "inactive" ? numberOfUsers : Math.round(numberOfUsers * 0.04);
  const activeUsers = numberOfUsers - inactiveUsers;
  const { start, expiry } = SUBSCRIPTION_DATE_RANGE[input.subscriptionStatus];
  const slug = slugify(input.name);

  return {
    ...input,
    industry: input.type === "employer" ? "Technology" : "Education",
    city: COUNTRY_CITY[input.country] ?? "—",
    region: COUNTRY_REGION[input.country] ?? "—",
    domain: `${slug}.proofdive.com`,
    logoFileName: "",
    contactName: "Admin Office",
    contactEmail: `admin@${slug}.com`,
    contactCountryCode: "+1",
    contactPhone: "555-0100",
    contactDesignation: "Administrator",
    competencyFrameworkId: COMPETENCY_FRAMEWORKS[0].id,
    courseIds: AVAILABLE_COURSES.map((c) => c.id),
    numberOfUsers,
    subscriptionStartDate: start,
    subscriptionExpiryDate: expiry,
    discountPercent: 0,
    totalUsers: numberOfUsers,
    activeUsers,
    inactiveUsers,
  };
}

/** Mock organization directory (no backend yet — mutated in-memory per session). */
export const SUPER_ADMIN_ORGANIZATIONS: Organization[] = (
  [
    { id: "org_001", name: "Stanford University", type: "university", country: "United States", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
    { id: "org_002", name: "Skillbridge Training Institute", type: "training_center", country: "United States", subscriptionPlan: "Growth", subscriptionStatus: "active", status: "active" },
    { id: "org_003", name: "Acme Robotics", type: "employer", country: "United States", subscriptionPlan: "Starter", subscriptionStatus: "expiring_soon", status: "active" },
    { id: "org_004", name: "University of Toronto", type: "university", country: "Canada", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
    { id: "org_005", name: "Maple Leaf Career Center", type: "training_center", country: "Canada", subscriptionPlan: "Growth", subscriptionStatus: "expired", status: "inactive" },
    { id: "org_006", name: "Northwind Logistics", type: "employer", country: "Canada", subscriptionPlan: "Growth", subscriptionStatus: "active", status: "active" },
    { id: "org_007", name: "Imperial College London", type: "university", country: "United Kingdom", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
    { id: "org_008", name: "London Upskill Academy", type: "training_center", country: "United Kingdom", subscriptionPlan: "Starter", subscriptionStatus: "expiring_soon", status: "active" },
    { id: "org_009", name: "Barclays Technology", type: "employer", country: "United Kingdom", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
    { id: "org_010", name: "Technical University of Munich", type: "university", country: "Germany", subscriptionPlan: "Growth", subscriptionStatus: "active", status: "active" },
    { id: "org_011", name: "Berlin Coding School", type: "training_center", country: "Germany", subscriptionPlan: "Starter", subscriptionStatus: "active", status: "active" },
    { id: "org_012", name: "Siemens Digital Industries", type: "employer", country: "Germany", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
    { id: "org_013", name: "National University of Singapore", type: "university", country: "Singapore", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
    { id: "org_014", name: "Singapore Skills Hub", type: "training_center", country: "Singapore", subscriptionPlan: "Growth", subscriptionStatus: "expired", status: "inactive" },
    { id: "org_015", name: "Grab Holdings", type: "employer", country: "Singapore", subscriptionPlan: "Growth", subscriptionStatus: "active", status: "active" },
    { id: "org_016", name: "Lahore University of Management Sciences", type: "university", country: "Pakistan", subscriptionPlan: "Growth", subscriptionStatus: "active", status: "active" },
    { id: "org_017", name: "Karachi Vocational Training Center", type: "training_center", country: "Pakistan", subscriptionPlan: "Starter", subscriptionStatus: "expiring_soon", status: "active" },
    { id: "org_018", name: "Systems Limited", type: "employer", country: "Pakistan", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
    { id: "org_019", name: "University of Melbourne", type: "university", country: "Australia", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
    { id: "org_020", name: "Sydney Trade Institute", type: "training_center", country: "Australia", subscriptionPlan: "Growth", subscriptionStatus: "active", status: "active" },
    { id: "org_021", name: "Atlassian", type: "employer", country: "Australia", subscriptionPlan: "Enterprise", subscriptionStatus: "expiring_soon", status: "active" },
    { id: "org_022", name: "American University of Sharjah", type: "university", country: "United Arab Emirates", subscriptionPlan: "Growth", subscriptionStatus: "active", status: "active" },
    { id: "org_023", name: "Dubai Future Skills Center", type: "training_center", country: "United Arab Emirates", subscriptionPlan: "Starter", subscriptionStatus: "expired", status: "inactive" },
    { id: "org_024", name: "Emirates Group", type: "employer", country: "United Arab Emirates", subscriptionPlan: "Enterprise", subscriptionStatus: "active", status: "active" },
  ] satisfies SeedInput[]
).map(seedOrganization);
