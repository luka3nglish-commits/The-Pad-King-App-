import type { Metadata } from "next";
import Link from "next/link";
import { TabPage } from "@/components/TabPage";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "The range" };

// Names as listed on thepadking.com.au. Roles/specs land with the 3D catalogue.
const RANGE = ["Afterburner", "Frostbite Cutting Pad", "Lone Star Red", "Midas Touch Gold", "Spitfire Green"];

export default function RangePage() {
  return (
    <>
      <TabPage
        eyebrow="3D catalogue"
        title={
          <>
            The <span className="pk-gold-text">range.</span>
          </>
        }
        body="Every pad in the Super Series line-up in 3D. Spin it, open it up, read the specs, then buy it in a tap."
      >
        <ol className="border-t border-line">
          {RANGE.map((name, i) => {
            const live = name === "Spitfire Green";
            return (
              <li key={name} className="flex flex-col gap-1.5 border-b border-line py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:py-6">
                <span className="flex items-baseline gap-4 md:gap-6">
                  <span className="pk-mono text-xs text-muted">0{i + 1}</span>
                  <span className={`pk-display text-[clamp(26px,4.6vw,56px)] ${live ? "pk-gold-text" : "text-text/85"}`}>{name}</span>
                </span>
                {live ? (
                  <Link href="/build" className="pk-mono shrink-0 pl-9 text-[11px] uppercase tracking-[0.18em] text-gold-hi hover:text-text sm:pl-0">
                    Build it now →
                  </Link>
                ) : (
                  <span className="pk-mono shrink-0 pl-9 text-[11px] uppercase tracking-[0.18em] text-muted sm:pl-0">In 3D soon</span>
                )}
              </li>
            );
          })}
        </ol>
      </TabPage>
      <SiteFooter />
    </>
  );
}
