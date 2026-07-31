import { SUPER_ADMIN_PARTNERS } from "@/lib/superAdminPartners";

/** Fixed partner used by the "Partner login →" demo link. */
const DEMO_PARTNER_ID = "partner_001";

export const PARTNER_DEMO =
  SUPER_ADMIN_PARTNERS.find((p) => p.id === DEMO_PARTNER_ID) ?? SUPER_ADMIN_PARTNERS[0];

export const PARTNER_DEMO_ID = PARTNER_DEMO.id;
