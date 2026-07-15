import { Card, CardBody } from "@/components/Card";

type Props = {
  title: string;
  description: string;
};

export function SuperAdminComingSoon({ title, description }: Props) {
  return (
    <Card>
      <CardBody className="py-16 text-center">
        <p className="text-[11px] font-bold tracking-[0.2em] text-black/40">COMING SOON</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-black">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-base font-medium leading-snug text-[var(--app-muted)]">
          {description}
        </p>
      </CardBody>
    </Card>
  );
}
