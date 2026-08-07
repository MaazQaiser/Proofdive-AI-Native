import { AddOrganizationScreen } from "../../ui/AddOrganizationScreen";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { id } = await params;
  const { section } = await searchParams;
  return <AddOrganizationScreen mode="edit" organizationId={id} section={section} />;
}
