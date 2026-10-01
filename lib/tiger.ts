/**
 * Deterministic tiger-stripe generator. Same seed → same SVG on server and client,
 * so there's no hydration mismatch and no image asset to ship.
 */

export const TIGER_W = 1600;
export const TIGER_H = 1000;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f1 = (n: number) => Math.round(n * 10) / 10;

interface StrokeOpts {
  x0: number;
  y0: number;
  len: number;
  angle: number; // radians from vertical, + leans right as it goes down
  width: number;
  wave: number;
  freq: number;
  phase: number;
  rough: number;
}

function stroke(o: StrokeOpts, steps = 36): string {
  const left: string[] = [];
  const right: string[] = [];
  const dirX = Math.sin(o.angle);
  const dirY = Math.cos(o.angle);
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s = t * o.len;
    const w = Math.sin(Math.PI * t * 2 + o.phase) * o.wave * Math.sin(Math.PI * t);
    pts.push([o.x0 + dirX * s + dirY * w, o.y0 + dirY * s - dirX * w]);
  }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = pts[i];
    const [nx0, ny0] = pts[Math.min(steps, i + 1)];
    const [bx, by] = pts[Math.max(0, i - 1)];
    const tx = nx0 - bx;
    const ty = ny0 - by;
    const l = Math.hypot(tx, ty) || 1;
    // normal
    const nx = -ty / l;
    const ny = tx / l;
    const taper = Math.pow(Math.sin(Math.PI * t), 0.65);
    const wob = 1 + o.rough * Math.sin(t * o.freq * Math.PI * 2 + o.phase * 1.7);
    const hw = (o.width / 2) * taper * wob;
    // asymmetric edges read more organic than a symmetric brush
    left.push(`${f1(x + nx * hw * 1.15)} ${f1(y + ny * hw * 1.15)}`);
    right.push(`${f1(x - nx * hw * 0.85)} ${f1(y - ny * hw * 0.85)}`);
  }
  return `M${left.join("L")}L${right.reverse().join("L")}Z`;
}

export function tigerStripePaths(seed = 1977): string[] {
  const rnd = mulberry32(seed);
  const r = (a: number, b: number) => a + (b - a) * rnd();
  const paths: string[] = [];
  const count = 26;
  for (let i = 0; i < count; i++) {
    const baseX = -260 + (i / (count - 1)) * (TIGER_W + 420) + r(-30, 30);
    const angle = r(0.32, 0.5); // lean ~18–29° off vertical
    const width = r(18, 64);
    const segs = rnd() < 0.35 ? 2 : 1;
    let y = r(-160, -40);
    for (let s = 0; s < segs; s++) {
      const len = segs === 1 ? r(TIGER_H * 0.7, TIGER_H * 1.25) : r(TIGER_H * 0.35, TIGER_H * 0.6);
      const x0 = baseX + Math.sin(angle) * Math.max(0, y) + (s ? r(-20, 20) : 0);
      const opts: StrokeOpts = {
        x0,
        y0: y,
        len,
        angle,
        width: width * (s ? r(0.6, 0.95) : 1),
        wave: r(10, 46),
        freq: r(1.2, 3.2),
        phase: r(0, Math.PI * 2),
        rough: r(0.08, 0.28),
      };
      paths.push(stroke(opts));
      // occasional fork, peeling off the main stroke
      if (rnd() < 0.4) {
        const at = r(0.25, 0.6);
        paths.push(
          stroke({
            ...opts,
            x0: opts.x0 + Math.sin(angle) * len * at,
            y0: opts.y0 + Math.cos(angle) * len * at,
            len: len * r(0.22, 0.38),
            angle: angle + r(0.35, 0.7) * (rnd() < 0.5 ? -1 : 1),
            width: opts.width * r(0.4, 0.65),
            wave: opts.wave * 0.4,
          }),
        );
      }
      y += len + r(40, 120);
    }
  }
  return paths;
}
