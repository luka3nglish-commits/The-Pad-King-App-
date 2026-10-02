"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Runs a GSAP setup once per mount, scoped to `scope`, and reverts it on unmount.
 * `reduced` is true when the visitor prefers reduced motion: show end states, no scrub.
 */
export function useScrollFx(scope: RefObject<HTMLElement | null>, setup: (reduced: boolean) => void) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // automated browsers render slowly in software; don't let lag-smoothing stall the scrub
    if (navigator.webdriver) gsap.ticker.lagSmoothing(0);
    const el = scope.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => setup(reduced), el);
    return () => ctx.revert();
    // setup is a one-shot description of the animation; it runs once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
}

/** Smooth-scrolls to a chapter anchor (instant with reduced motion). */
export function jumpTo(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.getAttribute("href")?.slice(1);
  const el = id ? document.getElementById(id) : null;
  if (!el) return;
  e.preventDefault();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}
