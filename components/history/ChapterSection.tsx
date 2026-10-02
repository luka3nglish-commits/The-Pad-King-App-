import type { ReactNode } from "react";
import { CHAPTERS, type Chapter } from "@/lib/history";

export function chapterNumber(ch: Chapter) {
  return String(CHAPTERS.indexOf(ch) + 1).padStart(2, "0");
}

/** Eyebrow and headline. Elements fade up as they scroll in ([data-reveal]). */
export function ChapterTitle({ ch, reveal = true, size = "lg", center }: { ch: Chapter; reveal?: boolean; size?: "lg" | "sm"; center?: boolean }) {
  const r = reveal ? { "data-reveal": "" } : {};
  return (
    <>
      <p {...r} className={`pk-eyebrow mb-5 flex items-center gap-3 ${center ? "justify-center" : ""}`}>
        <span className="pk-mono text-muted">{chapterNumber(ch)}</span>
        <span className="h-px w-8 bg-gold/50" aria-hidden />
        {ch.eyebrow}
      </p>
      <h2 {...r} id={`ch-${ch.id}-title`} className={`pk-display ${size === "lg" ? "text-[clamp(38px,5.2vw,80px)]" : "text-[clamp(34px,4.2vw,62px)]"}`}>
        <span className="block">{ch.title[0]}</span>
        <span className={`pk-gold-text block w-fit pr-[0.04em] ${center ? "mx-auto" : ""}`}>{ch.title[1]}</span>
      </h2>
    </>
  );
}

export function ChapterBody({ ch, reveal = true, className = "" }: { ch: Chapter; reveal?: boolean; className?: string }) {
  return (
    <p {...(reveal ? { "data-reveal": "" } : {})} className={`max-w-[46ch] text-[17px] leading-relaxed text-text-2 md:text-lg ${className}`}>
      {ch.body}
    </p>
  );
}

/** Giant outline numeral drifting behind a chapter (parallax via [data-ghost]). */
export function Ghost({ text, className = "-right-[4vw] top-[6%]" }: { text: string; className?: string }) {
  return (
    <div data-ghost aria-hidden className={`pk-ghost pointer-events-none absolute ${className}`}>
      {text}
    </div>
  );
}

/**
 * A standard chapter: the headline across the page, then the copy and a visual
 * side by side. On phones the visual comes straight after the headline.
 */
export function ChapterSection({
  ch,
  visual,
  children,
  flip,
  className = "",
}: {
  ch: Chapter;
  visual?: ReactNode;
  children?: ReactNode;
  flip?: boolean;
  className?: string;
}) {
  return (
    <section
      id={`ch-${ch.id}`}
      data-chapter={ch.id}
      aria-labelledby={`ch-${ch.id}-title`}
      className={`relative scroll-mt-[calc(var(--pk-header-h)+24px)] overflow-hidden py-[clamp(88px,15svh,170px)] ${className}`}
    >
      <Ghost text={ch.marker} />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-8 xl:pl-28">
        <ChapterTitle ch={ch} />
        <div className="mt-10 grid items-center gap-10 md:mt-14 md:grid-cols-2 md:gap-16">
          <div className={flip ? "md:order-2" : undefined}>
            <ChapterBody ch={ch} />
            {children}
          </div>
          {visual && (
            <div data-reveal className={`order-first ${flip ? "md:order-1" : "md:order-none"}`}>
              {visual}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
