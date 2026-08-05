"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/components/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavLink = { type: "link"; href: string; label: string };
type NavGroup = {
  type: "group";
  label: string;
  items: { href: string; label: string }[];
};
type NavItem = NavLink | NavGroup;

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { type: "link", href: "/superadmin/overview", label: "Overview" },
  {
    type: "group",
    label: "Tenants",
    items: [
      { href: "/superadmin/organizations", label: "Organizations" },
      { href: "/superadmin/partners", label: "Partners" },
      { href: "/superadmin/candidates", label: "Candidates" },
    ],
  },
  {
    type: "group",
    label: "Finance",
    items: [
      { href: "/superadmin/payments", label: "Payments" },
      { href: "/superadmin/commissions", label: "Commissions" },
    ],
  },
  { type: "link", href: "/superadmin/competency-engine", label: "Competency Engine" },
  { type: "link", href: "/superadmin/support", label: "Support" },
];

function isPathActive(pathname: string | null, href: string) {
  return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
}

function tabLabelClass(active: boolean) {
  return cn(
    "text-caption inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold whitespace-nowrap transition",
    active ? "text-primary" : "text-foreground/70 hover:text-foreground",
  );
}

function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      className={cn("mt-2 h-[3px] w-full rounded-full", active ? "bg-primary" : "bg-transparent")}
      aria-hidden
    />
  );
}

function NavLinkItem({ href, label, pathname }: { href: string; label: string; pathname: string | null }) {
  const active = isPathActive(pathname, href);
  return (
    <Link href={href} className="flex h-full shrink-0 flex-col items-center justify-between pt-3">
      <span className={tabLabelClass(active)}>{label}</span>
      <NavUnderline active={active} />
    </Link>
  );
}

function NavGroupItem({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { href: string; label: string }[];
  pathname: string | null;
}) {
  const active = items.some((item) => isPathActive(pathname, item.href));

  return (
    <DropdownMenu>
      <div className="flex h-full shrink-0 flex-col items-center justify-between pt-3">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              tabLabelClass(active),
              "outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:text-primary",
            )}
          >
            {label}
            <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <NavUnderline active={active} />
      </div>
      <DropdownMenuContent align="start" className="min-w-[10rem]">
        {items.map((item) => {
          const itemActive = isPathActive(pathname, item.href);
          return (
            <DropdownMenuItem
              key={item.href}
              asChild
              className={cn("font-medium", itemActive && "text-primary")}
            >
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SuperAdminTopNav() {
  const pathname = usePathname();
  return (
    <nav className="flex h-full items-center gap-1 overflow-x-auto" aria-label="Super admin">
      {SUPER_ADMIN_NAV_ITEMS.map((item) =>
        item.type === "link" ? (
          <NavLinkItem key={item.href} href={item.href} label={item.label} pathname={pathname} />
        ) : (
          <NavGroupItem key={item.label} label={item.label} items={item.items} pathname={pathname} />
        ),
      )}
    </nav>
  );
}
