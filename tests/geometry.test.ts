import { describe, expect, it } from "vitest";
import {
  rawEdgeProfile,
  FACE_RINGS,
  PROFILE_N,
  SEG,
  annulusIndices,
  dimsOf,
  edgeProfile,
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
  it("covers all 360 owner-confirmed combinations", () => {
    expect(COMBINATIONS).toBe(360);
    expect([...allBuilds()]).toHaveLength(360);
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

  it("builds finite, fixed-length arrays for all 360 builds (so any two can morph)", () => {
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
    const s = padState({ size: 75, thickness: 20, edge: "rounded", face: "raised" });
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

  it("traces grooves in the shader and raises bosses in geometry", () => {
    const xc = padState({ size: 75, thickness: 20, edge: "rounded", face: "crosscut" });
    const raised = padState({ size: 75, thickness: 20, edge: "rounded", face: "raised" });
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
    expect(raised.pat[3]).toBe(0);
    expect(raised.minY).toBeLessThan(-1);
  });
});
