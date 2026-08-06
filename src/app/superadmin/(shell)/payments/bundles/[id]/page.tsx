import { BundleDetailScreen } from "../../ui/BundleDetailScreen";

export default async function SuperAdminBundleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  return <BundleDetailScreen bundleId={id} initialEditing={edit === "1"} />;
}
