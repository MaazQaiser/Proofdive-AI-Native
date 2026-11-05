# DESIGN.md — ProofDive

The design system of the ProofDive web app: an AI interview coach that turns a
person's real experience into interview-ready evidence, and measures how ready
they are.

This file describes **what the code on `main` does**, not what it aspires to.
Every value below is lifted from the source, and the source wins any
disagreement:

| Source of truth | What lives there |
|---|---|
| `src/app/globals.css` | Every token, both themes, the type scale, utilities, keyframes |
| `src/components/ui/` | The 40 components (shadcn/ui, `new-york` style, on Radix) |
| `src/lib/scoringPalette.ts` | The scoring bands and the one helper that styles them |
| `src/lib/theme.ts` | Theme preference, the pre-paint bootstrap, the crossfade |
| `/design-system` | The live showcase — every component, rendered |

**Stack.** Next.js 16 · React 19 · Tailwind CSS v4 (CSS-first, `@theme inline`,
no `tailwind.config`) · shadcn/ui on Radix primitives · `class-variance-authority`
for variants · `lucide-react` for icons · `sonner` for toasts · Inter via
`next/font`, Gilroy self-hosted.

---

## 1. Visual theme and atmosphere

Calm, precise, quietly confident — a coach, not a cheerleader. The product is
read in long, focused sessions by people under pressure, so the surface stays
out of the way and lets the person's own words carry the screen.

- **Teal on warm paper.** One brand hue, a clear teal (`#0E9AB5`), on an
  off-white ground (`#F5F5F3`) that is never pure white. Cards step up to white.
- **Evidence is the hero.** Scores, answers and the Consultant's notes are the
  loudest things on any screen; chrome concedes to them.
- **Glass, used sparingly.** A translucent card language exists for the
  surfaces that float — never as a default texture.
- **Dark is designed, not inverted.** No dark value is a flipped hex. Each token
  keeps its *role* in both themes (see §7).

---

## 2. Colour palette and roles

Reach for **semantic** tokens first. The ramps underneath exist to build them.
Every token is declared in `:root`; `.dark` only redefines values and never
introduces a token of its own.

### 2.1 Semantic pairs

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `#F5F5F3` | `#0a1013` | The page ground |
| `--foreground` | `#0E0E0E` | `#e8eff1` | Body ink |
| `--card` | `#FFFFFF` | `#121c21` | One step above the page |
| `--popover` | `#FFFFFF` | `#16232a` | Menus, tooltips, sheets |
| `--surface` | `#E8E8E6` | `#18252b` | Inset / nested plate |
| `--muted` | `#E8E8E6` | `#1c2c33` | Quiet fill, ghost hover |
| `--muted-foreground` | `#6B7280` | `#94a6ac` | Secondary ink |
| `--primary` | `#0E9AB5` | `#22b2cc` | Brand teal — fills, focus, emphasis |
| `--primary-foreground` | `#F5F5F5` | `#03171c` | Label on a primary fill |
| `--secondary` | `#B9EFF4` | `#123842` | Pale brand surface (the default badge) |
| `--secondary-foreground` | `#073E4C` | `#a9e4ef` | Ink on secondary |
| `--accent` | `#22D3EE` | `#3ec8df` | Bright highlight |
| `--accent-foreground` | `#062C35` | `#03171c` | Ink on accent |
| `--destructive` | `#CB3A31` | `#f0736a` | Errors, End, irreversible actions |
| `--destructive-foreground` | `#F5F5F3` | `#2a0b08` | Label on destructive |

Note the last pairs: in light, a brand or destructive fill carries a
near-white label; in dark the fill is bright enough to read on the page, so
its label goes **near-black**. That is the only way both themes clear AA.

### 2.2 Structural tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `--border` | `#DFE7E9` | `#273b43` | Quiet hairline that divides |
| `--divider-soft` | `#d4d4d2` | `#22333a` | Softer still (inside the composer) |
| `--input` | `#DFE7E9` | `#456c78` | Field edge — an **affordance**, kept above 3:1 in dark |
| `--ring` | `#0E9AB5` | `#3ec8df` | Focus ring |
| `--text-primary` | `#0E0E0E` | `#e8eff1` | Primary ink |
| `--text-secondary` | `#6B7280` | `#94a6ac` | Secondary ink |
| `--placeholder` | `#999999` | `#778b91` | Field placeholder |
| `--link` | `#095b73` | `#7fd4e6` | Inline text links |
| `--chip-border` | `#adddda` | `#446e79` | Selection chip edge — an affordance |
| `--overlay` | `rgb(0 0 0 / .30)` | `rgb(0 0 0 / .62)` | Scrim behind modals |

### 2.3 Brand ramp

Ten steps. The number encodes **use, not lightness**: 100 is the accent end,
1000 the quiet-surface end — in both themes. So in dark, 100 is the brightest
step and 1000 the deepest, and `bg-brand-1000` stays a quiet surface everywhere.

| Step | Light | Dark |
|---|---|---|
| 100 | `#0E9AB5` | `#5bd6ea` |
| 200 | `#26A4BC` | `#3fc3da` |
| 300 | `#3EAEC4` | `#2faec6` |
| 400 | `#56B8CB` | `#2898b0` |
| 500 | `#6EC2D3` | `#22829a` |
| 600 | `#87CDDA` | `#1d6d83` |
| 700 | `#9FD7E1` | `#18596d` |
| 800 | `#B7E1E9` | `#144857` |
| 900 | `#CFEBF0` | `#103743` |
| 1000 | `#E7F5F8` | `#0c2932` |

### 2.4 Extended brand

Role-preservation at its clearest: in light some of these are pale *surfaces*
and others dark *text*. Each keeps its job in dark.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--extended-light-cyan` | `#B9EFF4` | `#123039` | Surface — chip hover fill |
| `--extended-cyan` | `#00A8B9` | `#3ec8df` | Text |
| `--extended-blue` | `#006F8F` | `#7fd4e6` | Text — the agent's question |
| `--extended-green` | `#C7DCD5` | `#273b43` | Row divider **only** |
| `--extended-green-blue` | `#073E4C` | `#a9e4ef` | Text |
| `--extended-cyan-green` | `#062C35` | `#8fd9e8` | Text and small dot fills |
| `--extended-dark-cyan` | `#01161B` | `#d3f1f6` | Text |
| `--heading-teal` | `#094149` | `#a9dfeb` | The agent's greeting headline |

### 2.5 Scoring palette

Four bands across a 1.0–5.0 scale — the product's central measurement, and the
only colours that carry **meaning** rather than brand.

| Band | Range | Fill (light / dark) | Text, light |
|---|---|---|---|
| Not ready | 1.0 – 2.4 | `#CB3A31` / `#f0736a` | `#CB3A31` |
| Borderline | 2.5 – 3.4 | `#E9A13B` / `#e9a13b` | `#A16207` |
| Pass | 3.5 – 4.4 | `#16A34A` / `#34c76a` | `#15803D` |
| Star | 4.5 – 5.0 | `#22D3EE` / `#3ec8df` | `#0E7490` |

The bright `--scoring-*` values are for **fills** (bars, the segmented scale,
chart series). Labels use the `--scoring-*-fg` variants, tuned to clear 4.5:1
on a light card. One helper owns all band chrome — `scoringBadgeClass()` in
`src/lib/scoringPalette.ts` — and every pill is a 25 % tint with the `-fg` ink.

---

## 3. Typography

### 3.1 Faces

| Face | Loaded via | Used for |
|---|---|---|
| **Inter** | `next/font/google` → `--font-sans` | Everything by default |
| **Gilroy** 300/400/500/700/800 | Self-hosted `.woff` → `font-gilroy` | The wordmark, big tabular numerals, scores — deliberately narrow |

### 3.2 Scale

Use the utility, never a raw `text-[Npx]` for running text.

| Utility | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `text-h1` | 40px | 500 | −0.8px | Page titles |
| `text-agent-heading` | 40px | 500 | −0.8px | The agent's greeting (lh 1.2) |
| `text-subheading` | 36px | 400 | −1.44px | Large lead lines |
| `text-h2` | 32px | 500 | −2px | Section heads |
| `text-agent-question` | 28px | 500 | −0.56px | The question being asked (lh 1.3) |
| `text-h3` | 24px | 500 | −1.5px | Card heads |
| `text-h4` | 20px | 500 | −1.2px | Sub-heads |
| `text-body-lg` | 20px | 400 | −1px | Lead paragraphs, the Consultant Note |
| `text-body` | 18px | 400 | −1px | Body (paragraph spacing 18px) |
| `text-h5` | 16px | 500 | −0.8px | Small heads |
| `text-body-sm` | 16px | 400 | 0 | Dense body, controls |
| `text-h6` | 14px | 500 | −0.5px | Labels with weight |
| `text-caption` | 14px | 400 | 0 | Captions, meta, links in UI |
| `text-overline` | 12px | 500 | **+0.5px** | Eyebrows, badges |

**The signature:** tracking tightens as size grows (−2px at 32px) and opens
back up at the smallest size (+0.5px on the 12px overline). Large type is
pulled in; small type is let out.

### 3.3 Rules

- Headings balance their lines (`[text-wrap:balance]`); running text keeps a
  readable measure (`max-w-[62ch]`–`max-w-[68ch]`).
- Numbers that line up use `tabular-nums`; scores are set in Gilroy.
- `--primary` on near-white measures ~3.05:1 — fine for an 18px+ button label,
  **too low for small text**. Do not set 12–14px type in brand teal on white.

---

## 4. Components

All in `src/components/ui/`, variants via `cva`, merged with `cn()`.

### Button
| Variant | Chrome |
|---|---|
| `default` | `bg-primary text-primary-foreground`, hover 90 % |
| `destructive` | `bg-destructive text-destructive-foreground` |
| `outline` | `border-input` on `bg-background`, hover `bg-muted` |
| `secondary` | `bg-muted text-foreground` |
| `ghost` | No chrome until hover `bg-muted` |
| `link` | The `app-link` utility |

Sizes: `default` h-9 (36px) px-4 · `sm` h-8 px-3 · `lg` h-10 px-6 · `icon` 36px.
Padding is **symmetric whether or not the button has an icon** — an offset on
the icon side read as an off-centre label on real 32–36px buttons.

### Badge — the one label chrome
`rounded-full`, `text-overline` at `font-normal`, `px-2 py-0.5`, icons at
`size-3`. Variants: `secondary` (**default**), `default`, `destructive`,
`outline`. Tone is passed through `className` where colour *is* the
information — the scoring pills are `<Badge variant="outline" className={scoringBadgeClass(score)}>`.

The app has exactly two label tiers: **`Badge`** for everything, and
**`StatusPill`** (`success` · `warning` · `danger` · `neutral`, with an icon)
for admin status. `SelectionChip` is a control, not a label, and is not a Badge.

### Card
`bg-card rounded-[16px] py-6 gap-6`, with `CardNested` (`bg-surface
rounded-[16px]`) for a flat card-inside-card layer instead of a shadow.

### Input / form controls
`h-9 rounded-md border-input`; focus is `border-ring` plus a 3px
`ring-ring/50`. Placeholder uses `--placeholder`, not `--muted-foreground`.

### IconButton
`default` 28px · `md` 36px · `lg` 40px · `xl` 44px (the live interview's
mic and camera — a full touch target).

### SelectionChip
`h-9 rounded-full`, edged with `--chip-border` — deliberately stronger than
`--border`, because it is the flow's primary answer control.

### Dialog
Radix dialog, `max-w-lg`, `p-6`, on `--overlay`. A portalled dialog does
**not** inherit a palette scoped to its opener (see §7.3).

### StepIndicator
The one "where am I in this flow" control, for stepped dialogs and full-screen
wizards alike. Done (check) · current (filled number) · ahead (outlined
number); the rule between steps fills only once the earlier one is behind you;
`onStepSelect` makes a completed step a way back. `size="compact"` for dialogs.

### AI presence
`src/components/chat/AiPresence.tsx` — a 36px disc holding the ProofDive mark
inside a thin brand ring: the product's signature for "the AI is here", worn by
the composer and never used as decoration. Every state is a UX moment:

| Side | States |
|---|---|
| The AI (set by the host) | `idle` · `thinking` · `responding` · `error` |
| The person (read by the composer from focus, text and mic) | attentive · `typing` · `listening` |

### Water (`SeaSurface`)
The marketing site's hero sea, along the foot of the auth pages: its swell,
chop, lighting and colours in one fragment shader on a bare WebGL canvas (no
three.js), with a palette per theme, fading into the page at the horizon. Runs
only while on screen; one still frame with reduced motion; nothing without
WebGL. It is the auth pages' only motion: nothing there answers the pointer.

### Links
`app-link`: **underlined at rest**, always — `--link` against body text is only
2.53:1 in light and 1.45:1 in dark, below the 3:1 WCAG 1.4.1 needs before
colour may be a link's only signal. 1px rule at a 3px offset, 2px on hover,
focus ring built in.

---

## 5. Layout

- **The shell** (`AppShell`): a sticky header 56px tall (`h-14`); content in a
  `max-w-6xl` column (1152px) with `gap-10`; `pb-32` keeps content clear of the
  AI composer docked at the foot. A left rail (`CoachFloatingNav`) carries the
  app's sections.
- **The auth shell** (`AuthShell`): the website's hero as a page, with the
  form alone on it — one pane of glass (500px, a 420px form column) on the
  page's centre line, the logo above it in brand teal, the sky straight
  overhead and the sea low along the foot (`clamp(56px, 11vh, 110px)`). No
  panel beside it: the room round the form is the design. Every auth page
  opens with `AuthHeading`, so all of them share one centred title; labels and
  fields stay left-aligned. On short screens (≤ 860px tall) the room around
  the pane gives way and it may rest on the water, so even sign-up never
  scrolls on a 1366 × 768 laptop.
- **Spacing** is Tailwind's 4px scale. Siblings are spaced with `gap`, not
  per-element margins.
- **Radius is by role**, not habit:

| Radius | Used by |
|---|---|
| `--radius` 8px | Buttons, fields |
| 16px | Cards (`Card`, `SuccessDriverCard`, `CardButton`) |
| 20px | Glass cards, the report's floating surfaces, the live interview stage |
| `rounded-full` | Selection chips, badges, the control pill, the AI disc |

- **Not everything is a card.** Border, fill, radius and shadow each say
  "separate object". Spend them on the thing that needs lifting.

---

## 6. Depth and elevation

Elevation **changes mechanism between themes**: same token, same call sites,
opposite physics.

| Token | Light | Dark |
|---|---|---|
| `--elevation-card` | `0 12px 32px -16px rgb(4 32 39 / .35)` | lit top edge `inset 0 1px 0 0 rgb(255 255 255 / .06)` + a deeper, tighter cast |
| `--elevation-media` | soft cast | lit edge + cast |
| `--elevation-pop` | `0 24px 80px -24px rgb(7 62 76 / .35)` | lit edge + cast |
| `--elevation-tooltip` | `0 8px 20px rgb(14 154 181 / .12)` | lit edge + cast |

**Glass** — a diagonal translucent fill and a lit top edge:

| Token | Light | Dark |
|---|---|---|
| `--glass-from` | `rgb(255 255 255 / .80)` | `rgb(255 255 255 / .055)` |
| `--glass-to` | `rgb(255 255 255 / .50)` | `rgb(255 255 255 / .022)` |
| `--glass-inset` | `rgb(255 255 255 / .72)` | `rgb(255 255 255 / .07)` |
| `--hover-veil` | `rgb(255 255 255 / .40)` | `rgb(255 255 255 / .05)` |

**Pane glass** (`.glass-pane`, `GlassPane`) — the marketing site's liquid glass,
for surfaces that float over water (the auth form's pane), not for ordinary
cards. **Milk** in light (silver frost, ink type) and **smoke** in dark (darker
than the water, light type), each with a rim that catches the light, a sheen
from above, a glow along the foot and a sea-tinted shadow (`--pane-*`). 28px
corner, a 44px squircle where `corner-shape` is supported. `lean` adds the
site's pointer lean — 5° at the edge, a pool of light and a line on the rim —
for a fine pointer with motion allowed. It sits in `@layer components`, so a
utility on the element (`rounded-full`) still wins.

---

## 7. Dark mode

Class-based: `@custom-variant dark (&:where(.dark, .dark *))`. The class is set
on `<html>` **before first paint** by an inlined bootstrap (`THEME_BOOTSTRAP`
in `src/lib/theme.ts`), so there is no flash and no hydration mismatch. The
default follows the OS; the toggle makes it an explicit choice.

### 7.1 The six principles (from the `.dark` block)

1. **Surfaces rise.** The page is the darkest thing on screen; every surface
   above it is lighter — the same direction as light mode.
2. **Cool graphite, not black.** Neutrals carry a slight teal undertone
   (hue ≈197) so the brand reads native. Nothing is `#000`.
3. **Two-tier strokes.** Hairlines that divide stay quiet (~1.3–1.5:1);
   boundaries that *are* the affordance are pushed past 3:1.
4. **Light is emitted, not cast.** A drop shadow is invisible on a dark page,
   so elevation becomes a lit top edge; an 80 % white glass becomes a ~5 % veil.
5. **No harsh white.** Body ink tops out at `#E8EFF1` (~14.9:1 on card).
6. **Bright fill, dark label.** Brand and destructive fills go bright, so
   their labels go dark.

### 7.2 The plate decides

Anything painted **over imagery** is not themed: the image, not the page, is
the surface behind it. A play button on a photo stays a light glass disc with
a dark glyph in both themes; the marketing landing stays light-inked in both,
because its hero is a permanently near-white image.

Do this with **scoped CSS-variable overrides on the container** —
`[--text-primary:#0E0E0E] [--foreground:#0E0E0E] …` — never `dark:` classes on
each child. Children keep asking for the same tokens; only the values change.

### 7.3 Three traps

- A **portalled** dialog does not inherit a scope applied to its opener —
  repeat the palette on the dialog content.
- An element with no colour of its own inherits a colour already *computed* on
  `<body>`; give the scoped container an explicit `text-foreground`.
- There is **no `bg-base`**: `--color-base` is left out of `@theme` on purpose,
  because Tailwind would generate a `base` colour utility that collides with
  the `text-base` font-size utility. Use `var(--base)` directly.

---

## 8. Motion and interaction

- **One house curve:** `cubic-bezier(0.22, 1, 0.36, 1)` — a fast start that
  settles without overshoot. Used across the entrance animations.
- **Durations:** ~220ms for a settle (`animate-coach-brief-settle`);
  550–700ms for an entrance (`landing-rise`, `report-status-rise`,
  `pricing-rise`); 16–24s for ambient background drift (`report-blob`,
  `pricing-blob`).
- **Theme changes crossfade** through the View Transitions API, and fall back
  to a per-property fade where it is unavailable. A skipped transition is not
  an error — the theme still flips.
- **Reduced motion is honoured everywhere** (`prefers-reduced-motion` and
  `motion-safe:` variants): the page shows its end state, nothing moves.
- **Motion repeats nothing it does not need to.** A block whose text has not
  changed does not re-animate.
- **AI waits are narrated truthfully.** `AiProgressStatus` names the steps the
  code on that screen is actually running — a named step that is not happening
  is a spinner that also lies. Progress comes from the step index, never a
  made-up percentage.

---

## 9. Responsive behaviour

- Tailwind's default breakpoints, unmodified: `sm` 640 · `md` 768 · `lg` 1024
  · `xl` 1280 · `2xl` 1536.
- Mobile first. Rows wrap or stack; nothing produces horizontal page scroll.
- Interactive targets in focused tasks are 44px (the live interview's controls).
- Wide content (tables, transcripts) scrolls inside its own container.

---

## 10. Voice in the interface

- **Name what makes an item different.** On a screen where everything is
  generated, an "AI" label names nothing: `Recommended`, not "AI Pick";
  `Draft`, not "AI draft"; `Suggested for you`, not "Suggested by AI coach".
- The AI that builds stories is the **Consultant** (its block is the
  **Consultant Note**); the mock interview's AI is the **AI Interviewer**.
  Modules: **MyStoryBoard**, **MasterClass**, **Mock Studios**, the **Report**.
- Short, specific, second person, calm. A control says exactly what it does.
- A score guides preparation; it never predicts a hiring decision.

---

## 11. Do and don't

**Do**
- Use semantic tokens: `bg-card`, `text-text-secondary`, `border-border`.
- Use `Badge` for every label, with `scoringBadgeClass()` for score bands.
- Use the type utilities (`text-h2`, `text-caption`, …).
- Underline inline links (`app-link`).
- Check both themes before calling anything done.

**Don't**
- Hardcode a hex that only works in one theme (`bg-white`, `text-black`, `#fff`).
- Use `dark:` classes to retheme a surface over imagery — scope the variables.
- Put 12–14px text in brand teal on a light surface.
- Use a scoring fill colour as text — use its `-fg` variant.
- Use `--extended-green` for anything but a divider.
- Invent a second label chrome, a second step indicator or a second link style.

---

## 12. For AI agents generating UI

When you build a screen in this codebase:

1. Compose from `src/components/ui/` first; add a variant before adding a component.
2. Colour only through tokens. If you need a value that has no token, the
   token is missing — add it to `:root` **and** `.dark` in `globals.css`.
3. Set type with the scale utilities; scores in `font-gilroy tabular-nums`.
4. Radius by role (§5). Elevation through `--elevation-*`, never a raw shadow.
5. Verify in light **and** dark, and with reduced motion on.
6. Open `/design-system` to see any component rendered before re-creating it.

Example — a card holding a score:

```tsx
<Card className="px-6">
  <p className="text-overline uppercase text-text-secondary">Interview readiness</p>
  <p className="font-gilroy text-[64px] leading-none tabular-nums text-text-primary">3.8</p>
  <Badge variant="outline" className={scoringBadgeClass(3.8)}>Pass</Badge>
</Card>
```
