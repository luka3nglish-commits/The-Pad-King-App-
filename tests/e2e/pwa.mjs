// Install/offline checks. usage: node tests/e2e/pwa.mjs <outDir> [baseUrl]
import { chromium, devices } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "shots-pwa";
const base = process.argv[3] ?? "http://localhost:3100";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const fail = [];
const ok = (cond, msg) => (cond ? console.log("✓", msg) : (fail.push(msg), console.log("✗", msg)));

// 1. manifest + icons
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const res = await page.goto(`${base}/manifest.webmanifest`);
  const m = await res.json();
  ok(m.display === "standalone" && m.icons.some((i) => i.purpose === "maskable"), "manifest: standalone with maskable icon");
  for (const icon of m.icons) {
    const r = await page.request.get(`${base}${icon.src}`);
    ok(r.ok() && r.headers()["content-type"].includes("png"), `icon ${icon.src}`);
  }
  const apple = await page.request.get(`${base}/apple-icon.png`);
  ok(apple.ok(), "apple touch icon");
  await page.goto(base);
  const links = await page.evaluate(() => ({
    manifest: !!document.querySelector('link[rel="manifest"]'),
    apple: !!document.querySelector('link[rel="apple-touch-icon"]'),
    og: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
  }));
  ok(links.manifest && links.apple, "head links manifest + apple-touch-icon");
  ok(!!links.og && new URL(links.og).pathname === "/opengraph-image.jpg", "share image linked (og:image)");
  await ctx.close();
}

// 2. install banner (preview mode skips the 20s wait)
for (const [name, device, expect] of [["iphone", devices["iPhone 13"], "Add to Home Screen"], ["android", devices["Pixel 7"], "Install"]]) {
  const ctx = await browser.newContext({ ...device });
  const page = await ctx.newPage();
  await page.goto(`${base}/?install-preview`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const banner = page.getByRole("dialog", { name: "Install The Pad King app" });
  ok(await banner.isVisible(), `${name}: banner visible`);
  ok((await banner.textContent()).includes(expect), `${name}: shows "${expect}"`);
  await page.screenshot({ path: `${out}/banner-${name}.png` });
  await banner.getByRole("button", { name: "Not now" }).click();
  await page.waitForTimeout(400);
  ok(!(await banner.isVisible()), `${name}: dismiss hides it`);
  const snoozed = await page.evaluate(() => Number(localStorage.getItem("pk-install-snoozed-until")) > Date.now());
  ok(snoozed, `${name}: dismissal remembered for two weeks`);
  await ctx.close();
}

// 3. service worker + offline. Playwright's setOffline() doesn't cut service-worker
// traffic, so a real outage is simulated by stopping the server (pass --stop-cmd).
{
  const stopCmd = process.argv.find((a) => a.startsWith("--stop-cmd="))?.slice(11);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/range`, { waitUntil: "networkidle" });
  const active = await page.evaluate(async () => {
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 8000))]);
    return !!reg?.active;
  });
  ok(active, "service worker active");
  await page.reload({ waitUntil: "networkidle" }); // now controlled; /range is cached
  await page.waitForTimeout(1500);
  if (stopCmd) {
    const { execSync } = await import("node:child_process");
    execSync(stopCmd);
    await page.waitForTimeout(800);
    await page.goto(`${base}/range`).catch(() => {});
    await page.waitForTimeout(1500);
    ok((await page.locator("h1").first().textContent())?.toLowerCase().includes("range"), "offline: visited page served from cache");
    await page.goto(`${base}/orders`).catch(() => {});
    await page.waitForTimeout(1200);
    ok((await page.content()).includes("offline."), "offline: unvisited page shows offline screen");
    await page.screenshot({ path: `${out}/offline.png` });
  } else {
    console.log("  (skipped real-outage checks: no --stop-cmd)");
  }
  await ctx.close();
}

await browser.close();
console.log(fail.length ? `\n${fail.length} FAILED` : "\nall passed");
process.exit(fail.length ? 1 : 0);
