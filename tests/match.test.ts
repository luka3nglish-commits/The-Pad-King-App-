import { describe, expect, it } from "vitest";
import { PADS, POLISHES, buyHref, picksFor } from "@/lib/match";

describe("pad match data", () => {
  it("has all five stock pads with at least three picks each", () => {
    expect(PADS.map((p) => p.id).sort()).toEqual(["afterburner", "frostbite", "lone-star", "midas", "spitfire"]);
    for (const pad of PADS) expect(pad.picks.length).toBeGreaterThanOrEqual(3);
  });

  it("every pick points at a known polish, with no duplicates per pad", () => {
    const ids = new Set(POLISHES.map((p) => p.id));
    expect(ids.size).toBe(POLISHES.length);
    for (const pad of PADS) {
      for (const pick of pad.picks) expect(ids.has(pick.polish)).toBe(true);
      expect(new Set(pad.picks.map((p) => p.polish)).size).toBe(pad.picks.length);
    }
  });

  it("orders picks cut → one-step → finish, unconfirmed roles last", () => {
    const spitfire = picksFor(PADS.find((p) => p.id === "spitfire")!);
    const order = spitfire.map((p) => p.polish.stages[0] ?? "zz");
    const rank = { cut: 0, "one-step": 1, finish: 2, zz: 9 } as const;
    const ranks = order.map((s) => rank[s as keyof typeof rank]);
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
  });

  it("only cites Matt's own site", () => {
    for (const pad of PADS) expect(pad.sourceUrl.startsWith("https://thepadking.com.au/")).toBe(true);
  });

  it("falls back to a search link until a stockist is set", () => {
    const p = POLISHES.find((x) => x.id === "3d-one")!;
    expect(buyHref(p)).toContain("google.com/search?q=3D%20One");
    expect(buyHref({ ...p, buyUrl: "https://example.com/3d-one" })).toBe("https://example.com/3d-one");
  });
});
