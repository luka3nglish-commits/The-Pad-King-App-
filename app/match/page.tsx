import type { Metadata } from "next";
import { PadMatch } from "@/components/match/PadMatch";
import { SiteFooter } from "@/components/SiteFooter";
import { TabPage } from "@/components/TabPage";

export const metadata: Metadata = {
  title: "Pad Match",
  description: "Tap a Pad King pad and see the 3D, Sonax, Koch Chemie and P&S polishes that suit it.",
};

export default function MatchPage() {
  return (
    <>
      <TabPage
        eyebrow="Pad Match"
        status="Live"
        title={
          <>
            Pad <span className="pk-gold-text">Match.</span>
          </>
        }
        body="Tap a pad and see the polishes that work with it, straight from The Pad King's own testing."
      >
        <PadMatch />
      </TabPage>
      <SiteFooter />
    </>
  );
}
