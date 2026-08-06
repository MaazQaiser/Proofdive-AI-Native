/** Shared Terms & Policy update notices for Org Admin (profile + notification inbox). */

export type OrgAdminPolicyUpdate = {
  id: string;
  title: string;
  effectiveDate: string;
  summary: string;
  href: string;
};

export const ORG_ADMIN_POLICY_UPDATES: OrgAdminPolicyUpdate[] = [
  {
    id: "privacy-2026-06",
    title: "Privacy Policy update",
    effectiveDate: "2026-06-15",
    summary:
      "Clarified how organization usage data is aggregated for readiness and competency analytics.",
    href: "/privacy",
  },
  {
    id: "terms-2026-03",
    title: "Terms & Conditions update",
    effectiveDate: "2026-03-01",
    summary: "Added terms covering module add-on purchases and subscription billing cycles.",
    href: "/terms",
  },
];
