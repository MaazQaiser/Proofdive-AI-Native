import { AddPartnerScreen } from "../../ui/AddPartnerScreen";

export default async function SuperAdminEditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AddPartnerScreen mode="edit" partnerId={id} />;
}
