"use client";

import { useRef } from "react";
import gsap from "gsap";
import { GEN2_POINTS, PHOTOS } from "@/lib/history";
import { HistImg } from "./HistImg";
import { useScrollFx } from "./useScrollFx";

const REFLECT = "[-webkit-box-reflect:below_2px_linear-gradient(transparent_64%,rgba(255,255,255,0.14))]";

/** Gen II in Matt's own photos: the shelf, then single pads side-on. */
export function Gen2Gallery() {
  const ref = useRef<HTMLElement>(null);
  useScrollFx(ref, (reduced) => {
    if (reduced) return;
    gsap.fromTo("[data-stack]", { scale: 0.9, y: 40 }, { scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: "[data-stack]", start: "top bottom", end: "center 55%", scrub: 0.6 } });
    gsap.utils.toArray<HTMLElement>("[data-slide]").forEach((el) => {
      const from = Number(el.dataset.slide);
      gsap.fromTo(el, { x: from, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 92%", end: "top 55%", scrub: 0.6 } });
    });
  });

  return (
    <section ref={ref} id="gen2-shelf" aria-labelledby="gen2-shelf-title" className="relative overflow-hidden pb-[clamp(88px,14svh,160px)] pt-[clamp(56px,10svh,120px)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 xl:pl-28">
        <p data-reveal className="pk-eyebrow mb-5">
          GEN II · On Matt&apos;s shelf
        </p>
        <h3 id="gen2-shelf-title" data-reveal className="pk-display max-w-[16ch] text-[clamp(34px,5.2vw,76px)]">
          Every pad with a stripe <span className="pk-gold-text">is a Gen II.</span>
        </h3>
        <p data-reveal className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-text-2">
          The interface runs right through the middle. That stripe is how you spot one.
        </p>

        <div data-stack className="relative mx-auto mt-14 max-w-[1080px] md:mt-20">
          <div className="pointer-events-none absolute inset-x-[10%] -bottom-[10%] top-[20%] rounded-full bg-[radial-gradient(closest-side,rgba(201,154,74,0.22),transparent)] blur-2xl" aria-hidden />
          <HistImg photo={PHOTOS.stacks} sizes="(min-width: 1280px) 1080px, 92vw" className={`relative h-auto w-full ${REFLECT}`} />
        </div>

        <div className="mt-24 grid gap-14 md:mt-32 md:grid-cols-2 md:items-end md:gap-10">
          {[
            { photo: PHOTOS.green, caption: "Green foam · yellow interface", from: -60 },
            { photo: PHOTOS.red, caption: "Red foam · black interface", from: 60 },
          ].map((p) => (
            <figure key={p.caption} data-slide={p.from} className="relative">
              <HistImg photo={p.photo} sizes="(min-width: 768px) 560px, 92vw" className={`h-auto w-full ${REFLECT}`} />
              <figcaption className="pk-mono mt-10 text-center text-[11px] uppercase tracking-[0.18em] text-text-2">{p.caption}</figcaption>
            </figure>
          ))}
        </div>

        <ul className="mt-20 grid gap-6 border-t border-line pt-10 md:mt-24 md:grid-cols-3 md:gap-10">
          {GEN2_POINTS.map((p, i) => (
            <li key={p.title} data-reveal className="flex gap-4">
              <span className="pk-mono mt-1 text-xs text-gold">0{i + 1}</span>
              <div>
                <p className="font-display text-[17px] font-bold uppercase tracking-wide [font-stretch:115%]">{p.title}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-text-2">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
