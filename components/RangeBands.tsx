import { PADS } from "@/lib/pads";

/**
 * Signature mark: the range as a row of coloured bands, after the stacked pads
 * in Matt's logo and the stripe through every Gen II pad. Use sparingly.
 */
export function RangeBands({ className = "", size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const w = size === "sm" ? "w-3" : "w-6";
  const h = size === "sm" ? "h-[3px]" : "h-1";
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`} aria-hidden>
      {PADS.map((p) => (
        <span key={p.id} className={`${w} ${h} rounded-full`} style={{ background: p.color }} />
      ))}
    </span>
  );
}
