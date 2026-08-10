"use client";

import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BookOpen, ChevronRight, Download, Eye, EyeOff, Info, Mic, MicOff, SquarePen, Play, Plus, UserCheck, Video, VideoOff, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardNested,
} from "@/components/ui/card";
import { CardButton } from "@/components/ui/card-button";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { Disclosure } from "@/app/superadmin/(shell)/competency-engine/ui/Disclosure";
import { GoogleIcon, LinkedInIcon } from "@/components/icons/SocialIcons";
import {
  Card as AppCard,
  CardBody as AppCardBody,
  GlassCard,
  NestedCard,
} from "@/components/Card";
import { Chatbox } from "@/components/ui/chatbox";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, type LogoSize } from "@/components/ui/logo";
import { LogoLoader } from "@/components/ui/logo-loader";
import { MediaListItem } from "@/components/ui/media-list-item";
import { PixelMedia } from "@/components/ui/pixel-media";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SelectionChip } from "@/components/ui/selection-chip";
import {
  SuccessDriverCard,
  SuccessDriverMark,
} from "@/components/ui/success-driver-card";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
} from "@/lib/successDrivers";
import { SCORING_PALETTE, scoringBadgeClass, scoringTextClass } from "@/lib/scoringPalette";
import { cn } from "@/lib/utils";

const CHIP_OPTIONS = ["Product Designer", "UX Researcher", "UI Engineer"];

type PairToken = {
  title: string;
  bgVar: string;
  fgVar: string;
  light: { bg: string; fg: string };
  dark: { bg: string; fg: string };
};

const PAIR_TOKENS: PairToken[] = [
  {
    title: "Background",
    bgVar: "--background",
    fgVar: "--foreground",
    light: { bg: "#F5F5F3", fg: "#0E0E0E" },
    dark: { bg: "#0E0E0E", fg: "#F5F5F5" },
  },
  {
    title: "Card",
    bgVar: "--card",
    fgVar: "--card-foreground",
    light: { bg: "#FFFFFF", fg: "#0E0E0E" },
    dark: { bg: "#01161B", fg: "#22D3EE" },
  },
  {
    title: "Popover",
    bgVar: "--popover",
    fgVar: "--popover-foreground",
    light: { bg: "#FFFFFF", fg: "#0E0E0E" },
    dark: { bg: "#042027", fg: "#22D3EE" },
  },
  {
    title: "Primary",
    bgVar: "--primary",
    fgVar: "--primary-foreground",
    light: { bg: "#0E9AB5", fg: "#F5F5F5" },
    dark: { bg: "#22D3EE", fg: "#0E0E0E" },
  },
  {
    title: "Secondary",
    bgVar: "--secondary",
    fgVar: "--secondary-foreground",
    light: { bg: "#B9EFF4", fg: "#073E4C" },
    dark: { bg: "#042027", fg: "#22D3EE" },
  },
  {
    title: "Muted",
    bgVar: "--muted",
    fgVar: "--muted-foreground",
    light: { bg: "#E8E8E6", fg: "#6B7280" },
    dark: { bg: "#01161B", fg: "#9CA3AF" },
  },
  {
    title: "Accent",
    bgVar: "--accent",
    fgVar: "--accent-foreground",
    light: { bg: "#22D3EE", fg: "#062C35" },
    dark: { bg: "#00A8B9", fg: "#F5F5F5" },
  },
  {
    title: "Destructive",
    bgVar: "--destructive",
    fgVar: "--destructive-foreground",
    light: { bg: "#CB3A31", fg: "#F5F5F3" },
    dark: { bg: "#CB3A31", fg: "#F5F5F5" },
  },
];

type FlatToken = {
  name: string;
  cssVar: string;
  light: string;
  dark: string;
};

const STRUCTURAL_TOKENS: FlatToken[] = [
  { name: "border", cssVar: "--border", light: "#D4D4D2", dark: "#2A2A2A" },
  { name: "input", cssVar: "--input", light: "#D4D4D2", dark: "#2A2A2A" },
  { name: "ring", cssVar: "--ring", light: "#0E9AB5", dark: "#22D3EE" },
  { name: "base", cssVar: "--base", light: "#F5F5F3", dark: "#0E0E0E" },
  { name: "surface", cssVar: "--surface", light: "#E8E8E6", dark: "#1A1A1A" },
  { name: "text-primary", cssVar: "--text-primary", light: "#0E0E0E", dark: "#F5F5F5" },
  { name: "text-secondary", cssVar: "--text-secondary", light: "#6B7280", dark: "#9CA3AF" },
  { name: "placeholder", cssVar: "--placeholder", light: "#999999", dark: "#9CA3AF" },
];

const EXTENDED_TOKENS: FlatToken[] = [
  { name: "extended-light-cyan", cssVar: "--extended-light-cyan", light: "#B9EFF4", dark: "#B9EFF4" },
  { name: "extended-cyan", cssVar: "--extended-cyan", light: "#00A8B9", dark: "#00A8B9" },
  { name: "extended-blue", cssVar: "--extended-blue", light: "#006F8F", dark: "#006F8F" },
  { name: "extended-green", cssVar: "--extended-green", light: "#C7DCD5", dark: "#C7DCD5" },
  { name: "extended-green-blue", cssVar: "--extended-green-blue", light: "#073E4C", dark: "#073E4C" },
  { name: "extended-cyan-green", cssVar: "--extended-cyan-green", light: "#062C35", dark: "#062C35" },
  { name: "extended-dark-cyan-green", cssVar: "--extended-dark-cyan-green", light: "#042027", dark: "#042027" },
  { name: "extended-dark-cyan", cssVar: "--extended-dark-cyan", light: "#01161B", dark: "#01161B" },
];

const BRAND_TOKENS: FlatToken[] = [
  { name: "brand-100", cssVar: "--brand-100", light: "#0E9AB5", dark: "#22D3EE" },
  { name: "brand-200", cssVar: "--brand-200", light: "#26A4BC", dark: "#1FBED6" },
  { name: "brand-300", cssVar: "--brand-300", light: "#3EAEC4", dark: "#1BA9BE" },
  { name: "brand-400", cssVar: "--brand-400", light: "#56B8CB", dark: "#1894A7" },
  { name: "brand-500", cssVar: "--brand-500", light: "#6EC2D3", dark: "#147F8F" },
  { name: "brand-600", cssVar: "--brand-600", light: "#87CDDA", dark: "#116A77" },
  { name: "brand-700", cssVar: "--brand-700", light: "#9FD7E1", dark: "#0E545F" },
  { name: "brand-800", cssVar: "--brand-800", light: "#B7E1E9", dark: "#0A3F47" },
  { name: "brand-900", cssVar: "--brand-900", light: "#CFEBF0", dark: "#072A30" },
  { name: "brand-1000", cssVar: "--brand-1000", light: "#E7F5F8", dark: "#031518" },
];

type TypeStyle = {
  key: string;
  className: string;
  label: string;
  size: string;
  weight: string;
  tracking: string;
  /** Defaults to text-foreground when omitted. */
  colorClassName?: string;
  note?: string;
};

const TYPE_STYLES: TypeStyle[] = [
  {
    key: "h1",
    className: "text-h1",
    label: "H1",
    size: "40px",
    weight: "500",
    tracking: "-0.8px",
    note: "Reuses the Agent heading style below (same size/weight/tracking, but text-foreground instead of text-heading-teal).",
  },
  { key: "h2", className: "text-h2", label: "H2", size: "32px", weight: "500", tracking: "-2px" },
  { key: "h3", className: "text-h3", label: "H3", size: "24px", weight: "500", tracking: "-1.5px" },
  { key: "h4", className: "text-h4", label: "H4", size: "20px", weight: "500", tracking: "-1.2px" },
  { key: "h5", className: "text-h5", label: "H5", size: "16px", weight: "500", tracking: "-0.8px", note: "Super Admin page titles via PageTitle (Overview, Organizations, breadcrumb current titles, etc.)." },
  { key: "h6", className: "text-h6", label: "H6", size: "14px", weight: "500", tracking: "-0.5px" },
  {
    key: "subheading",
    className: "text-subheading",
    label: "Subheading",
    size: "36px",
    weight: "400",
    tracking: "-1.44px",
  },
  {
    key: "body-lg",
    className: "text-body-lg",
    label: "Body LG",
    size: "20px",
    weight: "400",
    tracking: "-1px",
  },
  {
    key: "body",
    className: "text-body",
    label: "Body",
    size: "18px",
    weight: "400",
    tracking: "-1px",
    note: "--text-body-paragraph-spacing (18px) also exists but isn't baked into this utility. Apply it explicitly where paragraph rhythm is needed.",
  },
  {
    key: "body-sm",
    className: "text-body-sm",
    label: "Body SM",
    size: "16px",
    weight: "400",
    tracking: "0px",
  },
  {
    key: "caption",
    className: "text-caption",
    label: "Caption",
    size: "14px",
    weight: "400",
    tracking: "0px",
  },
  {
    key: "overline",
    className: "text-overline",
    label: "Overline",
    size: "12px",
    weight: "500",
    tracking: "0.5px",
  },
  {
    key: "agent-heading",
    className: "text-agent-heading",
    label: "Agent heading",
    size: "40px",
    weight: "500",
    tracking: "-0.8px",
    colorClassName: "text-heading-teal",
    note: "Big greeting headline — used by onboarding's agent prompt and the Coach dashboard hero. Always paired with text-heading-teal (#094149), not text-foreground.",
  },
  {
    key: "agent-question",
    className: "text-agent-question",
    label: "Agent question",
    size: "28px",
    weight: "500",
    tracking: "-0.56px",
    note: "The question/subtext line beneath an agent heading. Pairs with text-text-primary.",
  },
];

const LOGO_SCALE: { key: LogoSize; label: string; cssVar: string; px: string }[] = [
  { key: "xxl", label: "logo-xxl", cssVar: "--logo-xxl", px: "80px" },
  { key: "xl", label: "logo-xl", cssVar: "--logo-xl", px: "72px" },
  { key: "lg", label: "logo-lg", cssVar: "--logo-lg", px: "64px" },
  { key: "md", label: "logo-md", cssVar: "--logo-md", px: "56px" },
  { key: "sm", label: "logo-sm", cssVar: "--logo-sm", px: "48px" },
  { key: "xs", label: "logo-xs", cssVar: "--logo-xs", px: "40px" },
  { key: "xxs", label: "logo-xxs", cssVar: "--logo-xxs", px: "32px" },
];

const LOGO_SVG_PATH = "/brand/logo.svg";

function PairSwatch({ token, dark }: { token: PairToken; dark: boolean }) {
  const values = dark ? token.dark : token.light;
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-20 items-center justify-center rounded-lg border border-border text-caption font-semibold"
        style={{ background: `var(${token.bgVar})`, color: `var(${token.fgVar})` }}
      >
        {token.title}
      </div>
      <div className="text-caption">
        <p className="font-medium text-foreground">{token.title}</p>
        <p className="text-muted-foreground">
          {token.bgVar} <span className="text-foreground/70">{values.bg}</span>
        </p>
        <p className="text-muted-foreground">
          {token.fgVar} <span className="text-foreground/70">{values.fg}</span>
        </p>
      </div>
    </div>
  );
}

function FlatSwatch({ token, dark }: { token: FlatToken; dark: boolean }) {
  const hex = dark ? token.dark : token.light;
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 w-full rounded-lg border border-border"
        style={{ background: `var(${token.cssVar})` }}
      />
      <div className="text-caption">
        <p className="font-medium text-foreground">{token.name}</p>
        <p className="text-muted-foreground">{token.cssVar}</p>
        <p className="text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-h5 text-foreground">{title}</h2>
        {description ? (
          <p className="text-body-sm text-muted-foreground mt-1">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Pillar picker toggle card — recreated from InterviewScreen.tsx's competency-area
 * picker (border + tinted bg swap on selection, no separate shadcn component backs it). */
function PillarToggleDemo() {
  const [on, setOn] = useState(true);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left text-caption font-semibold transition",
        on
          ? "border-extended-cyan-green bg-[color-mix(in_srgb,var(--extended-cyan-green)_9%,white)] text-extended-cyan-green"
          : "border-border bg-card text-text-primary hover:bg-muted",
      )}
    >
      <span className="block text-overline text-current opacity-70">
        {on ? "Selected" : "Tap to add"}
      </span>
      <span className="mt-2 block text-body-sm">Product Thinking</span>
    </button>
  );
}

/** Mic/cam toggle — recreated from InterviewLiveScreen.tsx. State is communicated by a
 * background-color swap (not just an icon swap): off = destructive fill. */
function MicCamToggleDemo() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 px-3 py-3">
      <IconButton
        variant="ghost"
        size="xl"
        onClick={() => setMicOn((v) => !v)}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        className={cn(
          micOn
            ? "bg-card/60 text-foreground hover:bg-card/80"
            : "bg-destructive/90 text-destructive-foreground hover:bg-destructive",
        )}
      >
        {micOn ? <Mic /> : <MicOff />}
      </IconButton>
      <IconButton
        variant="ghost"
        size="xl"
        onClick={() => setCamOn((v) => !v)}
        aria-label={camOn ? "Turn camera off" : "Turn camera on"}
        className={cn(
          camOn
            ? "bg-card/60 text-foreground hover:bg-card/80"
            : "bg-destructive/90 text-destructive-foreground hover:bg-destructive",
        )}
      >
        {camOn ? <Video /> : <VideoOff />}
      </IconButton>
    </div>
  );
}

/** Bare icon button + CSS-only hover tooltip — recreated from CoachHome.tsx's
 * PillarInfoIcon and CoachFloatingNav.tsx's nav rail. Two independent, near-identical
 * hand-rolled implementations of this idiom exist today; no shared Tooltip primitive. */
function InfoTooltipIconDemo() {
  return (
    <button
      type="button"
      className="group relative inline-flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-label="What is this score?"
    >
      <Info className="h-4 w-4 shrink-0" />
      <span
        className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max max-w-[240px] -translate-x-1/2 whitespace-normal rounded-xl bg-foreground px-3 py-2 text-caption leading-4 text-background opacity-0 transition group-hover:opacity-100"
        role="tooltip"
      >
        Blended from your last 3 interview attempts.
      </span>
    </button>
  );
}

export default function DesignSystemPage() {
  const [dark, setDark] = useState(false);
  const [selectedChip, setSelectedChip] = useState(CHIP_OPTIONS[0]);
  const [chatValue, setChatValue] = useState("");
  const [chatCompactValue, setChatCompactValue] = useState("");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [askActive, setAskActive] = useState(false);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className={cn(dark && "dark")}>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="mx-auto max-w-6xl space-y-16 px-6 py-12">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-overline text-muted-foreground">Design system</p>
              <h1 className="text-h2 text-foreground">ProofDive Foundation</h1>
              <p className="text-body text-muted-foreground mt-2 max-w-2xl">
                Color tokens and typography from the Figma design foundation, plus a
                first pass of shadcn/ui components wired to them. Not linked from any
                nav. Bookmark <code className="text-body-sm">/design-system</code>.
              </p>
            </div>
            <Button variant="outline" onClick={() => setDark((v) => !v)}>
              {dark ? "Switch to light" : "Switch to dark"}
            </Button>
          </header>

          <Section
            title="Semantic colors"
            description="Paired background / foreground tokens, shadcn's core convention."
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {PAIR_TOKENS.map((token) => (
                <PairSwatch key={token.title} token={token} dark={dark} />
              ))}
            </div>
          </Section>

          <Section title="Structural tokens" description="Borders, ring, surfaces, and text colors.">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {STRUCTURAL_TOKENS.map((token) => (
                <FlatSwatch key={token.name} token={token} dark={dark} />
              ))}
            </div>
          </Section>

          <Section title="Extended palette">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {EXTENDED_TOKENS.map((token) => (
                <FlatSwatch key={token.name} token={token} dark={dark} />
              ))}
            </div>
          </Section>

          <Section title="Brand scale" description="brand-100 (strongest) through brand-1000 (faintest).">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {BRAND_TOKENS.map((token) => (
                <FlatSwatch key={token.name} token={token} dark={dark} />
              ))}
            </div>
          </Section>

          <Section
            title="Scoring Palette"
            description="Brand score bands (1.0–5.0). Use bright --scoring-* for fills/bars/charts; use --scoring-*-fg (via scoringTextClass / scoringBadgeClass) for numbers and pill labels so text stays ≥4.5:1 on light surfaces."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SCORING_PALETTE.map((entry) => (
                <div
                  key={entry.band}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className={cn("text-h4 tabular-nums", scoringTextClass(entry.min))}>
                        {entry.range}
                      </p>
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-caption",
                          scoringBadgeClass(entry.min),
                        )}
                      >
                        {entry.label}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div
                        className="size-14 rounded-lg"
                        style={{ background: `var(${entry.cssVar})` }}
                        title={`${entry.token} fill`}
                        aria-hidden
                      />
                      <div
                        className="size-8 rounded-md border border-border"
                        style={{ background: `var(${entry.fgCssVar})` }}
                        title={`${entry.fgToken} text`}
                        aria-hidden
                      />
                    </div>
                  </div>
                  <div className="border-t border-border px-4 py-3 text-caption text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      <span>
                        Fill <span className="font-mono text-foreground">{entry.token}</span>{" "}
                        <span className="font-mono">{entry.hex}</span>
                      </span>
                      <span>
                        Text <span className="font-mono text-foreground">{entry.fgToken}</span>{" "}
                        <span className="font-mono">{entry.fgHex}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-border p-4">
              <p className="text-caption text-muted-foreground">
                Sample score numbers (readable `-fg` on card)
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-8">
                {[2.1, 3.0, 3.9, 4.7].map((score) => (
                  <div key={score} className="text-center">
                    <span
                      className={cn(
                        "font-gilroy text-[2.5rem] font-normal leading-none tabular-nums",
                        scoringTextClass(score),
                      )}
                    >
                      {score.toFixed(1)}
                    </span>
                    <p className="mt-1 text-overline text-muted-foreground">
                      {SCORING_PALETTE.find((e) => score >= e.min && score <= e.maxInclusive)?.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section
            title="Success Drivers"
            description="Four brand pillars sharing one symbol color (#062C35). Use SuccessDriverIcon beside headings, SuccessDriverMark for labeled rows, and SuccessDriverCard for glass surfaces with a right-side blurred symbol."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SUCCESS_DRIVER_ORDER.map((id) => {
                const meta = SUCCESS_DRIVERS[id];
                return (
                  <div key={id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-xl border border-extended-cyan-green/20 bg-extended-cyan-green/10">
                        <SuccessDriverIcon
                          driver={id}
                          className="size-5 text-extended-cyan-green"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-caption font-semibold text-foreground">
                          {meta.shortLabel}
                        </p>
                        <p className="truncate text-overline text-muted-foreground">
                          {meta.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {SUCCESS_DRIVER_ORDER.map((id) => (
                <SuccessDriverCard
                  key={id}
                  driver={id}
                  badge={SUCCESS_DRIVERS[id].shortLabel}
                >
                  <SuccessDriverMark driver={id} className="text-body-sm" />
                  <p className="text-caption leading-5 text-text-secondary">
                    {SUCCESS_DRIVERS[id].description}
                  </p>
                </SuccessDriverCard>
              ))}
            </div>
          </Section>

          <Separator />

          <Section
            title="Typography"
            description="Each text-{style} utility applies size, weight, and tracking together."
          >
            <div className="space-y-6">
              {TYPE_STYLES.map((style) => (
                <div key={style.key} className="border-b border-border pb-6 last:border-b-0">
                  <p className={cn(style.className, style.colorClassName ?? "text-foreground")}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-caption text-muted-foreground mt-2">
                    <span className="font-semibold text-foreground">{style.label}</span>{" "}
                    · size {style.size} · weight {style.weight} · tracking {style.tracking}
                  </p>
                  {style.note ? (
                    <p className="text-caption text-muted-foreground mt-1">{style.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>

          <Separator />

          <Section
            title="Logo"
            description="Logo scale (logo-xxl down to logo-xxs) plus the source SVG for the dev team."
          >
            <Card>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-end gap-6 rounded-lg border border-border bg-white p-6">
                  {LOGO_SCALE.map((step) => (
                    <div key={step.key} className="flex flex-col items-center gap-2">
                      <Logo size={step.key} />
                      <p className="text-caption text-muted-foreground text-center">
                        {step.label}
                        <br />
                        {step.px}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-body-sm text-muted-foreground">
                    {LOGO_SVG_PATH} · --logo-min-height 32px · --logo-max-height 80px
                  </p>
                  <Button asChild>
                    <a href={LOGO_SVG_PATH} download="proofdive-logo.svg">
                      <Download />
                      Download SVG
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Section>

          <Separator />

          <Section
            title="Logo loader"
            description="Indeterminate brand-mark loader (loops continuously): full rotation, cubes cross-swap, then another rotation. src/components/ui/logo-loader.tsx — design-system demo only; not wired into product flows yet."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="overflow-hidden bg-black text-white">
                <CardHeader>
                  <CardTitle className="text-white">Dark surface</CardTitle>
                  <CardDescription className="text-white/70">
                    text-primary on black — matches the teal mark treatment
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                  <LogoLoader className="h-20" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Light surface</CardTitle>
                  <CardDescription>
                    Same loader on the default card background
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                  <LogoLoader className="h-20" />
                </CardContent>
              </Card>
            </div>
          </Section>

          <Separator />

          <Section
            title="Fonts"
            description="--font-sans (Inter) is the only typeface used across the application."
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Inter, font-sans</CardTitle>
                <CardDescription>Headings, body copy, UI text, wordmark</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-body-lg">Turn experience into proof.</p>
              </CardContent>
            </Card>
          </Section>

          <Separator />

          <Section
            title="Components"
            description="A first pass of shadcn/ui components, sanity-checked against the new tokens."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>
                    src/components/ui/button.tsx — every variant, size, state, and icon
                    placement actually used across the app. This is now the app&apos;s
                    only button component: the separate pill-shaped Button
                    (src/components/Button.tsx, previously shown below as &quot;App
                    buttons&quot;) had zero real call sites and has been removed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-caption font-medium text-muted-foreground">
                      Variants (default state)
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button>Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="link">Link</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-caption font-medium text-muted-foreground">
                      Disabled state — every variant
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button disabled>Default</Button>
                      <Button variant="secondary" disabled>
                        Secondary
                      </Button>
                      <Button variant="outline" disabled>
                        Outline
                      </Button>
                      <Button variant="ghost" disabled>
                        Ghost
                      </Button>
                      <Button variant="destructive" disabled>
                        Destructive
                      </Button>
                      <Button variant="link" disabled>
                        Link
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-caption font-medium text-muted-foreground">
                      Sizes — sm / default / lg / icon
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="icon" variant="outline" aria-label="Edit">
                        <SquarePen />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="More actions">
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-caption font-medium text-muted-foreground">
                      Icon placement — leading, trailing, icon-only
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button>
                        <Plus />
                        Add another email
                      </Button>
                      <Button variant="outline">
                        <SquarePen />
                        Edit
                      </Button>
                      <Button variant="destructive">
                        <X />
                        Remove
                      </Button>
                      <Button variant="link">
                        See all
                        <ArrowUpRight />
                      </Button>
                      <Button size="icon" aria-label="Add">
                        <Plus />
                      </Button>
                      <Button onClick={() => {}} className="pl-4! pr-2!">
                        Confirm selection
                        <ArrowRight />
                      </Button>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      Icon always leads the label — the one real trailing-icon exception is
                      CoreFourSelectionPanel.tsx&apos;s &quot;Confirm selection{" "}
                      <ArrowRight className="inline size-3.5" />
                      &quot; (last button above). Leading icons get 8px/16px padding
                      automatically via <code>has-[&gt;svg:first-child]</code>, but CSS can&apos;t
                      also auto-detect a trailing icon: when the icon is the button&apos;s
                      only element child, it matches <em>both</em>{" "}
                      <code>:first-child</code> and <code>:last-child</code> at once (a plain
                      text label doesn&apos;t count as a sibling element), so position alone
                      can&apos;t tell leading from trailing. Trailing-icon buttons need an
                      explicit <code>pl-4! pr-2!</code> override (Tailwind&apos;s important
                      modifier — a plain override loses to the <code>:has()</code>{" "}
                      selector&apos;s higher specificity).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-caption font-medium text-muted-foreground">
                      asChild — button styling on a real link (the sanctioned way to make a
                      link look like a button; never wrap a real <code>Button</code> in a
                      <code>Link</code>)
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button asChild>
                        <Link href="/design-system">Go to dashboard</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/design-system">
                          <Download />
                          Export
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>All variants</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Form controls</CardTitle>
                  <CardDescription>Input, label, select</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ds-email">Email</Label>
                    <Input id="ds-email" type="email" placeholder="you@proofdive.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ds-role">Role</Label>
                    <Select defaultValue="candidate">
                      <SelectTrigger id="ds-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candidate">Candidate</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tabs & avatar</CardTitle>
                  <CardDescription>Grouped navigation and identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="text-body-sm text-muted-foreground pt-2">
                      Overview content.
                    </TabsContent>
                    <TabsContent value="details" className="text-body-sm text-muted-foreground pt-2">
                      Details content.
                    </TabsContent>
                  </Tabs>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <span className="text-body-sm">ProofDive User</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Separator />

          <Section
            title="Surfaces & elevation"
            description="No drop shadows anywhere in the app. Elevation is communicated with a hairline border, and hierarchy inside a surface comes from nesting a flatter card inside it — not from a shadow."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Card + CardNested</CardTitle>
                  <CardDescription>shadcn/ui side — src/components/ui/card.tsx</CardDescription>
                </CardHeader>
                <CardContent>
                  <CardNested className="p-4">
                    <p className="text-body-sm font-medium text-foreground">Nested surface</p>
                    <p className="text-caption text-muted-foreground mt-1">
                      bg-surface + border-border. One flat step down from the card, no shadow.
                    </p>
                  </CardNested>
                </CardContent>
              </Card>

              <AppCard>
                <AppCardBody>
                  <p className="text-overline text-[var(--app-muted)]">App card + Nested card</p>
                  <p className="mt-1 text-body-sm font-medium">
                    Custom system — src/components/Card.tsx
                  </p>
                  <NestedCard className="mt-4 p-4">
                    <p className="text-caption font-semibold text-gray-900">Nested surface</p>
                    <p className="text-caption text-[var(--app-muted)] mt-1">
                      --app-surface-nested + --app-hairline border. Used for score rows, quiz
                      options, and section headers inside a Card (see Storyboard and Training).
                    </p>
                  </NestedCard>
                  <p className="mt-4 text-caption text-[var(--app-muted)]">
                    Light-mode only — the --app-* tokens have no .dark override yet, unlike the
                    shadcn tokens above, so this card stays light when you toggle dark mode.
                  </p>
                </AppCardBody>
              </AppCard>

              <div className="rounded-lg bg-[linear-gradient(135deg,var(--brand-100),var(--brand-500))] p-6 lg:col-span-2">
                <GlassCard className="p-6">
                  <p className="text-overline text-[var(--app-muted)]">Glass card</p>
                  <p className="mt-1 text-body-sm">
                    Frosted/translucent variant for surfaces over a photo or colored background
                    (shown here on a brand-gradient backdrop). Border-only, no shadow — same rule
                    as every other surface.
                  </p>
                </GlassCard>
              </div>
            </div>
          </Section>

          <Separator />

          <Section
            title="Onboarding components"
            description="Pixel-exact ports of the Figma 'Components' section (node 38:55), for the onboarding flow redesign."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Icon button</CardTitle>
                  <CardDescription>
                    Solid and ghost, default / disabled / pressed — src/components/ui/icon-button.tsx
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <IconButton aria-label="Send">
                    <ArrowUp />
                  </IconButton>
                  <IconButton aria-label="Send" disabled>
                    <ArrowUp />
                  </IconButton>
                  <IconButton variant="ghost" aria-label="Record">
                    <ArrowUp />
                  </IconButton>
                  <IconButton variant="ghost" aria-label="Record" disabled>
                    <ArrowUp />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    aria-label="Mute microphone (pressed/on)"
                    aria-pressed
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Mic />
                  </IconButton>
                  <p className="basis-full text-caption text-muted-foreground">
                    Pressed state (last icon) is a manual className override in
                    chatbox.tsx/ChatComposer.tsx today, not a variant on IconButton itself.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Selection chip</CardTitle>
                  <CardDescription>
                    Default, hover (try it), selected. Default stroke is solid
                    #adddda (no gradient). Text-only uses 16px horizontal
                    padding. With a leading icon: 8px left / 16px right. With a
                    trailing icon: 16px left / 8px right.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {CHIP_OPTIONS.map((option) => (
                      <SelectionChip
                        key={option}
                        selected={selectedChip === option}
                        onClick={() => setSelectedChip(option)}
                      >
                        {option}
                      </SelectionChip>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <SelectionChip>
                      <SquarePen className="size-4" />
                      Edit
                    </SelectionChip>
                    <SelectionChip selected>
                      <SquarePen className="size-4" />
                      Edit
                    </SelectionChip>
                    <SelectionChip>
                      Use this draft
                      <ArrowRight className="size-4" />
                    </SelectionChip>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Chatbox</CardTitle>
                  <CardDescription>
                    Figma Chatbox (333:7350) — Compact pill and Expanded
                    rounded-20 shell. Stroke, padding, shadow, and send size
                    come from globals.css. Upload · Ask · Mic · Send.
                    Attachments and Ask force Expanded.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="text-overline text-text-secondary">Compact</div>
                    <Chatbox
                      variant="compact"
                      value={chatCompactValue}
                      onValueChange={setChatCompactValue}
                      onSend={() => setChatCompactValue("")}
                      onUploadClick={() => undefined}
                      askAction={{
                        isActive: false,
                        label: "Ask",
                        onToggle: () => undefined,
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-overline text-text-secondary">Expanded</div>
                    <Chatbox
                      variant="expanded"
                      value={chatValue}
                      onValueChange={setChatValue}
                      onSend={() => setChatValue("")}
                      attachedFileName={attachedFileName}
                      onUploadClick={() => setAttachedFileName("Job Description.pdf")}
                      onRemoveFile={() => setAttachedFileName(null)}
                      askAction={{
                        isActive: askActive,
                        label: "Ask",
                        onToggle: () => setAskActive((v) => !v),
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Card button</CardTitle>
                  <CardDescription>
                    Module CTAs — glass fill, diagonal arrow, blurred corner symbol.
                    Primary (teal) and gray (frosted) variants share one component.
                    Title uses <code>text-body-lg</code> (20px semibold); subtitle uses{" "}
                    <code>text-caption</code> (14px).
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <CardButton
                    className="max-w-[280px]"
                    variant="primary"
                    icon={<BookOpen />}
                    title="Storyboard"
                    subtitle="Build your career storyboard"
                    illustrationSrc="/brand/illustration-1.svg"
                  />
                  <CardButton
                    className="max-w-[280px]"
                    variant="gray"
                    icon={<UserCheck />}
                    title="Mock interview"
                    subtitle="Practice for this role"
                    illustrationSrc="/brand/illustration-4.svg"
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Media list item</CardTitle>
                  <CardDescription>
                    Video / chapter rows — play icon on the stepped thumbnail; duration
                    as plain text on the right (never overlaid on the thumb).
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="rounded-[20px] border border-brand-800 bg-[linear-gradient(90deg,var(--brand-1000),#fff_48%)] px-4 py-4">
                    <MediaListItem
                      imageUrl="/brand/training-campaign-1.png"
                      title="1. Thinking"
                      summary="Clarity, structure, tradeoffs, and judgment."
                      duration="28 min"
                    />
                  </div>
                  <div className="rounded-[20px] border border-border bg-white px-4 py-4">
                    <MediaListItem
                      imageUrl="/brand/training-campaign-2.png"
                      title="2. Action"
                      summary="Prioritization, execution, and follow-through."
                      duration="30 min"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <PixelMedia
                      src="/brand/training-campaign-3.png"
                      className="h-14 w-16 rounded-xl"
                    />
                    <span className="text-caption text-text-secondary">
                      PixelMedia alone (play affordance, no duration overlay)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Separator />

          <Section
            title="Buttons — other patterns in use"
            description="Every remaining button shape found across the app that isn't a plain shadcn Button/IconButton/CardButton call — mostly one-off <button> elements. Shown here as reference so real usages can be checked and repadded against a single source, not refactored into new components yet."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Toggle / segmented control</CardTitle>
                  <CardDescription>
                    DateRangeFilter (real component) — src/components/dashboard/DateRangeFilter.tsx
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DateRangeFilter
                    value={dateRange}
                    onChange={setDateRange}
                    options={[
                      { value: "7d", label: "7 days" },
                      { value: "30d", label: "30 days" },
                      { value: "90d", label: "90 days" },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Selection / pillar toggle card</CardTitle>
                  <CardDescription>
                    Recreated from InterviewScreen.tsx — border + tinted-bg swap, click to
                    toggle
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <PillarToggleDemo />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mic / camera toggle</CardTitle>
                  <CardDescription>
                    Recreated from InterviewLiveScreen.tsx — off-state is a color fill, not
                    just an icon swap. Click to toggle.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MicCamToggleDemo />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Circular play button</CardTitle>
                  <CardDescription>
                    TrainingChapterOneJourney.tsx — now <code>IconButton</code> variant
                    =&quot;solid&quot; size=&quot;2xl&quot; (64px), over a video thumbnail
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <IconButton variant="solid" size="2xl" aria-label="Play video">
                    <Play className="ml-1" fill="currentColor" />
                  </IconButton>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Circular dismiss / close buttons</CardTitle>
                  <CardDescription>
                    Now all <code>IconButton</code> at the new md/lg sizes — CoachHome.tsx&apos;s
                    dismiss (square, so it&apos;s shadcn <code>Button size=&quot;icon&quot;</code>{" "}
                    instead) and ChatComposer.tsx&apos;s two circular close controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Dismiss (CoachHome.tsx)"
                    className="size-8 shrink-0 text-extended-green-blue hover:bg-extended-light-cyan hover:text-extended-dark-cyan"
                  >
                    <X />
                  </Button>
                  <IconButton
                    variant="ghost"
                    size="md"
                    aria-label="Close (ChatComposer.tsx thread header)"
                    className="text-text-secondary hover:text-text-primary active:bg-muted"
                  >
                    <X />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="lg"
                    aria-label="Close full screen (ChatComposer.tsx)"
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <X strokeWidth={2} />
                  </IconButton>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bare info tooltip icon</CardTitle>
                  <CardDescription>
                    CoachHome.tsx PillarInfoIcon — no chrome, CSS-only tooltip on
                    hover/focus. Hover to see it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3 pb-10">
                  <InfoTooltipIconDemo />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password visibility toggle</CardTitle>
                  <CardDescription>
                    src/components/ui/password-input.tsx — absolutely positioned inside
                    the field, no bg/border
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full max-w-xs">
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      defaultValue="hunter2"
                      className="pr-11"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((v) => !v)}
                      aria-label={passwordVisible ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Back button</CardTitle>
                  <CardDescription>
                    OnboardingProgressHeader.tsx — now shadcn <code>Button</code> variant
                    =&quot;ghost&quot; size=&quot;sm&quot;, with an explicit{" "}
                    <code>pl-0! pr-2!</code> override for its flush-left layout. Disabled
                    now inherits Button&apos;s standard opacity-50 instead of a one-off
                    opacity-30.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto shrink-0 gap-2.5 pl-0! pr-2! text-caption font-medium text-text-secondary hover:bg-transparent hover:text-foreground"
                  >
                    <ArrowLeft className="size-5" />
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-auto shrink-0 gap-2.5 pl-0! pr-2! text-caption font-medium text-text-secondary hover:bg-transparent hover:text-foreground"
                  >
                    <ArrowLeft className="size-5" />
                    Back (disabled)
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Text / link-style buttons</CardTitle>
                  <CardDescription>
                    No chrome — color and underline carry the affordance. The table-row
                    pattern repeats verbatim across 4 admin list screens.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-6">
                  <button
                    type="button"
                    className="text-caption text-left font-semibold text-primary hover:underline"
                  >
                    Jordan Lee (table row → drawer)
                  </button>
                  <Button variant="link" className="p-0">
                    See all
                    <ArrowUpRight />
                  </Button>
                  <button type="button" className="text-body-sm text-muted-foreground hover:text-foreground">
                    Super Admin login →
                  </button>
                  <p className="basis-full text-caption text-muted-foreground">
                    The plain &quot;→&quot; character on login/page.tsx&apos;s admin links
                    is the one inconsistency — every other trailing-icon button uses an
                    actual <code>ArrowUpRight</code> SVG.
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Disclosure / expand-collapse button</CardTitle>
                  <CardDescription>
                    Real component — src/app/superadmin/(shell)/competency-engine/ui/Disclosure.tsx.
                    Three tones, all sharing the same chevron-rotate affordance. Two other
                    ad hoc chevron-toggle implementations exist elsewhere (InterviewScreen.tsx,
                    ReportDetailScreen.tsx) plus a native &lt;details&gt;/&lt;summary&gt;
                    variant in CraftingScreen.tsx — worth converging on this one.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Disclosure title="Product Thinking" subtitle="Success driver" tone="driver">
                    <p className="text-body-sm text-muted-foreground">Driver-tone content.</p>
                  </Disclosure>
                  <Disclosure title="Prioritization" tone="competency" defaultOpen>
                    <p className="text-body-sm text-muted-foreground">
                      Competency-tone content, open by default.
                    </p>
                  </Disclosure>
                  <Disclosure title="Level 3 — Practicing" tone="level">
                    <p className="text-body-sm text-muted-foreground">Level-tone content.</p>
                  </Disclosure>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Social auth buttons</CardTitle>
                  <CardDescription>
                    login/page.tsx and signup/page.tsx — now share one icon source
                    (src/components/icons/SocialIcons.tsx) instead of two duplicated copies
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="flex h-11 items-center justify-center gap-2.5 rounded-md border border-border bg-white px-4 text-body-sm font-medium text-foreground hover:bg-muted"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    className="flex h-11 items-center justify-center gap-2.5 rounded-md border border-border bg-white px-4 text-body-sm font-medium text-foreground hover:bg-muted"
                  >
                    <LinkedInIcon />
                    Continue with LinkedIn
                  </button>
                </CardContent>
              </Card>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
