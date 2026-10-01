import type { MutableRefObject } from "react";

const LABELS = ["Velcro loop", "Interface", "Spitfire foam"];

/**
 * Numbered tags pinned to the exploded layers. PadModel projects each layer's
 * anchor to screen space every frame and writes transform + opacity here directly.
 */
export function LayerMarkers({ els, labels = false }: { els: MutableRefObject<(HTMLElement | null)[]>; labels?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {LABELS.map((label, i) => (
        <div
          key={label}
          ref={(el) => {
            els.current[i] = el;
          }}
          className="absolute left-0 top-0 opacity-0 will-change-transform"
        >
          <div className="flex -translate-x-full -translate-y-1/2 items-center gap-2 pr-1">
            {labels && <span className="pk-mono hidden whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-text-2 sm:inline">{label}</span>}
            <span className="pk-mono grid size-6 place-items-center rounded-full border border-gold/70 bg-bg/80 text-[10px] text-gold-hi backdrop-blur">
              0{i + 1}
            </span>
            <span className="h-px w-6 bg-gradient-to-r from-gold/80 to-transparent" />
          </div>
        </div>
      ))}
    </div>
  );
}
