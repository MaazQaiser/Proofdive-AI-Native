import { SUPER_ADMIN_ORGANIZATIONS } from "@/lib/superAdminOrganizations";

/** Fixed org used by the "Organization Admin login →" demo link, independent of live Super Admin session state. */
const DEMO_ORG_ID = "org_003";

export const ORG_ADMIN_DEMO_ORG =
  SUPER_ADMIN_ORGANIZATIONS.find((org) => org.id === DEMO_ORG_ID) ?? SUPER_ADMIN_ORGANIZATIONS[0];
