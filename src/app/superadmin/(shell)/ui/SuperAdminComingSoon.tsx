import { Card, CardContent } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";

type Props = {
  title: string;
  description: string;
};

export function SuperAdminComingSoon({ title, description }: Props) {
  return (
    <Card className="mt-6 gap-0 py-0">
      <CardContent className="py-16 text-center">
        <p className="text-overline text-text-secondary">COMING SOON</p>
        <PageTitle className="mt-3">{title}</PageTitle>
        <p className="mx-auto mt-2 max-w-md text-body-sm leading-snug text-text-secondary">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
