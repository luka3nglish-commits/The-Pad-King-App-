"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** How far scrubbed animations trail the scroll (s). Small = tight, still smooth. */
export const SCRUB = 0.25;

/**
 * Standard scrub range for a chapter visual: starts as it comes up the screen and
 * is fully played by the time its centre is just below the middle — so it's
 * finished while you're looking at it, never as the next chapter arrives.
 */
export function inView(trigger: Element | null) {
  return { trigger, start: "top 88%", end: "center 58%", scrub: SCRUB };
}

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
