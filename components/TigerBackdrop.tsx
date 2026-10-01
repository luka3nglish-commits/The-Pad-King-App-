"use client";

import { useEffect, useRef } from "react";
import { TIGER_H, TIGER_W, tigerStripePaths } from "@/lib/tiger";

const PATHS = tigerStripePaths();

/**
 * Signature move: black-on-black tiger stripes that only light up where a gold →
 * orange sheen passes beneath them (scroll + slow drift), plus a torch that
 * follows the pointer on desktop. Everything moves by transform only.
 *
 * Layers (back → front): light (band + spot) → SVG that is solid bg everywhere
 * except the stripes, which are semi-transparent windows onto the light.
 */
export function TigerBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let last = performance.now();
    let drift = 0;
    let scrollEased = window.scrollY;
    const spot = { x: -999, y: -999, tx: -999, ty: -999, seen: 0 };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      spot.tx = e.clientX;
      spot.ty = e.clientY;
      if (spot.x < -900) {
        spot.x = spot.tx;
        spot.y = spot.ty;
      }
      spot.seen = performance.now();
    };
    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      drift += dt * 70; // px/s idle drift
      scrollEased += (window.scrollY - scrollEased) * Math.min(1, dt * 6);

      const vw = window.innerWidth;
      const band = Math.max(vw, window.innerHeight) * 0.46;
      const span = vw + band * 2.2;
      const travel = (drift + scrollEased * 0.9) % span;
      const x = travel - band * 1.1;
      root.style.setProperty("--pk-band-x", `${x.toFixed(1)}px`);
      // one light source: gold type picks up the same sweep
      const pct = 100 - Math.max(0, Math.min(100, ((x + band / 2) / vw) * 100));
      html.style.setProperty("--pk-sheen-pos", `${pct.toFixed(1)}%`);

      if (finePointer) {
        spot.x += (spot.tx - spot.x) * Math.min(1, dt * 9);
        spot.y += (spot.ty - spot.y) * Math.min(1, dt * 9);
        const active = now - spot.seen < 2600 ? 1 : 0;
        root.style.setProperty("--pk-spot-x", `${spot.x.toFixed(1)}px`);
        root.style.setProperty("--pk-spot-y", `${spot.y.toFixed(1)}px`);
        root.style.setProperty("--pk-spot-o", String(active));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div ref={rootRef} className="pk-tiger" aria-hidden="true">
      <div className="pk-tiger__light">
        <div className="pk-tiger__band" />
        <div className="pk-tiger__spot" />
      </div>
      <svg
        className="pk-tiger__svg"
        viewBox={`0 0 ${TIGER_W} ${TIGER_H}`}
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <g id="pk-stripe-paths">
            {PATHS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <mask id="pk-stripe-cut" maskUnits="userSpaceOnUse" x="0" y="0" width={TIGER_W} height={TIGER_H}>
            <rect x="0" y="0" width={TIGER_W} height={TIGER_H} fill="white" />
            <use href="#pk-stripe-paths" fill="black" />
          </mask>
        </defs>
        <rect x="0" y="0" width={TIGER_W} height={TIGER_H} fill="var(--pk-bg)" mask="url(#pk-stripe-cut)" />
        <use href="#pk-stripe-paths" fill="rgba(22, 22, 27, 0.6)" />
      </svg>
      <div className="pk-tiger__vignette" />
    </div>
  );
}
