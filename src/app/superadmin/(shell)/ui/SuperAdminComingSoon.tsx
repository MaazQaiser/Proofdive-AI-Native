import { Card, CardContent } from "@/components/ui/card";

type Props = {
  title: string;
  description: string;
};

export function SuperAdminComingSoon({ title, description }: Props) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="py-16 text-center">
        <p className="text-overline text-text-secondary">COMING SOON</p>
        <h1 className="mt-3 text-h5 text-text-primary">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-body-sm leading-snug text-text-secondary">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
