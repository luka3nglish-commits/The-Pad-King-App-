// Visual pass: screenshots of every beat + maker states, and a console-error audit.
// usage: node tests/e2e/shots.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "shots";
const base = process.argv[3] ?? "http://localhost:3100";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const errors = [];

async function run(name, viewport, dsf) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf, hasTouch: viewport.width < 800, isMobile: viewport.width < 800 });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${name}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${name}] pageerror ${e.message}`));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-01-hero.png` });

  // the home timeline has its own pass: tests/e2e/home.mjs

  // navigate with the bottom tab bar, like a user would
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Build" }).click();
  await page.waitForURL("**/build");
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${out}/${name}-05-maker.png` });
  await page.evaluate(() => window.scrollTo(0, 420));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-05b-maker-viewer.png` });

  // change options
  await page.getByText("Cone", { exact: true }).click();
  await page.getByText("Waffle", { exact: true }).click();
  await page.locator("label", { hasText: /^40/ }).first().click();
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollTo(0, 420));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${name}-06-maker-changed.png` });

  await page.getByRole("button", { name: /Inspect layers/ }).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}/${name}-07-maker-exploded.png` });

  await page.getByRole("button", { name: "Send build to The Pad King" }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Send build request" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}-08-sheet-errors.png` });
  await page.getByLabel(/^Name/).fill("Jordan Reyes");
  await page.getByLabel(/^Email/).fill("jordan@example.com");
  await page.getByRole("button", { name: "Send build request" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${name}-09-sheet-result.png` });
  await page.keyboard.press("Escape");

  for (const [i, tab] of [[10, "Range"], [11, "Match"], [12, "Reorder"], [13, "Home"]]) {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: tab }).click();
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${out}/${name}-${i}-tab-${tab.toLowerCase()}.png` });
  }
  await ctx.close();
}

await run("desktop", { width: 1440, height: 900 }, 1);
await run("mobile", { width: 390, height: 844 }, 2);
await browser.close();
// the 503 from the unconfigured email endpoint is expected and handled in the UI
const real = errors.filter((e) => !/503/.test(e));
console.log("console errors:", real.length ? "\n" + real.join("\n") : "none");
console.log("expected 503s:", errors.length - real.length);
