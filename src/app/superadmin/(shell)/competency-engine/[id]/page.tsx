import { FrameworkDetailScreen } from "./ui/FrameworkDetailScreen";

export default async function SuperAdminCompetencyFrameworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FrameworkDetailScreen frameworkId={id} />;
}
