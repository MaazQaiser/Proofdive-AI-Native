import { redirect } from "next/navigation";

/** @deprecated Use `/superadmin/organizations/new` */
export default function SuperAdminAddOrganizationDemoPage() {
  redirect("/superadmin/organizations/new");
}
