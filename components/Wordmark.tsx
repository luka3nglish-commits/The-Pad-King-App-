/** Placeholder wordmark until Matt's vector logo arrives — swap this for the SVG. */
export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className={`flex items-center ${lg ? "gap-4" : "gap-2.5"}`}>
      <svg width={lg ? 52 : 26} height={lg ? 44 : 22} viewBox="0 0 26 22" aria-hidden className="shrink-0">
        <path d="M3 15 1.5 3.5l6 5L13 1l5.5 7.5 6-5L23 15Z" fill="var(--pk-gold)" />
        <rect x="3" y="17" width="20" height="3.5" rx="1" fill="var(--pk-spitfire)" />
      </svg>
      <span className="leading-none">
        <span className={`pk-gold-text block font-display font-black uppercase tracking-[0.02em] [font-stretch:125%] ${lg ? "text-[32px]" : "text-[17px]"}`}>
          The Pad King
        </span>
        <span className={`pk-mono block uppercase text-text-2 ${lg ? "mt-2 text-[13px] tracking-[0.34em]" : "mt-1 text-[8.5px] tracking-[0.32em]"}`}>
          Super Series Foams
        </span>
      </span>
    </span>
  );
}
