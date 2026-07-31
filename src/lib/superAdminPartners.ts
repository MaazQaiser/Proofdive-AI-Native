export type PartnerType =
  | "university_institution"
  | "coach_trainer"
  | "influencer_creator"
  | "recruiter_employer";

export type CommissionType = "percentage" | "fixed" | "tiered";
export type EntityType = "individual" | "company";
export type AudienceType = "students" | "professionals" | "mixed";
export type PartnerStatus = "active" | "inactive";
export type PayoutFrequency = "weekly" | "monthly" | "quarterly";

export type CommissionTier = {
  minReferrals: number;
  ratePercent: number;
};

export type PartnerPerformance = {
  totalReferrals: number;
  totalSignups: number;
  totalConversions: number;
  totalEarningsCents: number;
};

export type Partner = {
  id: string;
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
  expectedUserVolume: number;
  referralCode: string;
  commissionType: CommissionType;
  /** Percentage rate when commissionType is percentage (e.g. 15 = 15%). */
  commissionPercent: number;
  /** Fixed amount in cents when commissionType is fixed. */
  commissionFixedCents: number;
  /** Tier table when commissionType is tiered. */
  commissionTiers: CommissionTier[];
  payoutFrequency: PayoutFrequency;
  status: PartnerStatus;
  performance: PartnerPerformance;
};

export const PARTNER_TYPE_LABEL: Record<PartnerType, string> = {
  university_institution: "University / Institution",
  coach_trainer: "Coach / Trainer",
  influencer_creator: "Influencer / Content Creator",
  recruiter_employer: "Recruiter / Employer Partner",
};

export const COMMISSION_TYPE_LABEL: Record<CommissionType, string> = {
  percentage: "Percentage-Based",
  fixed: "Fixed",
  tiered: "Tiered",
};

export const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  individual: "Individual",
  company: "Company",
};

export const AUDIENCE_TYPE_LABEL: Record<AudienceType, string> = {
  students: "Students",
  professionals: "Professionals",
  mixed: "Mixed",
};

export const PARTNER_STATUS_LABEL: Record<PartnerStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const PAYOUT_FREQUENCY_LABEL: Record<PayoutFrequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

export function generateReferralCode(fullName: string, existingCodes: string[]): string {
  const base = fullName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 6)
    .padEnd(4, "X");
  let attempt = `${base}${Math.floor(100 + Math.random() * 900)}`;
  let guard = 0;
  while (existingCodes.includes(attempt) && guard < 50) {
    attempt = `${base}${Math.floor(100 + Math.random() * 900)}`;
    guard += 1;
  }
  return attempt;
}

export function formatCommissionSummary(partner: Partner): string {
  if (partner.commissionType === "percentage") {
    return `${partner.commissionPercent}% per conversion`;
  }
  if (partner.commissionType === "fixed") {
    return `$${(partner.commissionFixedCents / 100).toFixed(2)} per conversion`;
  }
  if (partner.commissionTiers.length === 0) return "Tiered (not configured)";
  return partner.commissionTiers
    .map((t) => `${t.minReferrals}+ refs → ${t.ratePercent}%`)
    .join("; ");
}

type SeedInput = {
  id: string;
  fullName: string;
  email: string;
  country: string;
  entityType: EntityType;
  companyName?: string;
  website?: string;
  audienceType: AudienceType;
  partnerType: PartnerType;
  expectedUserVolume: number;
  referralCode: string;
  commissionType: CommissionType;
  commissionPercent?: number;
  commissionFixedCents?: number;
  commissionTiers?: CommissionTier[];
  payoutFrequency?: PayoutFrequency;
  status: PartnerStatus;
  performance: PartnerPerformance;
  phoneCountryCode?: string;
  phone?: string;
};

function seedPartner(input: SeedInput): Partner {
  return {
    id: input.id,
    fullName: input.fullName,
    email: input.email,
    phoneCountryCode: input.phoneCountryCode ?? "+1",
    phone: input.phone ?? "5550100",
    country: input.country,
    entityType: input.entityType,
    companyName: input.companyName ?? "",
    website: input.website ?? "",
    audienceType: input.audienceType,
    partnerType: input.partnerType,
    expectedUserVolume: input.expectedUserVolume,
    referralCode: input.referralCode,
    commissionType: input.commissionType,
    commissionPercent: input.commissionPercent ?? 10,
    commissionFixedCents: input.commissionFixedCents ?? 2500,
    commissionTiers: input.commissionTiers ?? [
      { minReferrals: 0, ratePercent: 10 },
      { minReferrals: 50, ratePercent: 15 },
      { minReferrals: 100, ratePercent: 20 },
    ],
    payoutFrequency: input.payoutFrequency ?? "monthly",
    status: input.status,
    performance: input.performance,
  };
}

/** Mock partner directory — mutated in localStorage via usePartners. */
export const SUPER_ADMIN_PARTNERS: Partner[] = [
  seedPartner({
    id: "partner_001",
    fullName: "Maya Chen",
    email: "maya@careerboost.coach",
    country: "United States",
    entityType: "individual",
    audienceType: "professionals",
    partnerType: "coach_trainer",
    expectedUserVolume: 200,
    referralCode: "MAYACH42",
    commissionType: "percentage",
    commissionPercent: 15,
    status: "active",
    performance: {
      totalReferrals: 420,
      totalSignups: 186,
      totalConversions: 54,
      totalEarningsCents: 162000,
    },
  }),
  seedPartner({
    id: "partner_002",
    fullName: "Campus Launch Partners",
    email: "ops@campuslaunch.edu",
    country: "Canada",
    entityType: "company",
    companyName: "Campus Launch Partners Inc.",
    website: "https://campuslaunch.edu",
    audienceType: "students",
    partnerType: "university_institution",
    expectedUserVolume: 1500,
    referralCode: "CAMPUS88",
    commissionType: "tiered",
    commissionTiers: [
      { minReferrals: 0, ratePercent: 8 },
      { minReferrals: 100, ratePercent: 12 },
      { minReferrals: 500, ratePercent: 18 },
    ],
    status: "active",
    performance: {
      totalReferrals: 980,
      totalSignups: 412,
      totalConversions: 96,
      totalEarningsCents: 288000,
    },
    phoneCountryCode: "+1",
    phone: "4165550199",
  }),
  seedPartner({
    id: "partner_003",
    fullName: "Jordan Blake",
    email: "jordan@creatorsphere.io",
    country: "United Kingdom",
    entityType: "individual",
    audienceType: "mixed",
    partnerType: "influencer_creator",
    expectedUserVolume: 800,
    referralCode: "JORDAN21",
    commissionType: "fixed",
    commissionFixedCents: 3500,
    status: "active",
    performance: {
      totalReferrals: 1250,
      totalSignups: 540,
      totalConversions: 120,
      totalEarningsCents: 420000,
    },
    phoneCountryCode: "+44",
    phone: "7700900123",
  }),
  seedPartner({
    id: "partner_004",
    fullName: "TalentBridge Recruiting",
    email: "partners@talentbridge.com",
    country: "United States",
    entityType: "company",
    companyName: "TalentBridge Recruiting LLC",
    website: "https://talentbridge.com",
    audienceType: "professionals",
    partnerType: "recruiter_employer",
    expectedUserVolume: 400,
    referralCode: "TALENT07",
    commissionType: "percentage",
    commissionPercent: 12,
    status: "inactive",
    performance: {
      totalReferrals: 210,
      totalSignups: 88,
      totalConversions: 22,
      totalEarningsCents: 66000,
    },
  }),
  seedPartner({
    id: "partner_005",
    fullName: "Aisha Rahman",
    email: "aisha@skillmentors.pk",
    country: "Pakistan",
    entityType: "individual",
    audienceType: "students",
    partnerType: "coach_trainer",
    expectedUserVolume: 300,
    referralCode: "AISHA55",
    commissionType: "percentage",
    commissionPercent: 18,
    status: "active",
    performance: {
      totalReferrals: 310,
      totalSignups: 140,
      totalConversions: 38,
      totalEarningsCents: 114000,
    },
    phoneCountryCode: "+92",
    phone: "3005550198",
  }),
];
