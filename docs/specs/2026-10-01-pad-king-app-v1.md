# The Pad King app — v1 spec

Date: 2026-10-01
Status: **Direction locked** (from owner questionnaire). Open items at the bottom block parts of the build, not the start.

## What it is

A customer-facing web app (installable PWA) for people who buy Pad King pads.
Premium, technical, animation-heavy: "Apple product pages on steroids, a touch of Porsche, and way better than OMA HQ."

| Decision | Answer |
|---|---|
| Audience | Pad customers (not Matt's internal ops) |
| Platform | Web app, installable to home screen. No app stores in v1 |
| Deal | Favour / portfolio piece |
| Theme | Dark only |
| Colours | Black + gold, a touch of orange, tiger-stripe background (tonal) |
| Live interactiveness | Simulators + live 3D |
| Feel | Apple product pages (scroll-driven 3D, product as hero) + Porsche precision |
| Store | WooCommerce (existing thepadking.com.au) |
| Custom pad output | Build request sent to Matt to quote/confirm, not straight to cart |
| Content edits | Luka handles all changes (no admin panel) |
| Deadline | None |

## v1 features

### 1. Custom pad maker — Spitfire green pad only (for now)

Customer builds a pad; the 3D model morphs live with every choice; finished build is sent to Matt.

| Option | Choices |
|---|---|
| Face profile | Raised, Crosscut, Waffle, Flower Power |
| Edge profile | Rounded, Full Tilt, Trapeze, Cone, Rupes-style |
| Thickness | 12, 15, 16, 18, 20, 22 mm |
| Size | 40, 65, 75 mm |

4 × 5 × 6 × 3 = **360 combinations** → the 3D pad is **parametric**, not 360 models:
- Edge profiles are radial cross-sections → one `LatheGeometry` profile curve per edge type, scaled by size/thickness.
- Face profiles are surface patterns → displacement/normal maps (crosscut grid, waffle dimples, flower-power petals) or a geometry pass for the raised face.
- Option changes tween between shapes (no hard swaps).

Output: summary card (all options + 3D snapshot) → sent to Matt with customer contact details. Delivery mechanism TBD (email vs WooCommerce order note) — see open items.

### 2. 3D catalogue

Every product rendered as the hero: spin, zoom, exploded/cut-away foam view, full spec sheet, buy link through to WooCommerce. Apple-style scroll sequences on the landing page (pad rotates, explodes into layers, reassembles as you scroll).

### 3. Pad ↔ polish compatibility selector

Pick pad (or machine + defect) → recommended compound/polish pairings, speed range, passes. **Every recommendation must come from real data** (Matt's specs/testing) — no invented numbers. Blocked on spec data (see open items).

### 4. Simulator

Drag machine speed, throw (orbit), and pressure; see the pad's motion live.
- **Motion path** (rotation + orbit of a DA / forced-rotation machine) is kinematics and can be shown accurately without Pad King data.
- **Cut / heat readouts** need real test data; until then they're shown as labelled illustrative bands or hidden.

### 5. Reordering

- **One-tap reorder** — customer signs in with their Pad King store account, sees order history (incl. past custom build requests), taps reorder. Implementation to prove: pre-filled WooCommerce cart via add-to-cart links; fallback is WooCommerce's built-in "Order again" on completed orders.
- **Smart reminders** — nudge to reorder based on time since purchase × expected pad life (needs Matt's lifespan figure). Web push works on iOS 16.4+ **only when the app is installed to the home screen**; in-app + email as fallback.

## Design system

### Colour tokens (dark only)

| Token | Value | Use |
|---|---|---|
| `--pk-bg` | `#08080A` | canvas |
| `--pk-stripe` | `#121216` | tiger stripes — barely visible at rest |
| `--pk-surface` | `#111114` | cards/panels |
| `--pk-surface-2` | `#18181D` | raised surfaces, inputs |
| `--pk-text` | `#F5F2EA` | primary text (warm white) |
| `--pk-text-2` | `#A8A49A` | secondary text (~7.6:1 on bg) |
| `--pk-muted` | `#6B675F` | labels/large text only (~3.6:1 — not for body) |
| `--pk-gold` | `#C9A55C` | primary accent, CTA fill (dark ink on it, ~8.6:1) |
| `--pk-gold-hi` | `#F1E3BE` | highlights, sheen core |
| `--pk-orange` | `#FF7A1A` | the "touch" — sheen leading edge, active state, live indicators. Never an area |
| `--pk-spitfire` | **TBD (real pad colour)** | reserved exclusively for the product — no UI element uses green |

Rule: gold leads, orange is seasoning, green belongs to the pad. If orange starts appearing as fills, it's overdone.

### Signature move — tonal tiger stripes

Black-on-black stripes (`--pk-stripe` on `--pk-bg`) that are nearly invisible until a gold sheen (gold → `--pk-orange` leading edge) sweeps across on scroll / pointer / device tilt and lights them up, then they fade back. One ambient layer, GPU-only (transform/opacity/background-position), off under `prefers-reduced-motion`.
Device tilt on iOS needs a user tap to grant motion permission → default to scroll/pointer, tilt is opt-in.

### Type (proposed — confirm on first mockup)

- Display: **Archivo** variable, expanded width, 700–800 — wide automotive caps (the Porsche note).
- Body/UI: **Inter**.
- Specs/data readouts: **JetBrains Mono**, tabular figures.
All Google Fonts, `font-display: swap`.

### Motion rules

- Scroll-driven 3D on landing/catalogue (GSAP ScrollTrigger + R3F).
- UI micro-interactions 150–300 ms, spring easing, exits faster than entries.
- Every animation interruptible, never blocks input, full `prefers-reduced-motion` fallback (static renders).
- **Performance bar: smooth on a mid-range Android.** Cap device pixel ratio, lazy-load 3D below the fold, static image fallback while the 3D loads or if WebGL is unavailable.

## Stack

- **Next.js** (App Router, TypeScript) + **Tailwind** (tokens above as CSS variables)
- **React Three Fiber + drei** (3D), **GSAP + ScrollTrigger** (scroll sequences), **Framer Motion** (UI transitions)
- PWA: manifest + service worker, installable
- **WooCommerce REST API** called server-side only (API keys never shipped to the browser)
- Hosting: **not Vercel Hobby** — its terms restrict Hobby to non-commercial use, and a product-selling app is commercial. Options: Vercel Pro (paid) or another host; decide before launch.

Deliberate step up from OMA HQ's no-build static HTML: that setup can't carry parametric 3D + scroll-driven scenes cleanly.

## Scope guard (favour job)

Favour + no admin panel + no deadline = scope that never closes. To keep Luka's time protected:
- **v1 = the five features above. Anything else is a v2 conversation with Matt.**
- Pad maker options, specs, compatibility pairings and reminder intervals live in **one data file** so a change is a two-minute edit, not a code change.

## Build order

0. **Look sign-off** — static mockup of landing hero + pad maker screen in the locked colours/stripes/type. Nothing else built until signed off.
1. Parametric 3D Spitfire pad + pad maker → send to Matt.
2. 3D catalogue + Apple-style landing scroll (WooCommerce products).
3. Compatibility selector + simulator (numbers gated on spec data).
4. Store sign-in, one-tap reorder, smart reminders, push.

## Open items (need from Matt / Luka)

| # | Item | Blocks |
|---|---|---|
| 1 | Logo SVG, exact Spitfire green, product photos | Phase 0 polish |
| 2 | Cross-section drawings or photos of each edge profile (Full Tilt, Trapeze, Cone, Rupes-style, Rounded) + face patterns, with dimensions | Phase 1 accuracy |
| 3 | Which of the 360 combos are actually buildable (e.g. 22 mm on 40 mm?) | Phase 1 |
| 4 | Where build requests go (Matt's email? WooCommerce?) | Phase 1 send step |
| 5 | Pad specs — density, cut level, speed range, lifespan (owner answer: "not sure") | Phase 3 numbers, Phase 4 reminders |
| 6 | Which compounds/polishes the selector covers (Pad King only, or CarPro/Rupes/Menzerna etc.) | Phase 3 |
| 7 | WooCommerce REST API keys (read-only) from Matt's WooCommerce admin | Phases 2, 4 |
| 8 | Hosting account + who pays | Launch |
| 9 | "Rupes-style" is another brand's name — Matt's call whether to use it customer-facing | Copy |
| 10 | thepadking.com.au is blocked by this dev environment's network policy — allowlist it or supply assets directly | Research |
