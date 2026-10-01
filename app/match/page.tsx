import type { Metadata } from "next";
import { ComingSoon, Steps } from "@/components/ComingSoon";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Pad Match" };

export default function MatchPage() {
  return (
    <>
      <ComingSoon
        eyebrow="Pad Match"
        title={
          <>
            Pad <span className="pk-gold-text">Match.</span>
          </>
        }
        body="Tell it your machine, your paint and the defect. It tells you the pad, the polish and the speed, straight from The Pad King's own testing."
      >
        <Steps
          steps={[
            { title: "Your machine", body: "DA or rotary." },
            { title: "Paint & defect", body: "How hard the clear is and what you're taking out." },
            { title: "The answer", body: "Pad, polish, speed and passes, with a live view of the pad's motion." },
          ]}
        />
      </ComingSoon>
      <SiteFooter />
    </>
  );
}
