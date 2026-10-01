import type { Metadata } from "next";
import { ComingSoon, Steps } from "@/components/ComingSoon";
import { MotionLab } from "@/components/match/MotionLab";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Pad Match" };

export default function MatchPage() {
  return (
    <>
      <ComingSoon
        eyebrow="Pad Match"
        status="Motion Lab live"
        title={
          <>
            Pad <span className="pk-gold-text">Match.</span>
          </>
        }
        body="See exactly how your pad moves on the paint. Switch between DA and rotary, change the speed, throw and pad size, and watch the path a single point on the pad traces."
      >
        <MotionLab />

        <div className="mt-16 md:mt-24">
          <p className="pk-eyebrow mb-4">Coming next</p>
          <h2 className="pk-display mb-8 text-[clamp(32px,5vw,64px)]">
            Your pad, your polish, <span className="pk-gold-text">your speed.</span>
          </h2>
          <Steps
            steps={[
              { title: "Your machine", body: "DA or rotary." },
              { title: "Paint & defect", body: "How hard the clear is and what you're taking out." },
              { title: "The answer", body: "Pad, polish, speed and passes, from The Pad King's own testing." },
            ]}
          />
        </div>
      </ComingSoon>
      <SiteFooter />
    </>
  );
}
