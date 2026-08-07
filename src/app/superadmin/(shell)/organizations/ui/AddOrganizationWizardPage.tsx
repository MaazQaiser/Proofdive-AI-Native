"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { COMPETENCY_FRAMEWORKS } from "@/lib/superAdminOrganizationWizard";
import { DEFAULT_FRAMEWORK_ID } from "@/lib/superAdminCompetencyFrameworks";
import type { Organization } from "@/lib/superAdminOrganizations";
import { useCompetencyFrameworks } from "@/lib/useCompetencyFrameworks";
import { useOrganizations } from "@/lib/useOrganizations";

import { AddOrganizationDialog } from "./AddOrganizationDialog";

/** Modal wizard hosted at `/superadmin/organizations/new`. */
export function AddOrganizationWizardPage() {
  const router = useRouter();
  const { existingNames, addOrganization } = useOrganizations();
  const { summaries: frameworks, createClone } = useCompetencyFrameworks();

  function leave() {
    router.push("/superadmin/organizations");
  }

  function handleCreate(org: Organization) {
    addOrganization(org);
    toast.success(
      `"${org.name}" was created and an invitation was sent to the Organization Admin.`,
    );
    leave();
  }

  return (
    <AddOrganizationDialog
      open
      onOpenChange={(open) => {
        if (!open) leave();
      }}
      existingOrganizationNames={existingNames}
      frameworks={frameworks.length > 0 ? frameworks : COMPETENCY_FRAMEWORKS}
      onCreateFramework={(name) => {
        const created = createClone(DEFAULT_FRAMEWORK_ID, name);
        if (!created) {
          toast.error("Could not create competency framework clone.");
          return null;
        }
        toast.success(`Draft framework "${created.name}" created.`);
        return {
          id: created.id,
          name: created.name,
          isDefault: created.isDefault,
        };
      }}
      onCreate={handleCreate}
    />
  );
}
