import { ReportV2Screen } from "@/app/report/[id]/v2/ui/ReportV2Screen";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ReportV2Screen reportId={id} />;
}
