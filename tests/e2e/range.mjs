// Range showroom visual pass. usage: node tests/e2e/range.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "shots-range";
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
  await page.goto(`${base}/range?pad=midas`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const stageY = async () => page.evaluate(() => document.querySelector(".pk-solid").getBoundingClientRect().top + scrollY - 80);
  await page.evaluate((y) => scrollTo(0, y), await stageY());
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-1-midas-deeplink.png` });
  await page.getByRole("button", { name: "Next pad" }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-2-next.png` });
  await page.locator("label", { hasText: /^Afterburner/ }).first().click();
  await page.waitForTimeout(2500);
  await page.evaluate(() => scrollTo(0, document.querySelector("dl").getBoundingClientRect().top + scrollY - 200));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${name}-3-afterburner-detail.png` });
  const buy = await page.getByRole("link", { name: /Buy the/ }).getAttribute("href");
  const match = await page.getByRole("link", { name: /Polishes for this pad/ }).getAttribute("href");
  console.log(name, "buy:", buy, "match:", match, "url:", page.url());
  await ctx.close();
}
await browser.close();
console.log("console errors:", errors.length ? "\n" + errors.join("\n") : "none");
