"use client";

import { ArrowUp, BookOpen, Download, UserCheck } from "lucide-react";
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
} from "@/components/ui/card";
import { CardButton } from "@/components/ui/card-button";
import { Chatbox } from "@/components/ui/chatbox";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, type LogoSize } from "@/components/ui/logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SelectionChip } from "@/components/ui/selection-chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    light: { bg: "#F5F5F3", fg: "#0E0E0E" },
    dark: { bg: "#01161B", fg: "#22D3EE" },
  },
  {
    title: "Popover",
    bgVar: "--popover",
    fgVar: "--popover-foreground",
    light: { bg: "#F5F5F3", fg: "#0E0E0E" },
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

const SCORING_TOKENS: FlatToken[] = [
  { name: "scoring-red", cssVar: "--scoring-red", light: "#CB3A31", dark: "#CB3A31" },
  { name: "scoring-yellow", cssVar: "--scoring-yellow", light: "#E9A13B", dark: "#E9A13B" },
  { name: "scoring-green", cssVar: "--scoring-green", light: "#16A34A", dark: "#16A34A" },
  { name: "scoring-cyan", cssVar: "--scoring-cyan", light: "#22D3EE", dark: "#22D3EE" },
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
  { key: "h1", className: "text-h1", label: "H1", size: "80px", weight: "700", tracking: "-4px" },
  { key: "h2", className: "text-h2", label: "H2", size: "64px", weight: "700", tracking: "-4px" },
  { key: "h3", className: "text-h3", label: "H3", size: "48px", weight: "700", tracking: "-4px" },
  { key: "h4", className: "text-h4", label: "H4", size: "36px", weight: "600", tracking: "-3px" },
  { key: "h5", className: "text-h5", label: "H5", size: "28px", weight: "600", tracking: "-2px" },
  { key: "h6", className: "text-h6", label: "H6", size: "22px", weight: "600", tracking: "-1px" },
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
    size: "52px",
    weight: "400",
    tracking: "-1.04px",
    colorClassName: "text-heading-teal",
    note: "Big greeting headline — used by onboarding's agent prompt and the Coach dashboard hero. Always paired with text-heading-teal (#094149), not text-foreground.",
  },
  {
    key: "agent-question",
    className: "text-agent-question",
    label: "Agent question",
    size: "32px",
    weight: "400",
    tracking: "-0.64px",
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

export default function DesignSystemPage() {
  const [dark, setDark] = useState(false);
  const [selectedChip, setSelectedChip] = useState(CHIP_OPTIONS[0]);
  const [chatValue, setChatValue] = useState("");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  return (
    <div className={cn(dark && "dark")}>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="mx-auto max-w-6xl space-y-16 px-6 py-12">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-overline text-muted-foreground">DESIGN SYSTEM</p>
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

          <Section title="Scoring colors">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {SCORING_TOKENS.map((token) => (
                <FlatSwatch key={token.name} token={token} dark={dark} />
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
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>All variants and sizes</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
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
                      <AvatarFallback>PD</AvatarFallback>
                    </Avatar>
                    <span className="text-body-sm">ProofDive User</span>
                  </div>
                </CardContent>
              </Card>
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
                  <CardDescription>Solid and ghost, default and disabled</CardDescription>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Selection chip</CardTitle>
                  <CardDescription>Default, hover (try it), selected</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  {CHIP_OPTIONS.map((option) => (
                    <SelectionChip
                      key={option}
                      selected={selectedChip === option}
                      onClick={() => setSelectedChip(option)}
                    >
                      {option}
                    </SelectionChip>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Chatbox</CardTitle>
                  <CardDescription>
                    Empty / filled / upload states driven by real input — type or attach a
                    file to see it change
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Chatbox
                    value={chatValue}
                    onValueChange={setChatValue}
                    onSend={() => setChatValue("")}
                    attachedFileName={attachedFileName}
                    onUploadClick={() => setAttachedFileName("Job Description.pdf")}
                    onRemoveFile={() => setAttachedFileName(null)}
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Card button</CardTitle>
                  <CardDescription>Primary and gray variants</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <CardButton
                    className="max-w-[392px]"
                    variant="primary"
                    icon={<BookOpen />}
                    title="Storyboard"
                    subtitle="Build your career storyboard"
                  />
                  <CardButton
                    className="max-w-[392px]"
                    variant="gray"
                    icon={<UserCheck />}
                    title="Start mock interview"
                    subtitle="Evaluate yourself for UX role"
                  />
                </CardContent>
              </Card>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
