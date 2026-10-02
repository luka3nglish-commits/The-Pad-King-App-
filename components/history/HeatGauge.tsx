export interface GaugeMark {
  at: number;
  label?: string;
  tone: "bad" | "good";
  /** Label above (default) or below the bar, so close marks don't collide. */
  side?: "above" | "below";
}

/**
 * Adhesive temperature rating, 0–200 °C. The fill follows the CSS variable --v
 * (0–1) on the root, which the parent animates; marks light up via [data-mark].
 */
export function HeatGauge({ marks, label, max = 200 }: { marks: GaugeMark[]; label: string; max?: number }) {
  const below = marks.some((m) => m.side === "below");
  return (
    <div data-gauge className={`relative pt-11 [--v:1] ${below ? "pb-9" : ""}`} role="img" aria-label={label}>
      {marks.map((m) => {
        const pct = (m.at / max) * 100;
        const right = pct > 80;
        const down = m.side === "below";
        return (
          <div
            key={m.at}
            data-mark
            className={`absolute flex ${down ? "top-[58px] h-[48px] flex-col-reverse" : "top-0 h-[50px] flex-col"}`}
            style={{ left: `${pct}%`, alignItems: right ? "flex-end" : "flex-start", transform: right ? "translateX(-100%)" : undefined }}
          >
            <span className={`pk-mono whitespace-nowrap text-[11px] uppercase tracking-[0.14em] ${m.tone === "bad" ? "text-orange" : "text-gold-hi"}`}>
              <span className="text-text">{m.at} °C</span>
              {m.label ? ` · ${m.label}` : ""}
            </span>
            <span className={`w-px flex-1 ${down ? "mb-1" : "mt-1"} ${m.tone === "bad" ? "bg-orange/70" : "bg-gold-hi"}`} />
          </div>
        );
      })}
      <div className="relative h-3 overflow-hidden rounded-full bg-surface-2 ring-1 ring-line-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-deep via-gold to-orange shadow-[0_0_18px_rgba(226,98,27,0.5)]" style={{ width: "calc(var(--v) * 100%)" }} />
      </div>
      <div className="pk-mono mt-2 flex justify-between text-[10px] text-muted">
        <span>0 °C</span>
        <span>100</span>
        <span>{max} °C</span>
      </div>
    </div>
  );
}
