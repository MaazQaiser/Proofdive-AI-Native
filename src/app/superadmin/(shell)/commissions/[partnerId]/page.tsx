import { CommissionDetailScreen } from "./ui/CommissionDetailScreen";

export default async function SuperAdminCommissionDetailPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  return <CommissionDetailScreen partnerId={partnerId} />;
}
