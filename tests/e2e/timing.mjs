// Scroll-timing check: every scrubbed animation must be fully played by the time
// its visual sits in the middle of the screen (not as the next chapter arrives).
// usage: node tests/e2e/timing.mjs [baseUrl]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";
const browser = await chromium.launch({
  executablePath: process.env.PK_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
let failed = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) failed++;
};

for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  await page.goto(base, { waitUntil: "networkidle" });
  // scroll in steps so each element's centre lands on the middle of the screen
  const centre = async (sel, frac = 0.5) => {
    const y = await page.evaluate(([sel, frac]) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2 - window.innerHeight * frac;
    }, [sel, frac]);
    const from = await page.evaluate(() => window.scrollY);
    for (let i = 1; i <= 8; i++) {
      await page.evaluate((v) => window.scrollTo(0, v), from + ((y - from) * i) / 8);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(1200);
  };
  const op = (sel) => page.evaluate((s) => Number(getComputedStyle(document.querySelector(s)).opacity), sel);

  await centre("#ch-1993 [data-years]");
  check((await page.textContent("[data-years]")) === "30", `${name}: 1993 counter reads 30 when centred`);

  await centre("#ch-problem [data-peel]");
  check((await op("[data-label=peel]")) > 0.95, `${name}: problem diagram finished (velcro peeled) when centred`);

  await centre('#ch-2014 [data-ring="2"]');
  const dash = await page.evaluate(() => Number(document.querySelector('[data-ring="2"]').getAttribute("stroke-dashoffset")));
  check(dash < 0.02, `${name}: 2014 rings fully drawn when centred (offset ${dash.toFixed(3)})`);

  await centre("#ch-2024 svg");
  check((await op("[data-largest]")) > 0.95, `${name}: 2024 network fully lit when centred`);

  // pinned 3D: halfway through each beat's window its full state must be showing
  for (const [beat, p] of [["glue", 0.5], ["gen2", 0.84]]) {
    const y = await page.evaluate((p) => {
      const s = document.getElementById("gen-seq");
      return s.offsetTop + (s.offsetHeight - window.innerHeight) * p;
    }, p);
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(1500);
    if (beat === "glue") {
      const v = await page.evaluate(() => Number(getComputedStyle(document.querySelector("#gen-seq [data-gauge]")).getPropertyValue("--v")));
      check(Math.abs(v - 0.6) < 0.02, `${name}: glue gauge at 120 °C midway through its beat (${(v * 200).toFixed(0)} °C)`);
    } else {
      const shown = await page.evaluate(() => Number(getComputedStyle(document.querySelectorAll("#gen-seq [data-beat]")[2]).opacity));
      check(shown > 0.95, `${name}: Gen II copy fully in during its beat`);
    }
  }

  await centre("#ch-gen3 [data-logo]");
  const logo = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector("[data-logo]"));
    return { o: Number(cs.opacity), f: cs.filter };
  });
  check(logo.o > 0.95 && /blur\(0px\)|none/.test(logo.f), `${name}: Elite logo sharp when centred (${logo.f})`);
  await page.close();
}
await browser.close();
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
