import { AddOrganizationScreen } from "../ui/AddOrganizationScreen";

/** Demo-only full-screen Add Organization wizard.
 * Production CTA on the organizations list opens the modal dialog instead.
 * Visit `/superadmin/organizations/new-demo` to preview this layout.
 */
export default function SuperAdminAddOrganizationDemoPage() {
  return <AddOrganizationScreen />;
}
