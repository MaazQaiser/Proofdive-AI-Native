import { BundleDetailScreen } from "../../ui/BundleDetailScreen";

export default async function SuperAdminBundleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BundleDetailScreen bundleId={id} />;
}
