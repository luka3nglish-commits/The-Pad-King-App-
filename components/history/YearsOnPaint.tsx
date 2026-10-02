"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useScrollFx } from "./useScrollFx";

/** 1993 chapter: the years count up as you scroll, along a 1993 → today line. */
export function YearsOnPaint() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFx(ref, (reduced) => {
    if (reduced) return;
    const num = ref.current!.querySelector<HTMLElement>("[data-years]")!;
    const o = { v: 0 };
    const st = { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: 0.5 };
    gsap.to(o, { v: 30, ease: "power1.out", scrollTrigger: st, onUpdate: () => (num.textContent = String(Math.round(o.v))) });
    gsap.fromTo("[data-line]", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: st });
  });

  return (
    <div ref={ref} className="relative">
      <p className="pk-mono text-[11px] uppercase tracking-[0.22em] text-muted">Years on paint</p>
      <p className="pk-display mt-2 whitespace-nowrap text-[clamp(96px,13vw,200px)] leading-[0.82]" aria-label="More than 30 years">
        <span data-years className="pk-gold-text tabular-nums" aria-hidden>
          30
        </span>
        <span className="text-orange" aria-hidden>
          +
        </span>
      </p>
      <div className="relative mt-8 h-px bg-line-2">
        <span data-line className="absolute inset-0 origin-left bg-gradient-to-r from-gold to-orange" aria-hidden />
        <span className="absolute -top-[5px] left-0 size-[11px] rounded-full border border-gold bg-bg" aria-hidden />
        <span className="absolute -top-[5px] right-0 size-[11px] rounded-full bg-orange shadow-[0_0_12px_rgba(226,98,27,0.7)]" aria-hidden />
      </div>
      <div className="pk-mono mt-3 flex justify-between text-[11px] uppercase tracking-[0.16em] text-text-2">
        <span>1993</span>
        <span>Still testing</span>
      </div>
    </div>
  );
}
