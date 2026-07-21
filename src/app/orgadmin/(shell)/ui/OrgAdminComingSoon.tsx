import { Card, CardContent } from "@/components/ui/card";

type Props = {
  title: string;
  description: string;
};

export function OrgAdminComingSoon({ title, description }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/coming%20soon%20page.png" alt="" className="h-auto w-56" />
        <p className="mt-6 text-overline text-muted-foreground">COMING SOON</p>
        <h1 className="mt-3 text-h5 text-foreground">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-body-sm leading-snug text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
