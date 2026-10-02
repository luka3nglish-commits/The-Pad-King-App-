"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useScrollFx } from "./useScrollFx";

// x position, start y, depth travelled (viewBox units)
const DROPS: [number, number, number][] = [
  [92, 22, 196], [140, 34, 184], [186, 18, 200], [232, 30, 188], [280, 16, 202], [326, 28, 190],
  [372, 20, 198], [418, 32, 186], [462, 24, 194], [116, 8, 120], [304, 6, 140], [440, 10, 110],
];

/**
 * The problem, as a cross-section of a typical pad: solvent sinks through the
 * open-cell foam, the hot-melt glue line overheats, and the velcro peels away.
 * Scroll-scrubbed; reduced motion shows the end state.
 */
export function FailureDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFx(ref, (reduced) => {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: reduced ? undefined : { trigger: ref.current, start: "top 80%", end: "bottom 35%", scrub: 0.6 },
    });
    tl.fromTo("[data-drop]", { y: 0, autoAlpha: 0 }, { y: (_i: number, el: Element) => Number((el as HTMLElement).dataset.depth), autoAlpha: 1, duration: 0.45, stagger: 0.025, ease: "power1.in" }, 0)
      .fromTo("[data-label=solvent]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.05)
      .to("[data-glue]", { attr: { fill: "#e2621b" }, duration: 0.25 }, 0.45)
      .fromTo("[data-glow]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.45)
      .fromTo("[data-heat]", { autoAlpha: 0, y: 6 }, { autoAlpha: 0.9, y: 0, duration: 0.2, stagger: 0.04 }, 0.5)
      .fromTo("[data-label=glue]", { autoAlpha: 0.35 }, { autoAlpha: 1, duration: 0.1 }, 0.55)
      .fromTo("[data-peel]", { rotation: 0 }, { rotation: 13, svgOrigin: "318 244", duration: 0.3, ease: "power2.in" }, 0.7)
      .fromTo("[data-label=peel]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.85);
    if (reduced) tl.progress(1);
  });

  return (
    <div ref={ref} className="pk-glass relative overflow-hidden rounded-[28px] p-4 sm:p-6">
      <div className="relative" role="img" aria-label="Cross-section of a typical pad: polish solvent sinks through the open-cell foam to the glue line, the 70 °C hot-melt glue overheats, and the velcro peels away.">
        <svg viewBox="0 0 560 360" className="block h-auto w-full" aria-hidden>
          <defs>
            <linearGradient id="fd-foam" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#61656e" />
              <stop offset="1" stopColor="#3f434a" />
            </linearGradient>
            <pattern id="fd-cells" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="6" r="3.2" fill="#24272c" opacity="0.55" />
              <circle cx="15" cy="15" r="4.2" fill="#24272c" opacity="0.45" />
              <circle cx="17" cy="4" r="1.8" fill="#24272c" opacity="0.5" />
              <circle cx="6" cy="17" r="2" fill="#24272c" opacity="0.4" />
            </pattern>
            <pattern id="fd-loop" width="6" height="26" patternUnits="userSpaceOnUse">
              <path d="M3 2v22" stroke="#7a808c" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            </pattern>
            <filter id="fd-blur" x="-10%" y="-200%" width="120%" height="500%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* foam */}
          <path d="M40 236V84q0-24 24-24h432q24 0 24 24v152Z" fill="url(#fd-foam)" />
          <path d="M40 236V84q0-24 24-24h432q24 0 24 24v152Z" fill="url(#fd-cells)" />
          <path d="M64 60h432" stroke="rgba(245,242,234,0.18)" strokeWidth="2" strokeLinecap="round" />

          {/* solvent */}
          {DROPS.map(([x, y, d], i) => (
            <circle key={i} data-drop data-depth={d} cx={x} cy={y} r={i > 8 ? 3.5 : 5} fill="#8fc3e8" />
          ))}

          {/* heat shimmer above the glue */}
          {[150, 280, 410].map((x) => (
            <path key={x} data-heat d={`M${x} 228q8-10 0-20t0-20`} stroke="#e2621b" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0" />
          ))}

          {/* glue line + glow */}
          <rect data-glow x="40" y="232" width="480" height="16" fill="#e2621b" filter="url(#fd-blur)" opacity="0" />
          <rect data-glue x="40" y="236" width="480" height="8" fill="#c99a4a" />

          {/* velcro: the right end peels away */}
          <rect x="40" y="244" width="278" height="26" rx="2" fill="#4d525c" />
          <rect x="40" y="244" width="278" height="26" fill="url(#fd-loop)" />
          <g data-peel>
            <rect x="318" y="244" width="202" height="26" rx="2" fill="#4d525c" />
            <rect x="318" y="244" width="202" height="26" fill="url(#fd-loop)" />
            <rect x="318" y="244" width="202" height="3" fill="#c99a4a" opacity="0.7" />
          </g>
        </svg>

        <span data-label="solvent" className="pk-mono absolute left-[2%] top-[0%] text-[10.5px] uppercase tracking-[0.14em] text-[#8fc3e8] sm:text-[11px]">
          Polish solvent
        </span>
        <span className="pk-mono absolute left-1/2 top-[38%] -translate-x-1/2 text-[10.5px] uppercase tracking-[0.14em] text-text-2/80 sm:text-[11px]">
          Open-cell foam
        </span>
        <span data-label="glue" className="pk-mono absolute left-[2%] top-[91%] text-[10.5px] uppercase tracking-[0.14em] text-orange sm:text-[11px]">
          Glue · 70 °C hot melt
        </span>
        <span data-label="peel" className="pk-mono absolute right-[2%] top-[91%] text-[10.5px] uppercase tracking-[0.14em] text-gold-hi sm:text-[11px]">
          Velcro lets go
        </span>
      </div>
    </div>
  );
}
