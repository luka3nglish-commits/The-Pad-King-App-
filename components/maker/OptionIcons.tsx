import { INTERFACE_T, VELCRO_T, rawEdgeProfile } from "@/lib/pad/geometry";
import type { EdgeId, FaceId } from "@/lib/pad/options";

/**
 * Edge icon = the real side silhouette from the same profile function the 3D
 * model uses, so the icon can never disagree with the render.
 */
export function EdgeIcon({ edge }: { edge: EdgeId }) {
  const Rv = 37.5;
  const T = 20;
  const Hf = T - VELCRO_T - INTERFACE_T;
  const prof = rawEdgeProfile(edge, Rv, Hf);
  const W = 100;
  const H = 34;
  const cx = W / 2;
  const base = H - 4; // svg y of the pad face
  const sc = 1.05;
  const pt = ([r, y]: [number, number], side: 1 | -1) => `${(cx + side * r * sc).toFixed(2)} ${(base - y * sc).toFixed(2)}`;
  const right = prof.map((p) => pt(p, 1));
  const left = [...prof].reverse().map((p) => pt(p, -1));
  const foam = `M${left.join("L")}L${right.join("L")}Z`;
  const top = base - Hf * sc;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-full" aria-hidden>
      <rect x={cx - Rv * sc} y={top - (VELCRO_T + INTERFACE_T) * sc} width={Rv * 2 * sc} height={(VELCRO_T + INTERFACE_T) * sc} fill="currentColor" opacity="0.5" rx="0.6" />
      <path d={foam} fill="var(--pk-spitfire)" fillOpacity="0.85" />
    </svg>
  );
}

export function FaceIcon({ face }: { face: FaceId }) {
  const S = 44;
  const c = S / 2;
  const R = 19;
  const id = `clip-${face}`;
  const grid = (step: number, w: number) => {
    const lines = [];
    for (let v = c - R; v <= c + R; v += step) {
      lines.push(<rect key={`v${v}`} x={v - w / 2} y={c - R} width={w} height={R * 2} />);
      lines.push(<rect key={`h${v}`} y={v - w / 2} x={c - R} height={w} width={R * 2} />);
    }
    return lines;
  };
  let detail: React.ReactNode = null;
  if (face === "raised") detail = <circle cx={c} cy={c} r={R * 0.6} fill="#66c04e" />;
  if (face === "crosscut")
    detail = (
      <>
        {/* small raised squares: lighter tops, fine dark gaps */}
        <rect x={c - R} y={c - R} width={R * 2} height={R * 2} fill="#5cb444" />
        <g fill="rgba(8,8,10,0.6)">{grid(2.9, 0.6)}</g>
      </>
    );
  if (face === "waffle") detail = <g fill="rgba(8,8,10,0.55)">{grid(6.4, 2)}</g>;
  if (face === "flower") {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const th = (i / 120) * Math.PI * 2;
      const rb = R * 0.68 * (0.72 + 0.28 * Math.pow(Math.abs(Math.cos(3 * th)), 0.7));
      pts.push(`${(c + rb * Math.cos(th)).toFixed(2)} ${(c + rb * Math.sin(th)).toFixed(2)}`);
    }
    detail = <path d={`M${pts.join("L")}Z`} fill="#66c04e" />;
  }
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="size-11" aria-hidden>
      <defs>
        <clipPath id={id}>
          <circle cx={c} cy={c} r={R} />
        </clipPath>
      </defs>
      <circle cx={c} cy={c} r={R} fill="var(--pk-spitfire)" />
      <g clipPath={`url(#${id})`}>{detail}</g>
      <circle cx={c} cy={c} r={2.4} fill="var(--pk-bg)" />
    </svg>
  );
}
