"use client";

import { useEffect, useRef } from "react";

/**
 * The app's backdrop: a dark product studio. A soft gold light glides across as
 * you scroll (and drifts slowly on its own), a faint foam-cell grain keeps the
 * black from going flat, and on desktop a dim light follows the pointer. The
 * products supply the colour. Everything moves by transform only.
 */
export function StudioBackdrop() {
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
      drift += dt * 0.07;
      scrollEased += (window.scrollY - scrollEased) * Math.min(1, dt * 4);

      // the key light glides side to side: slow drift plus scroll
      const vw = window.innerWidth;
      const phase = drift + scrollEased * 0.0011;
      const x = vw * (0.5 + 0.34 * Math.sin(phase));
      root.style.setProperty("--pk-light-x", `${x.toFixed(1)}px`);
      // gold type catches the same light
      html.style.setProperty("--pk-sheen-pos", `${(100 - (x / vw) * 100).toFixed(1)}%`);

      if (finePointer) {
        spot.x += (spot.tx - spot.x) * Math.min(1, dt * 8);
        spot.y += (spot.ty - spot.y) * Math.min(1, dt * 8);
        root.style.setProperty("--pk-spot-x", `${spot.x.toFixed(1)}px`);
        root.style.setProperty("--pk-spot-y", `${spot.y.toFixed(1)}px`);
        root.style.setProperty("--pk-spot-o", now - spot.seen < 2600 ? "1" : "0");
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
    <div ref={rootRef} className="pk-studio" aria-hidden="true">
      <div className="pk-studio__light" />
      <div className="pk-studio__floor" />
      <div className="pk-studio__spot" />
      <div className="pk-studio__grain" />
      <div className="pk-studio__vignette" />
    </div>
  );
}
