"use client";

import { useRef } from "react";
import gsap from "gsap";
import { inView, useScrollFx } from "./useScrollFx";

const C = 200;
const R = 150;
const N = 10;
const NODES = Array.from({ length: N }, (_, i) => {
  const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
  return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
});

/**
 * 2024 chapter: foam partners light up around the crown. Nine solid, the tenth
 * left open — "nearly ten" — and one marked as the world's largest.
 */
export function FoamNetwork() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFx(ref, (reduced) => {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: reduced ? undefined : inView(ref.current),
    });
    tl.fromTo("[data-link]", { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.3, stagger: 0.06 }, 0)
      .fromTo("[data-node]", { scale: 0.4, autoAlpha: 0, transformOrigin: "50% 50%" }, { scale: 1, autoAlpha: 1, duration: 0.2, stagger: 0.06, ease: "back.out(2)" }, 0.12)
      .fromTo("[data-largest]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.5);
    if (reduced) tl.progress(1);
  });

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[480px]">
      <svg viewBox="0 0 400 400" className="size-full" role="img" aria-label="Nearly ten foam companies around The Pad King, including the world's largest foam manufacturer.">
        <defs>
          <radialGradient id="fn-glow">
            <stop offset="0" stopColor="rgba(201,154,74,0.22)" />
            <stop offset="1" stopColor="rgba(201,154,74,0)" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r="190" fill="url(#fn-glow)" />
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(245,242,234,0.07)" strokeDasharray="2 6" />
        {NODES.map((n, i) => (
          <line key={`l${i}`} data-link x1={C} y1={C} x2={n.x} y2={n.y} stroke={i === N - 1 ? "rgba(201,154,74,0.25)" : "rgba(201,154,74,0.55)"} strokeWidth="1.2" pathLength={1} strokeDasharray="1 1" strokeDashoffset="0" />
        ))}
        {NODES.map((n, i) =>
          i === N - 1 ? (
            <circle key={i} data-node cx={n.x} cy={n.y} r="10" fill="#08080a" stroke="#c99a4a" strokeDasharray="3 3" opacity="0.7" />
          ) : (
            <g key={i} data-node>
              <circle cx={n.x} cy={n.y} r={i === 0 ? 17 : 10} fill={i === 0 ? "#e2621b" : "#c99a4a"} />
              <circle cx={n.x} cy={n.y} r={i === 0 ? 26 : 16} fill="none" stroke={i === 0 ? "rgba(226,98,27,0.35)" : "rgba(201,154,74,0.25)"} />
            </g>
          ),
        )}
        <text data-largest x={C} y={NODES[0].y - 34} textAnchor="middle" fill="#ecd3a0" fontFamily="var(--font-mono)" fontSize="12" letterSpacing="1.5">
          WORLD&apos;S LARGEST
        </text>
        {/* the crown */}
        <circle cx={C} cy={C} r="40" fill="#0f0f12" stroke="#c99a4a" strokeWidth="1.5" />
        <g transform={`translate(${C - 26} ${C - 22}) scale(2)`}>
          <path d="M3 15 1.5 3.5l6 5L13 1l5.5 7.5 6-5L23 15Z" fill="#c99a4a" />
          <rect x="3" y="17" width="20" height="3.5" rx="1" fill="#3fa02c" />
        </g>
      </svg>
    </div>
  );
}
