"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ELITE_CLAIMS, PHOTOS, chapter } from "@/lib/history";
import { Ghost, chapterNumber } from "./ChapterSection";
import { HeatGauge } from "./HeatGauge";
import { HistImg } from "./HistImg";
import { SCRUB, useScrollFx } from "./useScrollFx";

const CH = chapter("gen3");

/** The finale: Gen III, the Elite Series, revealed under a spotlight. */
export function EliteReveal() {
  const ref = useRef<HTMLElement>(null);
  useScrollFx(ref, (reduced) => {
    const gauge = ref.current!.querySelector<HTMLElement>("[data-gauge]")!;
    const marks = gauge.querySelectorAll<HTMLElement>("[data-mark]");
    if (reduced) return;
    gsap.fromTo(
      "[data-logo]",
      { scale: 0.84, autoAlpha: 0, filter: "blur(16px)" },
      { scale: 1, autoAlpha: 1, filter: "blur(0px)", ease: "none", scrollTrigger: { trigger: "[data-logo]", start: "top 95%", end: "center 62%", scrub: SCRUB } },
    );
    gsap.fromTo("[data-spot]", { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 80%", end: "top 20%", scrub: true } });
    gsap.set(gauge, { "--v": 0 });
    gsap.set(marks, { autoAlpha: 0.15 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: gauge, start: "top 92%", end: "top 62%", scrub: SCRUB } });
    tl.to(gauge, { "--v": 1, ease: "power1.inOut", duration: 1 }, 0)
      .to(marks[0], { autoAlpha: 1, duration: 0.05 }, 0.55)
      .to(marks[1], { autoAlpha: 1, duration: 0.05 }, 0.72)
      .to(marks[2], { autoAlpha: 1, duration: 0.05 }, 0.95);
  });

  return (
    <section ref={ref} id="ch-gen3" data-chapter="gen3" aria-labelledby="ch-gen3-title" className="relative scroll-mt-[calc(var(--pk-header-h)+24px)] overflow-hidden py-[clamp(96px,18svh,200px)]">
      <div
        data-spot
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_38%_at_50%_26%,rgba(236,211,160,0.16),transparent_70%),radial-gradient(70%_50%_at_50%_100%,rgba(226,98,27,0.1),transparent_70%)]"
        aria-hidden
      />
      <Ghost text={CH.marker} className="left-1/2 top-[3%] -translate-x-1/2" />

      <div className="relative mx-auto max-w-[1280px] px-4 text-center sm:px-8 xl:pl-28">
        <p data-reveal className="pk-eyebrow mb-8 inline-flex items-center gap-3">
          <span className="pk-mono text-muted">{chapterNumber(CH)}</span>
          <span className="h-px w-8 bg-gold/50" aria-hidden />
          <span className="pk-live" aria-hidden />
          {CH.eyebrow}
        </p>

        <div data-logo className="relative mx-auto w-full max-w-[760px]">
          <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(201,154,74,0.35),transparent)] blur-3xl" aria-hidden />
          <HistImg photo={PHOTOS.elite} sizes="(min-width: 800px) 760px, 92vw" className="relative h-auto w-full" />
          <div className="pk-logo-sheen pointer-events-none absolute inset-0" aria-hidden />
        </div>

        <h2 id="ch-gen3-title" data-reveal className="pk-display mx-auto mt-14 text-[clamp(38px,5.2vw,80px)]">
          <span className="block">{CH.title[0]}</span>
          <span className="pk-gold-text mx-auto block w-fit pr-[0.04em]">{CH.title[1]}</span>
        </h2>
        <p data-reveal className="mx-auto mt-6 max-w-[48ch] text-[17px] leading-relaxed text-text-2 md:text-lg">
          {CH.body}
        </p>

        <ul className="mx-auto mt-14 grid max-w-[1040px] grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-line bg-line text-left md:grid-cols-4">
          {ELITE_CLAIMS.map((c) => (
            <li key={c.title} data-reveal className="bg-bg/90 p-5 md:p-6">
              <span className="block h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-orange" aria-hidden />
              <p className="mt-4 font-display text-[15px] font-bold uppercase tracking-wide [font-stretch:115%] md:text-[16px]">{c.title}</p>
              <p className="mt-1.5 text-[14px] leading-snug text-text-2">{c.body}</p>
            </li>
          ))}
        </ul>

        <div data-reveal className="mx-auto mt-16 max-w-[640px] text-left">
          <HeatGauge
            label="New pads use Australian-made adhesives rated 120, 150 and 200 °C."
            marks={[
              { at: 120, tone: "good" },
              { at: 150, tone: "good", side: "below" },
              { at: 200, tone: "good" },
            ]}
          />
          <p className="mt-5 text-center text-[15px] text-text-2">
            New pads get <span className="text-text">Australian-made adhesives</span> rated 120, 150 and 200 °C.
          </p>
        </div>
      </div>
    </section>
  );
}
