# The Pad King app — v1 spec

Date: 2026-10-01 (updated same day after the second Q&A round)
Status: **Direction locked.** First design draft built (landing story + pad maker) for showing Matt. Pad technical accuracy comes later; it's isolated in two files so it can be corrected without touching the design.

## What it is

A customer-facing web app (installable PWA) for people who buy Pad King pads.
Premium, technical, animation-heavy: "Apple product pages on steroids, a touch of Porsche, and way better than OMA HQ."

| Decision | Answer |
|---|---|
| Audience | Pad customers (not Matt's internal ops) |
| Platform | Web app, installable to home screen. No app stores in v1 |
| Deal | Favour / portfolio piece |
| Theme | Dark only |
| Colours | Black + gold, a touch of orange, tonal tiger-stripe background |
| Live interactiveness | Simulators + live 3D |
| Feel | Apple product pages (scroll-driven 3D, product as hero) + Porsche precision |
| Store | WooCommerce (existing thepadking.com.au) |
| Custom pad output | Build request **emailed** to Matt to confirm + quote before payment |
| Reminders | By **email** (no push in v1) |
| Machines (selector / simulator) | **DA and Rotary** only, keep it simple |
| Content edits | Luka handles all changes (no admin panel) |
| Hosting | Luka to sort with Matt |
| Deadline | None — quality over speed |
| First drafts | Design-focused for showing Matt; backend done properly; pad technicality later |
| Navigation | **Bottom tabs like OMA HQ**: Home · Range · Build · Match · Reorder. Full-width bar on phones, floating dock on wider screens; gold active pill slides between tabs; light sweep on switch |

## v1 features

### 1. Custom pad maker — Spitfire Green only (for now)

Customer builds a pad; the 3D model morphs live with every choice; the build is emailed to Matt.

| Option | Choices | Notes |
|---|---|---|
| Size | 40, 65, 75 mm | **Velcro diameter** — the face that sits on the backing plate. Custom-only sizes (stock Spitfire is 3"/5"/6") |
| Thickness | 12, 15, 16, 18, 20, 22 mm | Total height, velcro to face |
| Edge | Rounded, Full Tilt, Trapeze, Cone, **Splay** | "Rupes-style" renamed **Splay**: splayed side flaring past the velcro with a bevelled lower lip (Rupes BigFoot description). **Full Tilt shape unknown** — modelled as a deep bevel, provisional |
| Face | Raised, Crosscut, Waffle, Flower Power | Raised = centre boss. Crosscut = deep square-grid cuts like the Scholl Spider. Waffle = shallow square channels. Flower Power = raised flower-shaped face, **still in testing** (badged "In testing") |

All 4 × 5 × 6 × 3 = **360 combinations can be made** (owner-confirmed).

Every option lives in `lib/pad/options.ts`; every shape lives in `lib/pad/geometry.ts`. Real dimensions from Matt = edit numbers there, nothing else.

### 2. 3D catalogue (phase 2)

Every product as the hero: spin, zoom, exploded view, full spec sheet, buy link through to WooCommerce. Range per the site: Afterburner (levelling & cutting), Frostbite White (cutting), Lone Star Red, Midas Touch Gold (finishing), Spitfire Green (all rounder).

### 3. Pad ↔ polish compatibility selector (phase 3)

DA or Rotary + pad + defect → compound pairings, speed range, passes. **Every recommendation from real data** — blocked on Matt's spec data and compound list.

### 4. Simulator (phase 3)

DA and Rotary only. Motion path (rotation + orbit) shown accurately from kinematics; cut/heat readouts only from real data, otherwise labelled illustrative.

### 5. Reordering (phase 4)

One-tap reorder from WooCommerce order history (fallback: WooCommerce's "Order again"). Smart reminders by **email**, based on time since purchase × pad life (needs Matt's lifespan figure).

## Design system (built)

### Colour tokens — `app/globals.css`

| Token | Value | Use |
|---|---|---|
| `--pk-bg` | `#08080A` | canvas |
| `--pk-stripe` | `#121216` | tiger stripes at rest |
| `--pk-surface` / `-2` | `#111114` / `#18181D` | panels, inputs |
| `--pk-text` / `-2` | `#F5F2EA` / `#A8A49A` | primary / secondary text |
| `--pk-muted` | `#6B675F` | labels/large text only (~3.6:1) |
| `--pk-gold` / `-hi` / `-deep` | `#C9A55C` / `#F1E3BE` / `#8A6A2C` | accent, CTA fill, metallic type ramp |
| `--pk-orange` | `#FF7A1A` | the "touch": sheen edge, live dots, errors. Never an area |
| `--pk-spitfire` | `#6BE846` | sampled from Matt's product photo. **Product only** — no UI uses green |

### Signature moves

- **Tonal tiger stripes** — generated SVG (no asset), black-on-black at rest; a gold → orange light band sweeps beneath them with scroll + slow drift and lights them up; on desktop a torch follows the cursor. Transform-only, static under reduced motion.
- **One light source** — gold type picks up the same sweep position.
- **Parametric 3D pad** — every build generated live (no model files); option changes are true per-vertex morphs.
- **Shader foam** — open-cell micro-normals; Crosscut/Waffle grooves traced per pixel (parallax occlusion) so grid edges stay razor-sharp.
- **Exploded layers** — velcro / interface / foam separate with numbered markers pinned to each layer.

### Type

Archivo (expanded, 850) display · Inter body · JetBrains Mono data. Self-hosted via Fontsource.

### Logo

Only a photo of the holographic sticker so far (gold crown on a coloured pad stack, "THE PAD KING / SUPER SERIES FOAMS", 0468 373 625). Header uses a **placeholder wordmark** until Matt supplies the vector logo.

## Copy sources

All product claims come from thepadking.com.au (via search index; the site itself is blocked from the dev container): Spitfire "corrects, polishes and finishes in one pad", light-to-medium cut, modern clear coats 60–105 µm, 50% greater durability, 120 °C adhesive on Velcro brand loop, interface layers preventing delamination, tested to failure on real cars at the Adelaide R&D facility, designed by Matthew Gibb (30+ years).

## Stack (built)

- Next.js 16 (App Router, TypeScript) · Tailwind 4 · React Three Fiber + drei · GSAP ScrollTrigger
- `POST /api/build-request` → validates → emails via Resend HTTP API (`RESEND_API_KEY`, `BUILD_REQUEST_TO`, `BUILD_REQUEST_FROM`). Unconfigured → 503 and the UI tells the customer to call — it never fakes a send. Honeypot spam field.
- WooCommerce REST server-side only (phase 2+)
- Hosting: not Vercel Hobby (non-commercial only per Vercel's terms) — Luka to agree with Matt

## Scope guard (favour job)

v1 = the five features above. Anything else is a v2 conversation. Options/specs live in single data files so changes are minutes, not rebuilds.

## App structure (built)

| Tab | Route | State |
|---|---|---|
| Home | `/` | Spitfire Green scroll story |
| Range | `/range` | Teaser — the five pad names from the site; 3D catalogue is phase 2 |
| Build | `/build` | Custom pad maker (live) |
| Match | `/match` | Teaser — DA/Rotary selector + simulator is phase 3 |
| Reorder | `/orders` | Teaser — one-tap reorder + email reminders is phase 4 |

Tabs are one array in `components/TabBar.tsx`.

## Build order

0. ~~Look sign-off~~ → **built as real code**: landing scroll story + pad maker. Awaiting Matt's reaction.
1. Pad maker → email to Matt — **built** (needs email env vars + Matt's address).
2. 3D catalogue + WooCommerce products.
3. Compatibility selector + simulator (DA + Rotary).
4. Store sign-in, one-tap reorder, email reminders.

## Open items

| # | Item | Blocks |
|---|---|---|
| 1 | Vector logo (SVG/AI/PDF) | Header/footer polish |
| 2 | Full Tilt edge — real shape | Pad accuracy (later) |
| 3 | Flower Power — final shape once testing is done | Pad accuracy (later) |
| 4 | Real dimensions for each edge/face profile | Pad accuracy (later) |
| 5 | Matt's inbox for build requests + a Resend account (or other email provider) | Going live with requests |
| 6 | Pad specs (density, cut, speed range, lifespan) + compound list | Phase 3, reminders |
| 7 | WooCommerce REST API keys (read-only) | Phases 2, 4 |
| 8 | Hosting account + who pays | Launch |
| 9 | thepadking.com.au blocked by this dev environment's network policy | Research only |
