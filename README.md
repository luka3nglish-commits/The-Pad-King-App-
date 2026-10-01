# The Pad King App

The Pad King's customer app — Spitfire Green story and the custom pad maker. Built for Matt's Magic Detail Tech.

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
npm test             # geometry (all 360 builds), Motion Lab kinematics, build-request validation
npm run build
```

Visual pass (screenshots of every story beat and maker state, plus a console-error audit) against a running server:

```bash
npm run build && npx next start -p 3100 &
node tests/e2e/shots.mjs shots http://localhost:3100
node tests/e2e/lab.mjs shots-lab http://localhost:3100   # Motion Lab states
```

## Build requests by email

The pad maker posts to `/api/build-request`, which emails Matt via [Resend](https://resend.com). Copy `.env.example` to `.env.local` and fill in:

| Variable | What |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `BUILD_REQUEST_TO` | Matt's inbox (comma-separate for several) |
| `BUILD_REQUEST_FROM` | Verified sender, e.g. `The Pad King <builds@thepadking.com.au>` |

Without these the endpoint returns 503 and the form tells the customer to call — it never pretends a request was sent.

## Where things live

| Change | File |
|---|---|
| Pad maker options (sizes, heights, edges, faces, copy) | `lib/pad/options.ts` |
| Pad shapes (edge profiles, face bosses, groove patterns) | `lib/pad/geometry.ts` |
| Foam look (cells, grooves shader) | `lib/pad/foamMaterial.ts` |
| Bottom tabs (order, names, icons) | `components/TabBar.tsx` |
| Colours, type, motion tokens | `app/globals.css` |
| Scroll story choreography + copy | `components/hero/` |
| Pad maker UI + request form | `components/maker/` |
| Motion Lab physics (speeds, throws, illustrative DA spin) | `lib/sim.ts` |
| Motion Lab UI | `components/match/MotionLab.tsx` |
| Coming-soon tabs (Range, Reorder) | `app/range`, `app/orders` |
