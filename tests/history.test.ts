import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CAUSES, CHAPTERS, ELITE_CLAIMS, GEN2_POINTS, PHOTOS } from "@/lib/history";

describe("history timeline", () => {
  it("runs 1993 → Elite in order, one chapter per id", () => {
    expect(CHAPTERS.map((c) => c.id)).toEqual(["1993", "problem", "2014", "gen1", "glue", "gen2", "2024", "gen3"]);
  });

  it("every chapter has copy and cites Matt's own site", () => {
    for (const c of CHAPTERS) {
      expect(c.title[0].length).toBeGreaterThan(0);
      expect(c.title[1].length).toBeGreaterThan(0);
      expect(c.body.length).toBeGreaterThan(20);
      expect(c.sources.length).toBeGreaterThan(0);
      for (const s of c.sources) expect(s.startsWith("https://thepadking.com.au")).toBe(true);
    }
  });

  it("only states years Matt's site states", () => {
    const years = CHAPTERS.flatMap((c) => `${c.eyebrow} ${c.body}`.match(/\b(19|20)\d{2}\b/g) ?? []);
    for (const y of years) expect(["1993", "2014", "2024", "2026"]).toContain(y);
  });

  it("has the supporting lists", () => {
    expect(CAUSES).toHaveLength(3);
    expect(GEN2_POINTS).toHaveLength(3);
    expect(ELITE_CLAIMS).toHaveLength(4);
  });

  it("every photo exists in both sizes", () => {
    for (const p of Object.values(PHOTOS)) {
      for (const w of [800, p.w]) {
        expect(fs.existsSync(path.join("public", `${p.src}-${w}.webp`))).toBe(true);
      }
      expect(p.alt.length).toBeGreaterThan(10);
    }
  });
});
