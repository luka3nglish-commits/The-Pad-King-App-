import type { Brand, Polish, Stage } from "@/lib/match";

/**
 * Product art for a polish: the real bottle photos where we have them (see
 * `photos` in lib/match.ts), otherwise a bottle per product drawn in Pad King's
 * own look, silhouette per brand. Combos show two bottles, the second tucked
 * in behind the first.
 */

const STAGE_COLOR: Record<Stage, string> = { cut: "#e2621b", "one-step": "#c99a4a", finish: "#9aa3ad" };

// One silhouette per brand (viewBox 64 × 120): body path, neck, cap.
const SHAPES: Record<Brand, { body: string; neck: [number, number, number, number]; cap: { x: number; y: number; w: number; h: number; r: number }; label: [number, number] }> = {
  "3D": {
    body: "M10 44Q10 30 23 30H41Q54 30 54 44V109Q54 116 47 116H17Q10 116 10 109Z",
    neck: [24, 22, 16, 9],
    cap: { x: 20, y: 6, w: 24, h: 17, r: 6 },
    label: [12, 40],
  },
  Sonax: {
    body: "M8 41Q8 34 15 34H49Q56 34 56 41V109Q56 116 49 116H15Q8 116 8 109Z",
    neck: [25, 29, 14, 6],
    cap: { x: 22, y: 4, w: 20, h: 26, r: 3 },
    label: [10, 44],
  },
  "Koch Chemie": {
    body: "M10 47L22 31H42L54 47V109Q54 116 47 116H17Q10 116 10 109Z",
    neck: [24, 26, 16, 6],
    cap: { x: 23, y: 11, w: 18, h: 16, r: 2 },
    label: [12, 40],
  },
  "P&S": {
    body: "M9 54Q9 30 32 30Q55 30 55 54V109Q55 116 48 116H16Q9 116 9 109Z",
    neck: [26, 24, 12, 7],
    cap: { x: 23, y: 10, w: 18, h: 15, r: 3 },
    label: [11, 42],
  },
};

const BRAND_MARK: Record<Brand, string> = { "3D": "3D", Sonax: "SONAX", "Koch Chemie": "KOCH", "P&S": "P&S" };

function Bottle({ brand, lines, stage, uid }: { brand: Brand; lines: string[]; stage: Stage; uid: string }) {
  const s = SHAPES[brand];
  const [lx, lw] = s.label;
  const top = 58;
  const big = lines.length === 1 && lines[0].length <= 4;
  return (
    <g>
      <defs>
        <linearGradient id={`glass-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#0c0c0f" />
          <stop offset="0.35" stopColor="#25252c" />
          <stop offset="0.7" stopColor="#141418" />
          <stop offset="1" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id={`cap-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#84601f" />
          <stop offset="0.45" stopColor="#ecd3a0" />
          <stop offset="1" stopColor="#84601f" />
        </linearGradient>
      </defs>
      {/* cap + neck */}
      <rect x={s.cap.x} y={s.cap.y} width={s.cap.w} height={s.cap.h} rx={s.cap.r} fill={`url(#cap-${uid})`} />
      {[0.3, 0.5, 0.7].map((f) => (
        <line key={f} x1={s.cap.x + s.cap.w * f} x2={s.cap.x + s.cap.w * f} y1={s.cap.y + 3} y2={s.cap.y + s.cap.h - 3} stroke="#5a4214" strokeOpacity="0.35" strokeWidth="0.8" />
      ))}
      <rect x={s.neck[0]} y={s.neck[1]} width={s.neck[2]} height={s.neck[3]} fill="#18181c" />
      {/* body */}
      <path d={s.body} fill={`url(#glass-${uid})`} stroke="rgba(245,242,234,0.14)" strokeWidth="0.8" />
      {/* label */}
      <rect x={lx} y={top - 8} width={lw} height={52} rx="3" fill="#101013" stroke="#c99a4a" strokeOpacity="0.45" strokeWidth="0.6" />
      <text x={32} y={top} textAnchor="middle" fontSize="6" letterSpacing="1" fill="#c9c4b8" style={{ fontFamily: "var(--font-mono)" }}>
        {BRAND_MARK[brand]}
      </text>
      {lines.map((ln, i) => (
        <text
          key={ln + i}
          x={32}
          y={big ? top + 21 : top + 13 + i * 10}
          textAnchor="middle"
          fontSize={big ? 15 : 8.5}
          fontWeight="800"
          fill="#f5f2ea"
          style={{ fontFamily: "var(--font-display)" }}
          {...(ln.length > 5 ? { textLength: lw - 8, lengthAdjust: "spacingAndGlyphs" } : {})}
        >
          {ln}
        </text>
      ))}
      <rect x={lx} y={top + 38} width={lw} height={6} rx="1.5" fill={STAGE_COLOR[stage]} />
      {/* gloss */}
      <rect x={s.label[0] - 0.5} y={36} width={2.4} height={74} rx="1.2" fill="#ffffff" opacity="0.1" />
    </g>
  );
}

export function ProductArt({ polish, className }: { polish: Polish; className?: string }) {
  const photos = polish.photos;
  if (photos?.length) {
    return (
      <span className={`inline-flex items-end ${className ?? ""}`} role="img" aria-label={`${polish.brand} ${polish.name}`}>
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- local cut-outs with alpha; sizes vary per bottle
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            className={i === 0 ? "relative z-[1] h-full w-auto max-w-none" : "-ml-[18%] h-[94%] w-auto max-w-none opacity-90"}
          />
        ))}
      </span>
    );
  }
  const two = polish.art.length > 1;
  const stageFor = (i: number) => polish.stages[Math.min(i, polish.stages.length - 1)];
  return (
    <svg viewBox={two ? "0 0 92 120" : "0 0 64 120"} className={className} role="img" aria-label={`${polish.brand} ${polish.name}`}>
      {two ? (
        <>
          <g transform="translate(26 4) scale(0.94)" opacity="0.92">
            <Bottle brand={polish.brand} lines={polish.art[1]} stage={stageFor(1)} uid={`${polish.id}-b`} />
          </g>
          <Bottle brand={polish.brand} lines={polish.art[0]} stage={stageFor(0)} uid={`${polish.id}-a`} />
        </>
      ) : (
        <Bottle brand={polish.brand} lines={polish.art[0]} stage={stageFor(0)} uid={polish.id} />
      )}
    </svg>
  );
}
