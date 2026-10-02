# The Pad King App

The Pad King's customer app: the Pad King story (1993 to the Elite Series), the custom pad maker, Pad Match and the range in 3D. Installs on phones like a native app. Built for Matt's Magic Detail Tech.

Spec and decisions: [`docs/specs/2026-10-01-pad-king-app-v1.md`](docs/specs/2026-10-01-pad-king-app-v1.md)

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

## Checks

```bash
npm run typecheck
npm run lint
npm test             # geometry (all 360 builds), Pad Match data, build-request validation
npm run build
```

Visual pass (screenshots of every timeline chapter and maker state, plus a console-error audit) against a running server:

```bash
npm run build && npx next start -p 3100 &
node tests/e2e/shots.mjs shots http://localhost:3100
node tests/e2e/match.mjs shots-match http://localhost:3100   # Pad Match states
node tests/e2e/home.mjs shots-home http://localhost:3100     # home timeline, every chapter
node tests/e2e/range.mjs shots-range http://localhost:3100   # Range showroom + buy links
node tests/e2e/pwa.mjs shots-pwa http://localhost:3100 "--stop-cmd=fuser -k 3100/tcp"   # install + offline (stops the server to fake an outage)
```

`tests/e2e/analytics.mjs` checks the analytics events. It needs a build with a provider switched on (see the top of the file).

## Build requests by email

The pad maker posts to `/api/build-request`, which emails Matt via [Resend](https://resend.com). Copy `.env.example` to `.env.local` and fill in:

| Variable | What |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `BUILD_REQUEST_TO` | Matt's inbox (comma-separate for several) |
| `BUILD_REQUEST_FROM` | Verified sender, e.g. `The Pad King <builds@thepadking.com.au>` |

Without these the endpoint returns 503 and the form tells the customer to call — it never pretends a request was sent.

## Phone install

The app installs to the home screen (Android: one-tap Install; iPhone: Share > Add to Home Screen) and keeps working offline for pages already opened.

- Icons are drawn once in `scripts/icon.svg.mjs`; `node scripts/icons.mjs` re-renders every PNG size.
- `public/sw.js` is the service worker. Bump `VERSION` in it whenever its precache list changes.
- The install banner shows on phones after 20 s and stays away for two weeks once dismissed. Add `?install-preview` to any URL to see it straight away, on desktop too.

## Share preview

When a link to the app is shared (Messages, WhatsApp, Facebook, X), it shows `app/opengraph-image.jpg`: the whole range in 3D with "Build your own pad." The image is a screenshot of the `/og-card` page, so it uses the real pad renders. After changing the card or the pads, re-render it:

```bash
npm run build && npx next start -p 3100 &
node scripts/og.mjs http://localhost:3100
npm run build   # pick up the new image
```

Set `NEXT_PUBLIC_SITE_URL` to the app's public address so share links point at the right place. On Vercel it's filled in automatically.

## Analytics

Off until one provider is set in the environment:

| Variable | Provider |
|---|---|
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | [Plausible](https://plausible.io) (recommended: no cookies, so no consent banner). The script URL from Site settings > Site installation. |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID (`G-...`) |

Page views (including tab switches) are counted by the provider. On top of that, `track()` in `lib/analytics.ts` sends:

| Event | When | Props |
|---|---|---|
| `range_select` | A pad is picked on the Range tab | `pad` |
| `range_buy_click` | "Buy the ..." is tapped | `pad` |
| `match_select` | A pad is picked in Pad Match | `pad` |
| `stockist_click` | A polish's stockist link is tapped | `polish`, `pad` |
| `build_request_open` | The build request form opens | `build` (code) |
| `build_request_sent` / `build_request_failed` | The request sends / doesn't | `build`, `quantity` / `reason` |
| `install_prompt_shown`, `install_accepted`, `install_dismissed`, `app_installed` | Install banner and installs | `platform` |

Customer details (name, email, phone) never go into events.

## Where things live

| Change | File |
|---|---|
| Pad maker options (sizes, heights, edges, faces, copy) | `lib/pad/options.ts` |
| Pad shapes (edge profiles, face bosses, groove patterns) | `lib/pad/geometry.ts` |
| Foam look (cells, grooves shader) | `lib/pad/foamMaterial.ts` |
| Bottom tabs (order, names, icons) | `components/TabBar.tsx` |
| Colours, type, motion tokens | `app/globals.css` |
| Home timeline copy (chapters, causes, Gen II points, Elite claims) | `lib/history.ts` |
| Home timeline layout and animation | `components/history/` |
| Matt's photos and the Elite logo (cut out, WebP) | `public/history/` |
| Pad maker UI + request form | `components/maker/` |
| Stock pads (names, colours, specs, sizes, buy links) | `lib/pads.ts` |
| Pad Match data (polishes, Matt's notes, stockist links) | `lib/match.ts` |
| Pad Match UI | `components/match/` |
| Range showroom | `components/range/` |
| Reorder tab (coming soon) | `app/orders` |
| App icons, install banner, offline | `scripts/icons.mjs`, `components/InstallPrompt.tsx`, `public/sw.js`, `app/offline` |
| Share preview card | `components/og/`, `scripts/og.mjs` |
| Analytics | `components/Analytics.tsx`, `lib/analytics.ts` |
