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
| Colours | Black + gold; orange only for heat and "live". Studio-black backdrop (tiger stripes dropped 2026-10-02, owner: "doesn't really make sense" now the app is about Matt's own story) |
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
| Face | Flat, Crosscut, Waffle, DRC Hole, Flower Power | DRC Hole (owner, 2026-10-02, from a product photo) = a wide, shallow dish recessed round the centre hole, about a third of the pad across: a flat floor, then a conical wall up to the face (build code DRC; size and depth are estimates from the photo). Flat = the standard flat face; it replaced the Raised centre-boss face (owner, 2026-10-02). Crosscut = **raised crosscut** (Matt, 2026-10-02): a fine grid of much smaller squares standing slightly proud of the face, like the Scholl Spider. Shown as "Raised Crosscut"; build code stays XCT. Waffle = shallow square channels. Flower Power = rings of flower-petal grooves, from Luka's photo of the real pad (2026-10-02): a 10-petal flower round the hole, then rings of same-size petals out to the rim (15, 20, 26), the grooves running round each petal's outer arc. Scales with the face radius. **Still in testing** (badged "In testing") |

All 5 × 5 × 6 × 3 = **450 combinations can be made** (360 owner-confirmed, plus the DRC Hole face the owner added).

Every option lives in `lib/pad/options.ts`; every shape lives in `lib/pad/geometry.ts`. Real dimensions from Matt = edit numbers there, nothing else.

### 2. 3D catalogue — Range tab (built)

Apple-style showroom: one big 3D stage (drag to spin), a five-pad lineup to switch, the published spec sheet and sizes, and **Buy the …** straight to that pad's product page on thepadking.com.au (links confirmed by owner). Also links to the pad's polishes in Pad Match and, for Spitfire, the pad maker. Deep links: `/range?pad=midas`.

Range per the site: Afterburner (levelling & cutting), Frostbite Cutting Pad (cutting, now light blue), Lone Star Red, Midas Touch Gold (finishing), Spitfire Green (all rounder). One catalogue (`lib/pads.ts`) feeds Range and Match; specs only where Matt's site publishes a figure.

Later: live prices/stock from WooCommerce (needs read-only keys).

### 3. Pad Match — pad → polishes (built)

Owner direction: "you press on a pad and it suggests a few polishes that are good with the pad", **brands limited to 3D, Sonax, Koch Chemie and P&S** (owner wrote "PNS" — P&S Detail Products: Rehab Correction Crème, Therapy Final Polish), and **images, not just words**.

- All 5 stock pads (custom Spitfire builds use the Spitfire list). Tap a pad → 3D pad recolours/reshapes → its polishes as **product tiles**: bottle art (silhouette per brand, two bottles for combos) on a glow in the pad's colour, brand, product, stage tag, manufacturer spec where published (Sonax Perfect Finish Cut 4 · Gloss 6, Ultimate Cut Cut 6 · Gloss 3), Matt's note, **Matt's pick** badge, Find a stockist.
- **Matt wants real bottles (2026-10-02)**: product photos, or at least the brands. Each polish has a `photos` slot (one cut-out per bottle, combos take two). Once a polish has photos the tile shows them, with a combo's second bottle tucked behind the first; until then it draws the Pad King-styled bottle art. The photos themselves are still to come (open item 18).
- **Matt's picks** (badged) come from his published write-ups, filtered to the four brands:
  - Spitfire Green: 3D ACA 510 + 520 ("magic combo"), Koch Chemie H9 + F6 (75/25), 3D One, Sonax Perfect Finish, Koch Chemie M3 (finishing).
  - Afterburner: Sonax Ultimate Cut, 3D ACA 510, 3D One, Sonax Perfect Finish, 3D ACA 520. Tip: 10 mm sanding interface on a DA.
  - Midas / Frostbite / Lone Star: 3D One (from his one-step guide).
- **Matched to the pad's job (not Matt's — he should confirm):** Afterburner + Koch H9, P&S Rehab; Spitfire + P&S Rehab, P&S Therapy; Frostbite (one-step on harder paints) → P&S Rehab, Sonax Perfect Finish, 3D ACA 510 + 520, Koch H9 + F6; Lone Star (softer paints) → Sonax Perfect Finish, P&S Therapy (P&S rate it for soft, sensitive clears), 3D ACA 520, Koch M3; Midas (finishing) → Sonax Perfect Finish, 3D ACA 520, Koch M3, P&S Therapy.
- Stage tags from each product's role; P&S Rehab one-step ("corrects and finishes in one step"), Therapy finish.
- **Frostbite is light blue now** (recent change, owner) — renders `#7CB6DD`, a touch lighter than Afterburner `#5A9FCF`; Afterburner is also a much flatter disc. Product name is **Frostbite Cutting Pad** (owner; "White" dropped with the colour change).
- **Stockist links:** web search until Matt gives stockists or affiliate links.

### Phone install, share preview, analytics (built)

- **Install:** manifest + PNG icons (normal and maskable) + Apple touch icon, all rendered from one SVG. Phones get a banner after 20 s: one-tap Install on Android, Share → Add to Home Screen steps on iPhone Safari; dismissed = quiet for two weeks. Shortcuts to Build, Match, Range from the home-screen icon.
- **Offline:** service worker caches assets and visited pages; anything else shows an offline screen with the phone number.
- **Share preview:** 1200×630 (rendered at 2×) card with the whole range in real 3D and "Build your own pad." Per-page titles and descriptions. Needs `NEXT_PUBLIC_SITE_URL` once the domain is known (automatic on Vercel).
- **Analytics:** off until Plausible (recommended, cookieless) or GA4 is set by env. Events: pad picks, buy clicks, stockist clicks, build requests opened/sent/failed, installs. Customer details never go into events.
- **Privacy line** on the build request form: "Your details are only used to reply about this build." Matt to OK the wording.

### 4. Simulator

Dropped by owner in favour of Pad Match (a motion simulator was built and removed — in git history if ever wanted).

### 5. Reordering (phase 4)

One-tap reorder from WooCommerce order history (fallback: WooCommerce's "Order again"). Smart reminders by **email**, based on time since purchase × pad life (needs Matt's lifespan figure).

### Home: The Pad King story (built, 2026-10-02)

Matt's direction: the home page becomes a timeline of how his pads were created, generation by generation, Apple product-page style, with images and descriptions.

- Chapters: **1993** (Matt starts detailing) → **The problem** (velcro failure: solvents, heat, 70 °C hot melt) → **2014** (European foam partners, 50–100+ h per pad, CNC 90/140/150 mm) → **GEN I** → **The glue** (120 °C on Velcro® brand loop vs ~70 °C) → **GEN II · Super Series · Nexus Foams** (non-porous interface layer) → **2024** (nearly ten foam companies incl. the world's largest) → **GEN III · Elite Series** (Japanese foam, Q4 2026; Australian-made 120/150/200 °C adhesives).
- Every line is from Matt's site (sources in `lib/history.ts`). Years only where his site states them; the generations are labelled instead.
- **Inference for Matt to confirm:** Gen I = foam on Velcro® loop with no interface layer (his site says Gen II added the interface).
- Gen I → glue → Gen II is a pinned 3D sequence: the pad turns, the glue line glows, and Gen II's yellow interface stripe fades in, placed from Matt's side-on photo.
- Photos: Matt's Gen II shots, cut out for the dark page. **Every pad with a stripe through the middle is a Gen II** (owner). The plain red disc photo is not used until Matt says what it is.
- **Elite Series logo:** only in the Gen III chapter for now (owner); the app header/icon keep the current wordmark.

### 3D realism from the real pad (2026-10-02)

Luka photographed a real Spitfire Green (face, sides, back). From those photos:

- **Stock edge** (`edge: "stock"`, used for every shop pad, not a maker option): the face is about the velcro's width, the rim rolls out past it with a soft radius (0.3 × foam height), then a straight side tapers back in to the velcro. Matches Matt's own velcro/face sizing (e.g. 75/90).
- **Foam colour**: the pad itself renders in its real lime — 3D albedo `#6FE271`, calibrated so the render matches the photo (face ≈ `#72E94F`) under the studio light. UI accents (swatch glows, range bands) stay the deeper `#3FA02C` per the earlier "rich, not fluro" direction; pad-picker chips use the real colour so they match the product.
- **Foam grain**: open-cell grain sized to the close-ups (visible pores, not a smooth skin).
- **Velcro**: neutral dark grey, with the real back print (Pad King shield, "PAD KING", "SPITFIRE GREEN ALL ROUNDER") lifted from the back photo into a mask texture (`public/textures/spitfire-back-print.png`).
- Stock pads show no dark interface band (the real Spitfire has none visible): the 3D draws that ring as more of the foam (`seamless`). The pad maker keeps its labelled interface layer for the exploded view.

Then a real Frostbite (face, back, two sides):

- **Straight edge** (`edge: "straight"`): near-vertical sides, the face only ~1.5 mm wider than the velcro per side, and a tighter rounded rim (0.2 × foam height).
- **Proportions**: height ≈ 0.22 × face diameter, so it's drawn 17 mm high at the stage's 75 mm velcro (real sizes still to measure).
- **Two foams**:
  - Light-blue cutting foam, 3D albedo `#45CDFF`. The warm studio light caps the blue channel, so the render matches the photo's hue (≈ `#3DCCEE`) a touch darker.
  - A charcoal backing foam over the back ~35 % of the side, albedo `#787C86`, finer grain than the blue.
- **Velcro**: darker charcoal loop with fine knitted ribs (~170 across the back), no print. Velcro brightness is on the same scale as the Spitfire's, so the Frostbite's reads darker, as in the photos.
- The UI colour stays `#7CB6DD`; chips use the real colour.
- **Method** (for the next pads): sample the photo medians (white balance checked against the shed floor, which matches the Spitfire shots), then iterate the albedo in linear space until the render's median matches under the studio light.
- **Still to confirm**: calipers (face/velcro diameters, height, which size was photographed), and photos of Afterburner, Lone Star and Midas.

Then the Midas (owner: "needs a black line around"), measured off Matt's shelf photo of the orange-gold pads:

- Black backing foam across the back of the side, from 0.78 of the foam height, plus a dark velcro. Black is ~34 % of the visible side in the photo and 33 % in the render.
- A band now keeps its own sheen (the gold foam's sheen was tinting the black brown). It also makes the Gen II stripe's sheen yellow, and the Frostbite's grey a touch more neutral.

## Design system (built)

### Colour tokens — `app/globals.css`

| Token | Value | Use |
|---|---|---|
| `--pk-bg` | `#08080A` | canvas |
| `--pk-surface` / `-2` | `#111114` / `#18181D` | panels, inputs |
| `--pk-text` / `-2` | `#F5F2EA` / `#A8A49A` | primary / secondary text |
| `--pk-muted` | `#6B675F` | labels/large text only (~3.6:1) |
| `--pk-gold` / `-hi` / `-deep` | `#C99A4A` / `#ECD3A0` / `#84601F` | accent, CTA fill, metallic type ramp |
| `--pk-orange` | `#E2621B` | burnt ember — the "touch": sheen edge, live dots, cut tags, errors. Never an area |
| `--pk-spitfire` | `#3FA02C` | photo sample was `#6BE846`; deepened per owner. **Product only** — no UI uses green |

**Owner direction (2026-10-01): all colours deep and rich, never fluro.** Pad foams: Spitfire `#3FA02C`, Afterburner `#5A9FCF`, Frostbite `#7CB6DD` (light blue, recently changed; the 3D pad uses the photographed colours, see above), Lone Star `#B01C26`, Midas `#C78E1F`. 3D foam sheen lifts only 30 % toward white so colours stay saturated.

### Signature moves

- **Studio backdrop** — product-studio black: a soft gold key light glides side to side with scroll (and drifts slowly on its own), a warm floor bounce, faint foam-cell grain, and on desktop a dim light follows the pointer. Gold type catches the same light. The products supply the colour. Transform-only, static under reduced motion.
- **Range bands** — the five pad colours as a row of short bands (after the stacked pads in Matt's logo and the Gen II stripe). Used sparingly: hero eyebrow, footer hairline, share card.
- **Scroll timing rule** — every scrubbed animation is fully played by the time its visual is centred on screen (`inView()` in `components/history/useScrollFx.ts`); `tests/e2e/timing.mjs` checks it.
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
| Home | `/` | **The Pad King story** — scroll timeline 1993 → Elite Series |
| Range | `/range` | **Showroom live** — all five pads in 3D, specs, sizes, buy links |
| Build | `/build` | Custom pad maker (live) |
| Match | `/match` | **Pad Match live** — tap a pad, get the polishes Matt pairs with it |
| Reorder | `/orders` | Teaser — one-tap reorder + email reminders is phase 4 |

Tabs are one array in `components/TabBar.tsx`.

## Build order

0. ~~Look sign-off~~ → **built as real code**: landing scroll story + pad maker. Awaiting Matt's reaction.
1. Pad maker → email to Matt — **built** (needs email env vars + Matt's address).
2. 3D catalogue — **built** (Range tab; static catalogue, WooCommerce live data later).
3. Compatibility selector — **built** as Pad Match (simulator dropped by owner).
3b. Install, offline, share preview, analytics — **built** (analytics needs an account).
4. Store sign-in, one-tap reorder, email reminders.

## Open items

| # | Item | Blocks |
|---|---|---|
| 1 | Vector logo (SVG/AI/PDF) | Header/footer polish |
| 2 | Full Tilt edge — real shape | Pad accuracy (later) |
| 3 | Flower Power — confirm the shape once testing is done (modelled from one photo: petal size, groove width and depth are estimates) | Pad accuracy (later) |
| 4 | Real dimensions for each edge/face profile | Pad accuracy (later) |
| 5 | Matt's inbox for build requests + a Resend account (or other email provider) | Going live with requests |
| 6 | Pad specs (density, cut, speed range, lifespan) + compound list | Phase 3, reminders |
| 7 | WooCommerce REST API keys (read-only) | Phases 2, 4 |
| 8 | Hosting account + who pays | Launch |
| 9 | thepadking.com.au blocked by this dev environment's network policy | Research only |
| 10 | Analytics: Plausible or GA4 account → `NEXT_PUBLIC_PLAUSIBLE_SRC` / `NEXT_PUBLIC_GA_ID` | Visit + event numbers |
| 11 | Public domain for the app → `NEXT_PUBLIC_SITE_URL` (not needed on Vercel) | Share previews pointing at the live app |
| 12 | Matt OK on the privacy line wording | Going live with requests |
| 13 | Gen I and Gen II launch years, and confirm the Gen I description (no interface layer) | Timeline accuracy |
| 14 | What the plain red disc with black backing is | Using that photo |
| 15 | Transparent / vector Elite Series logo (current one is cut out from a PNG) | Sharper Elite chapter |
| 16 | Raised crosscut: exact square size and height (built as ~3.6 mm squares, ~1 mm proud) | Pad maker accuracy |
| 17 | Calipers on the Spitfire and Frostbite (face Ø, velcro Ø, height, which size) + photos of Afterburner, Lone Star, Midas | 3D accuracy for the range |
| 18 | Bottle photos for the 10 polishes (or network access to the brands' sites, and Matt's OK to use their product shots) | Real bottles in Pad Match |
