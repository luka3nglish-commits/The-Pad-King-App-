"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useScrollFx } from "./useScrollFx";

const C = 210;
// 150 / 140 / 90 mm pads, drawn to scale
const RINGS = [
  { mm: 150, r: 180 },
  { mm: 140, r: 168 },
  { mm: 90, r: 108 },
];
const TICKS = Array.from({ length: 36 }, (_, i) => i * 10);

/** 2014 chapter: the three pad sizes traced like a CNC toolpath as you scroll. */
export function CncRings() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFx(ref, (reduced) => {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: reduced ? undefined : { trigger: ref.current, start: "top 80%", end: "bottom 40%", scrub: 0.6 },
    });
    RINGS.forEach((_, i) => {
      const at = i * 0.22;
      tl.fromTo(`[data-ring="${i}"]`, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.5 }, at)
        .fromTo(`[data-tool="${i}"]`, { rotation: 0 }, { rotation: 360, svgOrigin: `${C} ${C}`, duration: 0.5 }, at)
        .fromTo(`[data-tool="${i}"]`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, at)
        .to(`[data-tool="${i}"]`, { autoAlpha: 0, duration: 0.06 }, at + 0.5)
        .fromTo(`[data-size="${i}"]`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, at + 0.42);
    });
    if (reduced) tl.progress(1);
  });

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[520px]">
      <svg viewBox="0 0 420 420" className="size-full" role="img" aria-label="The three pad sizes, 150, 140 and 90 millimetres, drawn to scale.">
        <defs>
          <radialGradient id="cnc-glow">
            <stop offset="0" stopColor="rgba(201,154,74,0.14)" />
            <stop offset="1" stopColor="rgba(201,154,74,0)" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r="200" fill="url(#cnc-glow)" />
        {/* crosshair + ticks */}
        <path d={`M${C} 6V414M6 ${C}H414`} stroke="rgba(245,242,234,0.07)" strokeDasharray="2 6" />
        {TICKS.map((a) => (
          <line key={a} x1={C} y1={C - 196} x2={C} y2={C - (a % 30 === 0 ? 186 : 191)} stroke="rgba(245,242,234,0.18)" transform={`rotate(${a} ${C} ${C})`} />
        ))}
        {/* rings */}
        {RINGS.map((ring, i) => (
          <g key={ring.mm}>
            <circle cx={C} cy={C} r={ring.r} fill="none" stroke="rgba(245,242,234,0.06)" strokeWidth="1" />
            <circle
              data-ring={i}
              cx={C}
              cy={C}
              r={ring.r}
              fill="none"
              stroke={i === 0 ? "#ecd3a0" : i === 1 ? "#c99a4a" : "#e2621b"}
              strokeWidth={i === 0 ? 2 : 1.6}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset="0"
              transform={`rotate(-90 ${C} ${C})`}
            />
            <g data-tool={i} opacity="0">
              <circle cx={C} cy={C - ring.r} r="9" fill="rgba(236,211,160,0.25)" />
              <circle cx={C} cy={C - ring.r} r="4" fill="#ecd3a0" />
            </g>
            <text
              data-size={i}
              x={C + ring.r * Math.cos(-Math.PI / 4 + i * 0.32) + 8}
              y={C + ring.r * Math.sin(-Math.PI / 4 + i * 0.32) - 6}
              fill="#a8a49a"
              fontFamily="var(--font-mono)"
              fontSize="13"
              letterSpacing="1"
            >
              {ring.mm} MM
            </text>
          </g>
        ))}
        {/* hub */}
        <circle cx={C} cy={C} r="14" fill="none" stroke="rgba(245,242,234,0.25)" />
        <circle cx={C} cy={C} r="2.5" fill="#c99a4a" />
      </svg>
    </div>
  );
}
