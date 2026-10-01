// Renders the share-preview image (app/opengraph-image.jpg) from the /og-card page.
// Run against a production build:  npx next build && npx next start -p 3100
//   node scripts/og.mjs [baseUrl=http://localhost:3100] [out=app/opengraph-image.jpg]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.argv[3] ?? "app/opengraph-image.jpg";

const browser = await chromium.launch({
  executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
// 2x so the preview stays sharp on phone screens; still 1.91:1 like 1200×630
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.goto(`${base}/og-card`, { waitUntil: "networkidle" });
await page.waitForSelector("html[data-og-ready]", { state: "attached", timeout: 180_000 });
await page.evaluate(() => document.fonts.ready);
await page.locator("#og-card").screenshot({ path: out, type: "jpeg", quality: 88 });
console.log("wrote", out);
await browser.close();
