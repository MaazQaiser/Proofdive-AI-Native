import { Card, CardBody } from "@/components/Card";

type Props = {
  title: string;
  description: string;
};

export function SuperAdminComingSoon({ title, description }: Props) {
  return (
    <Card>
      <CardBody className="py-16 text-center">
        <p className="text-overline text-black/40">COMING SOON</p>
        <h1 className="mt-3 text-h5 text-black">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-body-sm leading-snug text-[var(--app-muted)]">
          {description}
        </p>
      </CardBody>
    </Card>
  );
}
