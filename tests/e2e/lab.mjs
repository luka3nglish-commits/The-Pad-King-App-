// Motion Lab visual pass. usage: node tests/e2e/lab.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "shots-lab";
const base = process.argv[3] ?? "http://localhost:3100";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const errors = [];
for (const [name, viewport, dsf] of [["desktop", { width: 1440, height: 900 }, 1], ["mobile", { width: 390, height: 844 }, 2]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf, isMobile: viewport.width < 800, hasTouch: viewport.width < 800 });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${name}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${name}] ${e.message}`));
  await page.goto(`${base}/match`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${name}-1-intro.png` });
  await page.locator("canvas").first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -90));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${out}/${name}-2-da.png` });
  await page.locator("label", { hasText: /^21mm$/ }).click();
  await page.locator("label", { hasText: /^Light$/ }).click();
  await page.locator("label", { hasText: /^150$/ }).click();
  await page.waitForTimeout(3000);
  await page.locator("canvas").first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -90));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${name}-3-da-21mm.png` });
  await page.locator("label", { hasText: /^Rotary$/ }).click();
  await page.waitForTimeout(3000);
  await page.locator("canvas").first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -90));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${name}-4-rotary.png` });
  if (viewport.width < 800) {
    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${name}-5-readouts.png` });
  }
  await ctx.close();
}
await browser.close();
console.log("console errors:", errors.length ? "\n" + errors.join("\n") : "none");
