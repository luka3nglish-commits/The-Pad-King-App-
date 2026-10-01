"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => <PadGlow /> });

function PadGlow() {
  return (
    <div className="absolute inset-0 grid place-items-center md:place-items-end md:pr-[18vw]" aria-hidden>
      <div className="size-[52vmin] rounded-full bg-[radial-gradient(circle,rgba(63,160,44,0.22),transparent_62%)] blur-2xl md:mb-[22vh]" />
    </div>
  );
}

const LAYERS = [
  { name: "Velcro® brand loop", body: "Bonded with a 120 °C temperature-resistant adhesive." },
  { name: "Interface layer", body: "Stops polish soaking through to the adhesive. No velcro delamination." },
  { name: "Spitfire foam", body: "High tensile strength, tear-resistant and dense. Holds its shape far longer." },
];

const STATS = [
  { value: 50, suffix: "%", label: "Greater durability" },
  { value: 120, suffix: "°C", label: "Adhesive rating" },
  { value: 30, suffix: "+", label: "Years on paint" },
];

/**
 * Apple-style pinned story: the pad stays on stage while scroll drives the
 * camera choreography (HeroScene) and the copy beats (GSAP, scrubbed).
 */
export function HeroStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // automated browsers render slowly in software; don't let lag-smoothing stall the scrub
    if (navigator.webdriver) gsap.ticker.lagSmoothing(0);
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]");
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? true : 0.6,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        },
      });

      // Each beat: in over 0.06, hold, out over 0.06. Positions are in timeline
      // seconds where the whole timeline is 1.0 long (= scroll progress).
      const windows: [number, number][] = [
        [0, 0.2],
        [0.24, 0.42],
        [0.46, 0.72],
        [0.78, 1.0],
      ];
      beats.forEach((el, i) => {
        const [a, b] = windows[i];
        if (i === 0) {
          gsap.set(el, { autoAlpha: 1, y: 0 });
        } else {
          gsap.set(el, { autoAlpha: 0, y: 40 });
          tl.to(el, { autoAlpha: 1, y: 0, duration: 0.05 }, a);
        }
        if (i < beats.length - 1) tl.to(el, { autoAlpha: 0, y: -40, duration: 0.05, ease: "power2.in" }, b - 0.05);
      });

      // layer callouts stagger in while the pad is exploded
      tl.fromTo("[data-layer]", { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.04, stagger: 0.025 }, 0.47);

      // stats count up as you scroll into the last beat
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el, i) => {
        const to = Number(el.dataset.count);
        const obj = { v: 0 };
        tl.to(obj, { v: to, duration: 0.07, ease: "power1.out", onUpdate: () => (el.textContent = String(Math.round(obj.v))) }, 0.8 + i * 0.02);
      });

      tl.to({}, { duration: 0.0001 }, 1); // pin total length to exactly 1.0
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="story" className="relative" style={{ height: "520svh" }} aria-label="Spitfire Green story">
      <div className="sticky top-0 h-[calc(100svh-var(--pk-tab-h))] overflow-hidden">
        <div
          className="pointer-events-none absolute right-[-6vw] top-1/2 hidden size-[62vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,154,74,0.16),rgba(226,98,27,0.05)_45%,transparent_70%)] md:block lg:right-[4vw]"
          aria-hidden
        />
        <HeroScene progressRef={progressRef} />

        <div className="pointer-events-none relative z-10 mx-auto h-full max-w-[1280px] px-4 sm:px-8">
          {/* Beat 1 — intro */}
          <div data-beat className="pk-beat absolute inset-x-4 bottom-[9svh] sm:inset-x-8 md:bottom-auto md:top-[24svh] md:max-w-[620px]">
            <p className="pk-eyebrow mb-5 flex items-center gap-2.5">
              <span className="pk-live" aria-hidden /> The Pad King · Super Series Foams
            </p>
            <h1 className="pk-display text-[clamp(52px,8vw,118px)]">
              <span className="pk-gold-text block w-fit pr-[0.04em]">Spitfire</span>
              <span className="block text-text">Green.</span>
            </h1>
            <p className="mt-6 max-w-[34ch] text-[17px] leading-relaxed text-text-2 md:text-lg">
              The All Rounder. Corrects, polishes and finishes in one pad.
            </p>
          </div>

          {/* Beat 2 — one pad, three jobs */}
          <div data-beat className="pk-beat absolute inset-x-4 bottom-[9svh] sm:inset-x-8 md:bottom-auto md:top-[26svh] md:max-w-[560px]">
            <p className="pk-eyebrow mb-5">All Rounder</p>
            <h2 className="pk-display text-[clamp(44px,8.5vw,112px)]">
              One pad.
              <span className="pk-gold-text block w-fit pr-[0.04em]">Three jobs.</span>
            </h2>
            <p className="mt-6 max-w-[40ch] text-[17px] leading-relaxed text-text-2">
              Balanced light-to-medium cut across diverse paint types. Built for single-stage corrections and
              enhancements on modern clear coats from <span className="pk-mono text-text">60–105 µm</span>.
            </p>
          </div>

          {/* Beat 3 — exploded layers */}
          <div data-beat className="pk-beat absolute inset-x-4 bottom-[6svh] sm:inset-x-8 md:bottom-auto md:top-[20svh] md:max-w-[460px]">
            <p className="pk-eyebrow mb-5">Engineered stack</p>
            <h2 className="pk-display text-[clamp(40px,7vw,96px)]">
              Built in <span className="pk-gold-text">layers.</span>
            </h2>
            <ol className="mt-7 space-y-4 md:mt-10 md:space-y-6">
              {LAYERS.map((l, i) => (
                <li key={l.name} data-layer className="flex gap-4">
                  <span className="pk-mono mt-0.5 text-xs text-gold">0{i + 1}</span>
                  <div>
                    <p className="font-display text-[15px] font-bold uppercase tracking-wide [font-stretch:115%]">{l.name}</p>
                    <p className="mt-1 text-[15px] leading-snug text-text-2">{l.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Beat 4 — proof */}
          <div data-beat className="pk-beat absolute inset-x-4 bottom-[7svh] sm:inset-x-8 md:bottom-auto md:top-[20svh] md:max-w-[640px]">
            <p className="pk-eyebrow mb-5">Tested to failure</p>
            <h2 className="pk-display text-[clamp(40px,7vw,96px)]">
              Proven on <span className="pk-gold-text">real paint.</span>
            </h2>
            <dl className="mt-8 grid grid-cols-3 gap-4 md:gap-6">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col border-t border-line-2 pt-4">
                  <dt className="pk-mono order-2 mt-2 block text-[10px] uppercase tracking-[0.18em] text-text-2 md:text-[11px]">{s.label}</dt>
                  <dd className="pk-display order-1 whitespace-nowrap text-[clamp(28px,3.4vw,48px)] text-text">
                    <span data-count={s.value}>{s.value}</span>
                    <span className="text-gold">{s.suffix}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-7 max-w-[44ch] text-[15px] leading-relaxed text-text-2">
              Every design is tested to failure on real cars and real paint systems at the Adelaide R&amp;D facility.
              Designed by master detailer Matthew Gibb.
            </p>
            <Link
              href="/build"
              className="pk-btn-gold pointer-events-auto mt-8 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px]"
            >
              Build your own pad
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden>
          <span className="pk-mono text-[10px] uppercase tracking-[0.3em] text-muted">Scroll</span>
          <span className="h-10 w-px overflow-hidden bg-line-2">
            <span className="block h-1/2 w-px animate-[pk-cue_1.8s_ease-in-out_infinite] bg-gold" />
          </span>
        </div>
      </div>
    </section>
  );
}
