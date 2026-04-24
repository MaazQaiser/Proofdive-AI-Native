import { ReportDetailScreen } from "@/app/report/[id]/ui/ReportDetailScreen";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ReportDetailScreen reportId={id} />;
}

