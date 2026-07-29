import { DiscountDetailScreen } from "../../ui/DiscountDetailScreen";

export default async function SuperAdminDiscountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DiscountDetailScreen codeId={id} />;
}
