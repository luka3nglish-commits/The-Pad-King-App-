"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import gsap from "gsap";
import { chapter } from "@/lib/history";
import { ChapterBody, ChapterTitle } from "./ChapterSection";
import { HeatGauge } from "./HeatGauge";
import { SCRUB, useScrollFx } from "./useScrollFx";

const GenScene = dynamic(() => import("./GenScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center md:place-items-end md:pr-[16vw]" aria-hidden>
      <div className="size-[52vmin] rounded-full bg-[radial-gradient(circle,rgba(63,160,44,0.2),transparent_62%)] blur-2xl md:mb-[22vh]" />
    </div>
  ),
});

const BEATS = [chapter("gen1"), chapter("glue"), chapter("gen2")];
// where each beat sits in the pinned scroll (0 → 1)
const WINDOWS: [number, number][] = [
  [0, 0.3],
  [0.34, 0.64],
  [0.68, 1],
];

/**
 * Gen I → the glue → Gen II, pinned Apple-style: one pad on stage while scroll
 * turns it, heats the glue line and fades in the Gen II interface stripe.
 */
export function GenSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);

  useScrollFx(sectionRef, (reduced) => {
    const beats = gsap.utils.toArray<HTMLElement>("[data-beat]");
    const ghosts = gsap.utils.toArray<HTMLElement>("[data-beat-ghost]");
    const gauge = sectionRef.current!.querySelector<HTMLElement>("[data-gauge]")!;
    const marks = gauge.querySelectorAll<HTMLElement>("[data-mark]");
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: reduced ? true : SCRUB,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      },
    });
    beats.forEach((el, i) => {
      const [a, b] = WINDOWS[i];
      const ghost = ghosts[i];
      if (i === 0) {
        gsap.set([el, ghost], { autoAlpha: 1, y: 0 });
      } else {
        gsap.set([el, ghost], { autoAlpha: 0, y: 40 });
        tl.to([el, ghost], { autoAlpha: 1, y: 0, duration: 0.05 }, a);
      }
      if (i < beats.length - 1) tl.to([el, ghost], { autoAlpha: 0, y: -40, duration: 0.05, ease: "power2.in" }, b - 0.05);
    });
    // the gauge: typical hot melt first, then Pad King's 120 °C
    gsap.set(gauge, { "--v": 0 });
    gsap.set(marks, { autoAlpha: 0.15 });
    tl.to(gauge, { "--v": 70 / 200, duration: 0.05, ease: "power1.inOut" }, 0.37)
      .to(marks[0], { autoAlpha: 1, duration: 0.02 }, 0.41)
      .to(gauge, { "--v": 120 / 200, duration: 0.06, ease: "power1.inOut" }, 0.43)
      .to(marks[1], { autoAlpha: 1, duration: 0.02 }, 0.48)
      .to({}, { duration: 0.0001 }, 1); // pin the timeline length to exactly 1.0
  });

  return (
    <section ref={sectionRef} id="gen-seq" className="relative" style={{ height: "380svh" }} aria-label="From Gen I to Gen II">
      {/* chapter anchors for the rail and the hero ribbon */}
      <div id="ch-gen1" data-chapter="gen1" className="pointer-events-none absolute inset-x-0 top-0 h-[34%]" aria-hidden />
      <div id="ch-glue" data-chapter="glue" className="pointer-events-none absolute inset-x-0 top-[34%] h-[34%]" aria-hidden />
      <div id="ch-gen2" data-chapter="gen2" className="pointer-events-none absolute inset-x-0 top-[68%] h-[32%]" aria-hidden />

      <div className="sticky top-0 h-[calc(100svh-var(--pk-tab-h))] overflow-hidden">
        {BEATS.map((c) => (
          <div key={c.id} data-beat-ghost className="pk-ghost pointer-events-none absolute -right-[4vw] bottom-[2%] md:bottom-auto md:top-[10%]" aria-hidden>
            {c.marker}
          </div>
        ))}
        <div
          className="pointer-events-none absolute right-[-6vw] top-1/2 hidden size-[62vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,154,74,0.16),rgba(226,98,27,0.05)_45%,transparent_70%)] md:block lg:right-[4vw]"
          aria-hidden
        />
        <GenScene progressRef={progressRef} />

        <div className="pointer-events-none relative z-10 mx-auto h-full max-w-[1280px] px-4 sm:px-8 xl:pl-28">
          {BEATS.map((c, i) => (
            <div
              key={c.id}
              data-beat
              className="pk-beat absolute inset-x-4 bottom-[5svh] sm:inset-x-8 md:bottom-auto md:right-auto md:top-[20svh] md:max-w-[520px] xl:left-28"
            >
              <ChapterTitle ch={c} reveal={false} size="sm" />
              <ChapterBody ch={c} reveal={false} className="mt-5 text-[16px] md:text-[17px]" />
              {i === 1 && (
                <div className="mt-8 max-w-[440px]">
                  <HeatGauge
                    label="Adhesive temperature rating: typical hot melt around 70 °C, Pad King 120 °C."
                    marks={[
                      { at: 70, label: "Typical hot melt", tone: "bad", side: "below" },
                      { at: 120, label: "Pad King", tone: "good" },
                    ]}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
