"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CAUSES, chapter } from "@/lib/history";
import { ChapterRail } from "./ChapterRail";
import { ChapterSection } from "./ChapterSection";
import { CncRings } from "./CncRings";
import { EliteReveal } from "./EliteReveal";
import { FailureDiagram } from "./FailureDiagram";
import { FoamNetwork } from "./FoamNetwork";
import { Gen2Gallery } from "./Gen2Gallery";
import { GenSequence } from "./GenSequence";
import { HistoryHero } from "./HistoryHero";
import { HistoryOutro } from "./HistoryOutro";
import { YearsOnPaint } from "./YearsOnPaint";
import { useScrollFx } from "./useScrollFx";

/**
 * The home page: The Pad King story, from Matt's first year on the tools to the
 * Elite Series. Copy lives in lib/history.ts.
 */
export function HistoryStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useScrollFx(rootRef, (reduced) => {
    // fonts change line breaks; re-measure trigger positions once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    if (reduced) return;
    gsap.set("[data-reveal]", { autoAlpha: 0, y: 36 });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 92%",
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, overwrite: true }),
    });
    gsap.utils.toArray<HTMLElement>("[data-ghost]").forEach((el) => {
      gsap.fromTo(el, { yPercent: 22 }, { yPercent: -22, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  return (
    <div ref={rootRef}>
      <HistoryHero />
      <div ref={storyRef}>
        <ChapterSection ch={chapter("1993")} visual={<YearsOnPaint />} />

        <ChapterSection ch={chapter("problem")} visual={<FailureDiagram />} flip>
          <ol className="mt-10 max-w-[480px] space-y-5">
            {CAUSES.map((c, i) => (
              <li key={c.title} data-reveal className="flex gap-4 border-t border-line pt-5">
                <span className="pk-mono mt-0.5 text-xs text-orange">0{i + 1}</span>
                <div>
                  <p className="font-display text-[15px] font-bold uppercase tracking-wide [font-stretch:115%]">{c.title}</p>
                  <p className="mt-1 text-[15px] leading-snug text-text-2">{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </ChapterSection>

        <ChapterSection ch={chapter("2014")} visual={<CncRings />}>
          <dl className="mt-10 grid max-w-[520px] grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8">
            {[
              { v: "50–100", s: "+", label: "Hours of development per pad" },
              { v: "3", s: "", label: "Sizes: 90 · 140 · 150 mm" },
            ].map((d) => (
              <div key={d.label} data-reveal className="flex flex-col border-t border-line-2 pt-4">
                <dt className="pk-mono order-2 mt-2 text-[10.5px] uppercase tracking-[0.16em] text-text-2">{d.label}</dt>
                <dd className="pk-display order-1 whitespace-nowrap text-[clamp(28px,3.2vw,44px)]">
                  {d.v}
                  <span className="text-gold">{d.s}</span>
                </dd>
              </div>
            ))}
          </dl>
        </ChapterSection>

        <GenSequence />
        <Gen2Gallery />

        <ChapterSection ch={chapter("2024")} visual={<FoamNetwork />} flip />

        <EliteReveal />
      </div>
      <ChapterRail storyRef={storyRef} />
      <HistoryOutro />
    </div>
  );
}
