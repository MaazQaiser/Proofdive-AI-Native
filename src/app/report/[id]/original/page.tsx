import { ReportDetailScreenOriginal } from "@/app/report/[id]/original/ui/ReportDetailScreenOriginal";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ReportDetailScreenOriginal reportId={id} />;
}
