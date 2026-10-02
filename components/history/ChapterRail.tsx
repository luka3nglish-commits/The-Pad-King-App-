"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { CHAPTERS } from "@/lib/history";
import { jumpTo } from "./useScrollFx";

/**
 * Where you are in the story. Wide screens: a vertical rail on the left with a
 * gold progress line. Phones and tablets: a slim strip under the header.
 * Shows only while the chapters are on screen.
 */
export function ChapterRail({ storyRef }: { storyRef: RefObject<HTMLElement | null> }) {
  const [active, setActive] = useState(0);
  const [on, setOn] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const marks = Array.from(story.querySelectorAll<HTMLElement>("[data-chapter]"));
    const vis = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "-40% 0px -55% 0px" });
    vis.observe(story);

    let raf = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      // active chapter = the last one whose start has passed the middle of the screen
      const mid = window.innerHeight * 0.5;
      let idx = 0;
      marks.forEach((m, i) => {
        if (m.getBoundingClientRect().top <= mid) idx = i;
      });
      setActive(idx);
      const r = story.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height));
      railRef.current?.style.setProperty("--p", p.toFixed(4));
      stripRef.current?.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
      // and once more after scrolling stops, in case a busy 3D frame swallowed the last one
      clearTimeout(settle);
      settle = setTimeout(update, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    raf = requestAnimationFrame(update);
    return () => {
      vis.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [storyRef]);

  const current = CHAPTERS[active];

  return (
    <>
      {/* wide screens */}
      <nav
        aria-label="Story chapters"
        className={`fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 xl:block ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div ref={railRef} className="relative py-1 [--p:0]">
          <span className="absolute bottom-0 left-[5px] top-0 w-px bg-line-2" aria-hidden />
          <span className="absolute left-[5px] top-0 w-px origin-top bg-gradient-to-b from-gold-hi to-gold" style={{ height: "100%", transform: "scaleY(var(--p))" }} aria-hidden />
          <ol className="relative flex flex-col gap-5">
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <a
                  href={`#ch-${c.id}`}
                  onClick={jumpTo}
                  aria-current={i === active ? "step" : undefined}
                  className="group flex items-center gap-3"
                >
                  <span
                    className={`size-[11px] rounded-full border transition-all duration-300 ${
                      i === active ? "scale-110 border-gold-hi bg-gold shadow-[0_0_14px_rgba(201,154,74,0.7)]" : i < active ? "border-gold bg-gold/40" : "border-line-2 bg-bg"
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`pk-mono whitespace-nowrap text-[10px] uppercase tracking-[0.16em] transition-colors ${
                      i === active ? "text-gold-hi" : "text-muted group-hover:text-text-2"
                    }`}
                  >
                    {c.marker}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* phones and tablets */}
      <div
        ref={stripRef}
        className={`fixed inset-x-0 top-[calc(var(--pk-header-h)+env(safe-area-inset-top))] z-40 border-b border-line bg-bg/80 backdrop-blur-xl transition-[opacity,transform] duration-500 [--p:0] xl:hidden ${
          on ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        aria-hidden={!on}
      >
        <div className="mx-auto flex h-9 max-w-[1280px] items-center gap-3 px-4 sm:px-8">
          <span className="pk-mono text-[10px] text-muted">
            {String(active + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
          </span>
          <span className="h-3 w-px bg-line-2" aria-hidden />
          <span key={current.id} className="pk-mono pk-fade-up truncate text-[10.5px] uppercase tracking-[0.16em] text-gold-hi">
            {current.eyebrow}
          </span>
        </div>
        <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-gold to-orange" style={{ transform: "scaleX(var(--p))" }} aria-hidden />
      </div>
    </>
  );
}
