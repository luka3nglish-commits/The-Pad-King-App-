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

### 3. Pad Match — pad → polishes (built)

Owner direction: "you press on a pad and it suggests a few polishes that are good with the pad", **brands limited to 3D, Sonax, Koch Chemie and P&S** (owner wrote "PNS" — P&S Detail Products: Rehab Correction Crème, Therapy Final Polish), and **images, not just words**.

- All 5 stock pads (custom Spitfire builds use the Spitfire list). Tap a pad → 3D pad recolours/reshapes → its polishes as **product tiles**: bottle art (silhouette per brand, two bottles for combos) on a glow in the pad's colour, brand, product, stage tag, manufacturer spec where published (Sonax Perfect Finish Cut 4 · Gloss 6, Ultimate Cut Cut 6 · Gloss 3), Matt's note, **Matt's pick** badge, Find a stockist.
- Product art is Pad King-styled illustration, not the brands' packaging. Each polish has an `image` slot: drop in real product photos (from Matt or the brands) and the tile shows the photo instead.
- **Matt's picks** (badged) come from his published write-ups, filtered to the four brands:
  - Spitfire Green: 3D ACA 510 + 520 ("magic combo"), Koch Chemie H9 + F6 (75/25), 3D One, Sonax Perfect Finish, Koch Chemie M3 (finishing).
  - Afterburner: Sonax Ultimate Cut, 3D ACA 510, 3D One, Sonax Perfect Finish, 3D ACA 520. Tip: 10 mm sanding interface on a DA.
  - Midas / Frostbite / Lone Star: 3D One (from his one-step guide).
- **Matched to the pad's job (not Matt's — he should confirm):** Afterburner + Koch H9, P&S Rehab; Spitfire + P&S Rehab, P&S Therapy; Frostbite (one-step on harder paints) → P&S Rehab, Sonax Perfect Finish, 3D ACA 510 + 520, Koch H9 + F6; Lone Star (softer paints) → Sonax Perfect Finish, P&S Therapy (P&S rate it for soft, sensitive clears), 3D ACA 520, Koch M3; Midas (finishing) → Sonax Perfect Finish, 3D ACA 520, Koch M3, P&S Therapy.
- Stage tags from each product's role; P&S Rehab one-step ("corrects and finishes in one step"), Therapy finish.
- **Frostbite is light blue now** (recent change, owner) — renders `#7CB6DD`, a touch lighter than Afterburner `#5A9FCF`; Afterburner is also a much flatter disc. Name shown as "Frostbite" — confirm whether "White" is still in the product name.
- **Stockist links:** web search until Matt gives stockists or affiliate links.

### 4. Simulator

Dropped by owner in favour of Pad Match (a motion simulator was built and removed — in git history if ever wanted).

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
| `--pk-gold` / `-hi` / `-deep` | `#C99A4A` / `#ECD3A0` / `#84601F` | accent, CTA fill, metallic type ramp |
| `--pk-orange` | `#E2621B` | burnt ember — the "touch": sheen edge, live dots, cut tags, errors. Never an area |
| `--pk-spitfire` | `#3FA02C` | photo sample was `#6BE846`; deepened per owner. **Product only** — no UI uses green |

**Owner direction (2026-10-01): all colours deep and rich, never fluro.** Pad foams: Spitfire `#3FA02C`, Afterburner `#5A9FCF`, Frostbite `#7CB6DD` (light blue, recently changed), Lone Star `#B01C26`, Midas `#C78E1F`. 3D foam sheen lifts only 30 % toward white so colours stay saturated.

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
| Match | `/match` | **Pad Match live** — tap a pad, get the polishes Matt pairs with it |
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
