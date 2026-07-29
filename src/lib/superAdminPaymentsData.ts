/** Shared payment domain: rates, bundles, discounts, masterclass catalog, pricing helpers. */

export type ClientType = "B2C" | "B2B";
export type ItemKind = "mockInterview" | "storyboard" | "masterclass";
export type BillingCycle = "monthly" | "quarterly" | "yearly";
export type BundleStatus = "draft" | "active" | "inactive";
export type DiscountType = "percentage" | "fixed" | "free";
export type DiscountUsageLimit = "unlimited" | "max" | "one_time";
export type DiscountStatus = "active" | "expired" | "deactivated" | "scheduled";

export const CLIENT_TYPES: ClientType[] = ["B2C", "B2B"];
export const ITEM_KINDS: ItemKind[] = ["mockInterview", "storyboard", "masterclass"];
export const BILLING_CYCLES: BillingCycle[] = ["monthly", "quarterly", "yearly"];

export const ITEM_KIND_LABEL: Record<ItemKind, string> = {
  mockInterview: "Mock Interview",
  storyboard: "Storyboard",
  masterclass: "Masterclass",
};

export const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export const BUNDLE_STATUS_LABEL: Record<BundleStatus, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
};

export const DISCOUNT_TYPE_LABEL: Record<DiscountType, string> = {
  percentage: "Percentage",
  fixed: "Fixed Amount",
  free: "Free Access",
};

export const DISCOUNT_STATUS_LABEL: Record<DiscountStatus, string> = {
  active: "Active",
  expired: "Expired",
  deactivated: "Deactivated",
  scheduled: "Scheduled",
};

export type RateKey = `${ItemKind}:${ClientType}`;

export type RateMap = Partial<Record<RateKey, number>>;

export function rateKey(kind: ItemKind, clientType: ClientType): RateKey {
  return `${kind}:${clientType}`;
}

export type MasterclassModule = {
  id: string;
  name: string;
};

export type SeedMasterclass = {
  id: string;
  name: string;
  status: "published" | "draft";
  modules: MasterclassModule[];
};

/** Stand-in for Content & Masterclass Management until that module ships. */
export const SEED_MASTERCLASSES: SeedMasterclass[] = [
  {
    id: "mc_resume_101",
    name: "Resume Writing 101",
    status: "published",
    modules: [
      { id: "mod_r1", name: "Structure & Formatting" },
      { id: "mod_r2", name: "Achievement Bullets" },
      { id: "mod_r3", name: "ATS Optimization" },
      { id: "mod_r4", name: "Tailoring for Roles" },
    ],
  },
  {
    id: "mc_behavioral",
    name: "Behavioral Interview Mastery",
    status: "published",
    modules: [
      { id: "mod_b1", name: "STAR Framework" },
      { id: "mod_b2", name: "Leadership Stories" },
      { id: "mod_b3", name: "Conflict & Feedback" },
    ],
  },
  {
    id: "mc_system_design",
    name: "System Design Prep",
    status: "published",
    modules: [
      { id: "mod_s1", name: "Requirements & Scope" },
      { id: "mod_s2", name: "High-Level Design" },
      { id: "mod_s3", name: "Deep Dives" },
      { id: "mod_s4", name: "Trade-offs & Scale" },
    ],
  },
];

export function publishedMasterclasses(): SeedMasterclass[] {
  return SEED_MASTERCLASSES.filter((m) => m.status === "published");
}

export function getMasterclassById(id: string): SeedMasterclass | undefined {
  return SEED_MASTERCLASSES.find((m) => m.id === id);
}

/** Dollars with 2 decimal places; stored as number (e.g. 15.00). */
export const SEED_GLOBAL_RATES: RateMap = {
  "mockInterview:B2C": 15,
  "mockInterview:B2B": 12,
  "storyboard:B2C": 10,
  "storyboard:B2B": 8,
  "masterclass:B2C": 80,
  "masterclass:B2B": 65,
};

export const SEED_ADD_ON_RATES: RateMap = {
  "mockInterview:B2C": 18,
  "mockInterview:B2B": 14,
  "storyboard:B2C": 12,
  "storyboard:B2B": 10,
  "masterclass:B2C": 90,
  "masterclass:B2B": 75,
};

export type BundleItemMockOrStory = {
  included: boolean;
  quantity: number;
  unitPrice: number;
  /** True when Super Admin overrode the Global Rate prefill. */
  priceOverridden?: boolean;
};

export type BundleMasterclassSelection = {
  masterclassId: string;
  selectedModuleIds: string[];
  /** Absolute masterclass price after module toggles / overrides. */
  price: number;
  priceOverridden?: boolean;
};

export type BundleMasterclassItem = {
  included: boolean;
  selections: BundleMasterclassSelection[];
};

export type BundleCyclePrice = {
  cycle: BillingCycle;
  /** Final price for this cadence (may be overridden). */
  price: number;
  priceOverridden?: boolean;
};

export type SubscriberAddOn = {
  id: string;
  item: ItemKind;
  quantity?: number;
  moduleIds?: string[];
  pricePaid: number;
  datePurchased: string;
};

export type BundleSubscriber = {
  id: string;
  name: string;
  email: string;
  purchasedAt: string;
  billingCycle: BillingCycle;
  status: "active" | "cancelled" | "expired";
  addOns: SubscriberAddOn[];
};

export type PaymentBundle = {
  id: string;
  name: string;
  description: string;
  type: ClientType;
  mockInterview: BundleItemMockOrStory;
  storyboard: BundleItemMockOrStory;
  masterclass: BundleMasterclassItem;
  cycles: BundleCyclePrice[];
  status: BundleStatus;
  createdAt: string;
  updatedAt: string;
  /** Original bundle id when this was created via Duplicate. */
  duplicatedFromId?: string;
  subscribers: BundleSubscriber[];
};

export type DiscountRedemption = {
  id: string;
  organizationOrUser: string;
  dateRedeemed: string;
};

export type DiscountCode = {
  id: string;
  code: string;
  discountType: DiscountType;
  /** Percentage 1–100, fixed amount dollars, or unused for free. */
  value: number | null;
  appliesTo: ClientType[];
  usageLimit: DiscountUsageLimit;
  maxRedemptions: number | null;
  startDate: string;
  expiryDate: string;
  /** Manual deactivate flag; otherwise derived from dates / usage. */
  deactivated: boolean;
  createdAt: string;
  redemptions: DiscountRedemption[];
};

export function moduleShare(absolutePrice: number, totalModules: number): number {
  if (totalModules <= 0) return 0;
  return roundMoney(absolutePrice / totalModules);
}

export function priceForSelectedModules(
  absolutePrice: number,
  totalModules: number,
  selectedCount: number,
): number {
  if (totalModules <= 0 || selectedCount <= 0) return 0;
  const share = moduleShare(absolutePrice, totalModules);
  return roundMoney(share * selectedCount);
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function isValidPrice(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0.01;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function calculateBundleItemSubtotal(bundle: Pick<PaymentBundle, "mockInterview" | "storyboard" | "masterclass">): number {
  let total = 0;
  if (bundle.mockInterview.included) {
    total += bundle.mockInterview.quantity * bundle.mockInterview.unitPrice;
  }
  if (bundle.storyboard.included) {
    total += bundle.storyboard.quantity * bundle.storyboard.unitPrice;
  }
  if (bundle.masterclass.included) {
    for (const sel of bundle.masterclass.selections) {
      total += sel.price;
    }
  }
  return roundMoney(total);
}

export function emptyMockOrStory(): BundleItemMockOrStory {
  return { included: false, quantity: 1, unitPrice: 0 };
}

export function emptyMasterclass(): BundleMasterclassItem {
  return { included: false, selections: [] };
}

export function createEmptyBundleDraft(partial?: Partial<PaymentBundle>): PaymentBundle {
  const now = new Date().toISOString();
  return {
    id: `bundle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    description: "",
    type: "B2C",
    mockInterview: emptyMockOrStory(),
    storyboard: emptyMockOrStory(),
    masterclass: emptyMasterclass(),
    cycles: [],
    status: "draft",
    createdAt: now,
    updatedAt: now,
    subscribers: [],
    ...partial,
  };
}

export function nextDuplicateName(sourceName: string, existingNames: string[]): string {
  const base = sourceName.replace(/_\d+$/, "");
  let n = 0;
  while (existingNames.includes(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

export function duplicateBundle(source: PaymentBundle, existing: PaymentBundle[]): PaymentBundle {
  const names = existing.map((b) => b.name);
  const now = new Date().toISOString();
  return {
    ...structuredClone(source),
    id: `bundle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: nextDuplicateName(source.name, names),
    status: "draft",
    createdAt: now,
    updatedAt: now,
    duplicatedFromId: source.duplicatedFromId ?? source.id,
    subscribers: [],
  };
}

export function isBundleNameTaken(name: string, bundles: PaymentBundle[], excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase();
  return bundles.some((b) => b.id !== excludeId && b.name.trim().toLowerCase() === normalized);
}

export function hasConfiguredRate(rates: RateMap, kind: ItemKind, clientType: ClientType): boolean {
  return isValidPrice(rates[rateKey(kind, clientType)]);
}

export function validateBundleForReactivation(
  bundle: PaymentBundle,
  globalRates: RateMap,
): string[] {
  const errors: string[] = [];
  if (bundle.mockInterview.included && !hasConfiguredRate(globalRates, "mockInterview", bundle.type)) {
    errors.push("Mock Interview has no Global Rate for this client type.");
  }
  if (bundle.storyboard.included && !hasConfiguredRate(globalRates, "storyboard", bundle.type)) {
    errors.push("Storyboard has no Global Rate for this client type.");
  }
  if (bundle.masterclass.included) {
    if (!hasConfiguredRate(globalRates, "masterclass", bundle.type)) {
      errors.push("Masterclass has no Global Rate for this client type.");
    }
    for (const sel of bundle.masterclass.selections) {
      const mc = getMasterclassById(sel.masterclassId);
      if (!mc || mc.status !== "published") {
        errors.push(`Masterclass "${sel.masterclassId}" is no longer published.`);
        continue;
      }
      for (const modId of sel.selectedModuleIds) {
        if (!mc.modules.some((m) => m.id === modId)) {
          errors.push(`Module "${modId}" is missing from ${mc.name}.`);
        }
      }
    }
  }
  return errors;
}

export type BundleSummaryStats = {
  totalActiveBundles: number;
  earnings: number;
  earningsByClientType: Record<ClientType, number>;
  earningsAddOns: number;
  totalSubscribers: number;
  subscribersByClientType: Record<ClientType, number>;
  newSubscribersThisMonth: number;
  newSubscribersByClientType: Record<ClientType, number>;
};

export function computeBundleSummary(bundles: PaymentBundle[]): BundleSummaryStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let earnings = 0;
  let earningsAddOns = 0;
  const earningsByClientType: Record<ClientType, number> = { B2C: 0, B2B: 0 };
  const subscribersByClientType: Record<ClientType, number> = { B2C: 0, B2B: 0 };
  const newSubscribersByClientType: Record<ClientType, number> = { B2C: 0, B2B: 0 };
  let totalSubscribers = 0;
  let newSubscribersThisMonth = 0;

  for (const bundle of bundles) {
    for (const sub of bundle.subscribers) {
      if (sub.status !== "active" && sub.status !== "cancelled") continue;
      totalSubscribers += 1;
      subscribersByClientType[bundle.type] += 1;

      const cyclePrice = bundle.cycles.find((c) => c.cycle === sub.billingCycle)?.price ?? 0;
      earnings += cyclePrice;
      earningsByClientType[bundle.type] += cyclePrice;

      for (const addOn of sub.addOns) {
        earnings += addOn.pricePaid;
        earningsAddOns += addOn.pricePaid;
        earningsByClientType[bundle.type] += addOn.pricePaid;
      }

      if (sub.purchasedAt >= monthStart) {
        newSubscribersThisMonth += 1;
        newSubscribersByClientType[bundle.type] += 1;
      }
    }
  }

  return {
    totalActiveBundles: bundles.filter((b) => b.status === "active").length,
    earnings: roundMoney(earnings),
    earningsByClientType: {
      B2C: roundMoney(earningsByClientType.B2C),
      B2B: roundMoney(earningsByClientType.B2B),
    },
    earningsAddOns: roundMoney(earningsAddOns),
    totalSubscribers,
    subscribersByClientType,
    newSubscribersThisMonth,
    newSubscribersByClientType,
  };
}

export function resolveDiscountStatus(code: DiscountCode, now = new Date()): DiscountStatus {
  if (code.deactivated) return "deactivated";
  const start = new Date(code.startDate);
  const expiry = new Date(code.expiryDate);
  if (now > expiry) return "expired";
  if (now < start) return "scheduled";
  if (code.usageLimit === "max" && code.maxRedemptions != null && code.redemptions.length >= code.maxRedemptions) {
    return "expired";
  }
  if (code.usageLimit === "one_time" && code.redemptions.length >= 1) return "expired";
  return "active";
}

export function generateDiscountCodeString(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function isDiscountCodeTaken(code: string, codes: DiscountCode[], excludeId?: string): boolean {
  const normalized = code.trim().toUpperCase();
  return codes.some((c) => {
    if (c.id === excludeId) return false;
    if (c.code.toUpperCase() !== normalized) return false;
    return resolveDiscountStatus(c) === "active" || resolveDiscountStatus(c) === "scheduled";
  });
}

function seedDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const SEED_BUNDLES: PaymentBundle[] = [
  {
    id: "bundle_career_starter",
    name: "Career Starter",
    description: "Core interview prep for individual candidates.",
    type: "B2C",
    mockInterview: { included: true, quantity: 2, unitPrice: 15 },
    storyboard: { included: true, quantity: 3, unitPrice: 10 },
    masterclass: {
      included: true,
      selections: [
        {
          masterclassId: "mc_resume_101",
          selectedModuleIds: ["mod_r1", "mod_r2", "mod_r3"],
          price: 60,
        },
      ],
    },
    cycles: [
      { cycle: "monthly", price: 114 },
      { cycle: "yearly", price: 1140, priceOverridden: true },
    ],
    status: "active",
    createdAt: seedDate(90),
    updatedAt: seedDate(12),
    subscribers: [
      {
        id: "sub_c1",
        name: "Alex Rivera",
        email: "alex@example.com",
        purchasedAt: seedDate(40),
        billingCycle: "monthly",
        status: "active",
        addOns: [
          {
            id: "ao_1",
            item: "storyboard",
            quantity: 2,
            pricePaid: 24,
            datePurchased: seedDate(10),
          },
        ],
      },
      {
        id: "sub_c2",
        name: "Jordan Lee",
        email: "jordan@example.com",
        purchasedAt: seedDate(5),
        billingCycle: "yearly",
        status: "active",
        addOns: [],
      },
    ],
  },
  {
    id: "bundle_team_growth",
    name: "Team Growth",
    description: "Per-seat B2B bundle for growing teams.",
    type: "B2B",
    mockInterview: { included: true, quantity: 5, unitPrice: 12 },
    storyboard: { included: true, quantity: 10, unitPrice: 8 },
    masterclass: {
      included: true,
      selections: [
        {
          masterclassId: "mc_behavioral",
          selectedModuleIds: ["mod_b1", "mod_b2", "mod_b3"],
          price: 65,
        },
      ],
    },
    cycles: [
      { cycle: "monthly", price: 185 },
      { cycle: "quarterly", price: 500, priceOverridden: true },
      { cycle: "yearly", price: 1800, priceOverridden: true },
    ],
    status: "active",
    createdAt: seedDate(120),
    updatedAt: seedDate(8),
    subscribers: [
      {
        id: "sub_o1",
        name: "Acme Robotics",
        email: "admin@acmerobotics.example",
        purchasedAt: seedDate(60),
        billingCycle: "monthly",
        status: "active",
        addOns: [
          {
            id: "ao_o1",
            item: "mockInterview",
            quantity: 20,
            pricePaid: 280,
            datePurchased: seedDate(3),
          },
        ],
      },
    ],
  },
  {
    id: "bundle_interview_prep_draft",
    name: "Interview Prep Bundle",
    description: "Draft offering for advanced candidates.",
    type: "B2C",
    mockInterview: { included: true, quantity: 4, unitPrice: 15 },
    storyboard: { included: false, quantity: 1, unitPrice: 10 },
    masterclass: { included: false, selections: [] },
    cycles: [{ cycle: "monthly", price: 60 }],
    status: "draft",
    createdAt: seedDate(3),
    updatedAt: seedDate(3),
    subscribers: [],
  },
];

export const SEED_DISCOUNT_CODES: DiscountCode[] = [
  {
    id: "dc_welcome20",
    code: "WELCOME20",
    discountType: "percentage",
    value: 20,
    appliesTo: ["B2C"],
    usageLimit: "max",
    maxRedemptions: 100,
    startDate: seedDate(30).slice(0, 10),
    expiryDate: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      return d.toISOString().slice(0, 10);
    })(),
    deactivated: false,
    createdAt: seedDate(30),
    redemptions: [
      { id: "dr_1", organizationOrUser: "alex@example.com", dateRedeemed: seedDate(20) },
    ],
  },
  {
    id: "dc_team50",
    code: "TEAM50",
    discountType: "fixed",
    value: 50,
    appliesTo: ["B2B"],
    usageLimit: "unlimited",
    maxRedemptions: null,
    startDate: seedDate(60).slice(0, 10),
    expiryDate: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      return d.toISOString().slice(0, 10);
    })(),
    deactivated: false,
    createdAt: seedDate(60),
    redemptions: [
      { id: "dr_2", organizationOrUser: "Acme Robotics", dateRedeemed: seedDate(45) },
    ],
  },
];

/** Org Admin demo subscription — Team Growth monthly. */
export type OrgAdminSubscriptionState = {
  bundleId: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  /** Snapshot of account count at last add-on purchase (for demo messaging). */
  lastAddOnAccountCount?: number;
};

export function defaultOrgAdminSubscription(): OrgAdminSubscriptionState {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return {
    bundleId: "bundle_team_growth",
    billingCycle: "monthly",
    nextBillingDate: next.toISOString().slice(0, 10),
  };
}

export type CandidateSubscriptionStatus = "free" | "active" | "pending_cancel";

export type CandidateSubscriptionState = {
  status: CandidateSubscriptionStatus;
  bundleId: string | null;
  billingCycle: BillingCycle | null;
  nextBillingDate: string | null;
  /** When pending_cancel, access ends on this date. */
  accessEndsAt: string | null;
};

export function defaultCandidateSubscription(): CandidateSubscriptionState {
  return {
    status: "free",
    bundleId: null,
    billingCycle: null,
    nextBillingDate: null,
    accessEndsAt: null,
  };
}

export type CandidateEntitlements = {
  /** One-time free baseline remaining (not renewable). */
  freeMockInterviews: number;
  freeStoryboards: number;
  freeMasterclassModuleIds: string[];
  /** Purchased add-on deltas on top of free or paid bundle. */
  addOnMockInterviews: number;
  addOnStoryboards: number;
  addOnMasterclassModuleIds: string[];
};

export function defaultCandidateEntitlements(): CandidateEntitlements {
  return {
    freeMockInterviews: 1,
    freeStoryboards: 2,
    freeMasterclassModuleIds: ["mod_r1"],
    addOnMockInterviews: 0,
    addOnStoryboards: 0,
    addOnMasterclassModuleIds: [],
  };
}

export function centsFromDollars(dollars: number): number {
  return Math.round(dollars * 100);
}
