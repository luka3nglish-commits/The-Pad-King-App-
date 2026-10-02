import { describe, expect, it } from "vitest";
import {
  rawEdgeProfile,
  FACE_RINGS,
  PROFILE_N,
  SEG,
  annulusIndices,
  dimsOf,
  edgeProfile,
  flowerPetals,
  grooveDepth,
  padState,
  resample,
  ringIndices,
  type Part,
} from "@/lib/pad/geometry";
import { COMBINATIONS, EDGES, FACES, SIZES, THICKNESSES, buildCode, parseBuild, type PadBuild } from "@/lib/pad/options";

function* allBuilds(): Generator<PadBuild> {
  for (const size of SIZES)
    for (const thickness of THICKNESSES)
      for (const e of EDGES) for (const f of FACES) yield { size, thickness, edge: e.id, face: f.id };
}

/** Fraction of non-degenerate triangles whose winding normal agrees with `expected`. */
function windingAgreement(part: Part, idx: Uint32Array, expected: (vi: number) => [number, number, number]) {
  const p = part.pos;
  let ok = 0;
  let total = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]];
    const ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2];
    const vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (Math.hypot(nx, ny, nz) < 1e-9) continue;
    const e = expected(a);
    total++;
    if (nx * e[0] + ny * e[1] + nz * e[2] > 0) ok++;
  }
  return ok / total;
}

const fromNormals = (part: Part) => (vi: number): [number, number, number] => [
  part.nrm![vi * 3],
  part.nrm![vi * 3 + 1],
  part.nrm![vi * 3 + 2],
];

describe("pad options", () => {
  it("covers all 450 owner-confirmed combinations", () => {
    expect(COMBINATIONS).toBe(450);
    expect([...allBuilds()]).toHaveLength(450);
  });

  it("round-trips builds and rejects junk", () => {
    const b: PadBuild = { size: 65, thickness: 16, edge: "cone", face: "waffle" };
    expect(parseBuild(JSON.parse(JSON.stringify(b)))).toEqual(b);
    expect(buildCode(b)).toBe("SPF-65-16-CON-WFL");
    expect(parseBuild({ ...b, size: 90 })).toBeNull();
    expect(parseBuild({ ...b, edge: "rupes" })).toBeNull();
    expect(parseBuild(null)).toBeNull();
  });
});

describe("pad geometry", () => {
  it("resamples to exact counts and keeps the endpoints", () => {
    const r = resample([[0, 0], [1, 0], [1, 1]], 21);
    expect(r).toHaveLength(21);
    expect(r[0]).toEqual([0, 0]);
    expect(r[20][0]).toBeCloseTo(1);
    expect(r[20][1]).toBeCloseTo(1);
    expect(r[10][0]).toBeCloseTo(1); // halfway along the length is the corner
  });

  it("every profile starts at the face and ends on the velcro edge", () => {
    for (const size of SIZES)
      for (const thickness of THICKNESSES)
        for (const e of EDGES) {
          const { Rv, Hf, rh } = dimsOf({ size, thickness });
          const p = edgeProfile(e.id, Rv, Hf);
          expect(p).toHaveLength(PROFILE_N);
          expect(p[0][1]).toBeCloseTo(0);
          expect(p.at(-1)![0]).toBeCloseTo(Rv);
          expect(p.at(-1)![1]).toBeCloseTo(Hf);
          // the face must stay comfortably wider than the centre hole
          expect(p[0][0]).toBeGreaterThan(rh + 3);
        }
  });

  it("builds finite, fixed-length arrays for every build (so any two can morph)", () => {
    const ref = padState({ size: 75, thickness: 20, edge: "splay", face: "crosscut" });
    for (const b of allBuilds()) {
      const s = padState(b);
      for (const k of ["side", "face", "hole", "top", "iface", "velcro"] as const) {
        expect(s[k].pos.length).toBe(ref[k].pos.length);
        expect(s[k].pos.every(Number.isFinite)).toBe(true);
      }
      expect(s.minY).toBeLessThanOrEqual(0);
    }
    expect(ref.face.pos.length).toBe((FACE_RINGS + 1) * SEG * 3);
  });

  it("winds every surface outward", () => {
    const s = padState({ size: 75, thickness: 20, edge: "rounded", face: "flower" });
    expect(windingAgreement(s.side, ringIndices(PROFILE_N), fromNormals(s.side))).toBe(1);
    expect(windingAgreement(s.hole, ringIndices(2, true), fromNormals(s.hole))).toBe(1);
    expect(windingAgreement(s.top, ringIndices(2), fromNormals(s.top))).toBe(1);
    expect(windingAgreement(s.iface, annulusIndices(), fromNormals(s.iface))).toBe(1);
    expect(windingAgreement(s.velcro, annulusIndices(), fromNormals(s.velcro))).toBe(1);
    // the face looks down, out of the pad
    expect(windingAgreement(s.face, ringIndices(FACE_RINGS + 1), () => [0, -1, 0])).toBeGreaterThan(0.97);
  });

  it("stock pads: face wider than the velcro, rounded rim, side tapering back to the velcro", () => {
    const Rv = 37.5;
    const Hf = 17;
    const prof = rawEdgeProfile("stock", Rv, Hf);
    const [faceR, faceY] = prof[0];
    expect(faceY).toBeCloseTo(0);
    expect(Math.abs(faceR - Rv)).toBeLessThan(2); // the flat face is about the velcro's width
    const widest = Math.max(...prof.map((p) => p[0]));
    expect(widest).toBeGreaterThan(Rv + 3); // the rim rolls out past the velcro before the taper
    expect(widest).toBeLessThanOrEqual(Rv + 7.5);
    expect(prof[prof.length - 1]).toEqual([Rv, Hf]); // meets the velcro
    for (let i = 1; i < prof.length; i++) expect(prof[i][1]).toBeGreaterThanOrEqual(prof[i - 1][1] - 1e-9); // climbs steadily
  });

  it("straight pads (Frostbite): near-vertical side, face barely wider than the velcro", () => {
    const Rv = 37.5;
    const Hf = 14;
    const prof = rawEdgeProfile("straight", Rv, Hf);
    expect(prof[0][1]).toBeCloseTo(0);
    expect(prof[0][0]).toBeLessThan(Rv); // the rim rounds off inside the velcro's line
    const widest = Math.max(...prof.map((p) => p[0]));
    expect(widest).toBeGreaterThan(Rv);
    expect(widest).toBeLessThan(Rv + 1.6);
    expect(prof[prof.length - 1]).toEqual([Rv, Hf]);
    for (let i = 1; i < prof.length; i++) expect(prof[i][1]).toBeGreaterThanOrEqual(prof[i - 1][1] - 1e-9);
  });

  it("DRC Hole: a dish recessed round the hole, flat floor, sloping up to a flat face", () => {
    const s = padState({ size: 75, thickness: 20, edge: "rounded", face: "drc" });
    const [rf, rh] = s.faceR;
    const { Hf } = dimsOf({ size: 75, thickness: 20 });
    const ys = Array.from({ length: FACE_RINGS + 1 }, (_, i) => s.face.pos[i * SEG * 3 + 1]);
    expect(ys[0]).toBeGreaterThan(2); // recessed a few mm at the hole
    expect(ys[0]).toBeLessThan(0.3 * Hf);
    expect(ys[0]).toBeCloseTo(ys[5]); // flat floor
    expect(ys[FACE_RINGS]).toBeCloseTo(0); // the face itself is flat
    for (let i = 1; i <= FACE_RINGS; i++) expect(ys[i]).toBeLessThanOrEqual(ys[i - 1] + 1e-6); // only climbs out
    // the dish spans roughly the middle third of the face
    const rAt = (i: number) => rh + ((rf - rh) * i) / FACE_RINGS;
    const edge = ys.findIndex((y) => y < 0.01);
    expect(rAt(edge) / rf).toBeGreaterThan(0.38);
    expect(rAt(edge) / rf).toBeLessThan(0.5);
    // the hole wall starts at the dish floor
    expect(Math.min(...Array.from({ length: s.hole.pos.length / 3 }, (_, i) => s.hole.pos[i * 3 + 1]))).toBeCloseTo(ys[0]);
  });

  it("traces every face pattern in the shader and keeps the geometry flat", () => {
    const xc = padState({ size: 75, thickness: 20, edge: "rounded", face: "crosscut" });
    const flower = padState({ size: 75, thickness: 20, edge: "rounded", face: "flower" });
    const flat = padState({ size: 75, thickness: 20, edge: "rounded", face: "flat" });
    const maxY = (a: Float32Array) => a.reduce((m, v, i) => (i % 3 === 1 ? Math.max(m, v) : m), -Infinity);
    // raised crosscut: geometry stays flat; the shader traces small squares standing just proud
    expect(maxY(xc.face.pos)).toBeCloseTo(0);
    expect(xc.pat[0]).toBeLessThan(5); // small squares
    expect(xc.pat[3]).toBeGreaterThan(0.5);
    expect(xc.pat[3]).toBeLessThan(2); // only slightly raised
    const [rf, rh] = xc.faceR;
    const s = xc.pat[0];
    expect(grooveDepth(xc.pat, s * 2, s * 0.5, rf, rh)).toBeCloseTo(xc.pat[3], 1); // on a slit
    expect(grooveDepth(xc.pat, s * 1.5, s * 0.5, rf, rh)).toBeCloseTo(0); // middle of a block
    expect(grooveDepth(xc.pat, rf, 0, rf, rh)).toBeCloseTo(0); // fades out at the rim
    // flower power (off the real pad): ~10 petals round the hole, rings of petal grooves outward
    expect(flower.pat[4]).toBe(1);
    expect(flower.pat[3]).toBeGreaterThan(1);
    expect(maxY(flower.face.pos)).toBeCloseTo(0);
    expect(flowerPetals(0)).toBe(10);
    for (let k = 1; k < 4; k++) expect(flowerPetals(k)).toBeGreaterThan(flowerPetals(k - 1));
    const S = flower.faceR[0]; // the rings scale with the face
    // the central flower's first petal is a circle centred on the x axis at 0.36 S
    const R = 0.36 * S;
    const rho = R * Math.sin(Math.PI / flowerPetals(0));
    const at = (x: number, z = 0) => grooveDepth(flower.pat, x, z, flower.faceR[0], flower.faceR[1]);
    expect(at(R + rho)).toBeGreaterThan(0.9 * flower.pat[3]); // in the groove at the petal tip
    expect(at(R)).toBeCloseTo(0); // middle of the petal
    expect(at(R - rho * 0.5)).toBeCloseTo(0); // inner half of the petal: no groove there
    // flat: no grooves, nothing standing proud
    expect(flat.pat[3]).toBe(0);
    expect(maxY(flat.face.pos)).toBeCloseTo(0);
    expect(flat.face.pos.filter((_, i) => i % 3 === 1).every((y) => Math.abs(y) < 1e-6)).toBe(true);
  });
});
