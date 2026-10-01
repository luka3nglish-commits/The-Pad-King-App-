import type { Metadata } from "next";
import { RangeShowroom } from "@/components/range/RangeShowroom";
import { SiteFooter } from "@/components/SiteFooter";
import { TabPage } from "@/components/TabPage";

export const metadata: Metadata = {
  title: "The range",
  description: "Every Pad King Super Series pad in 3D, with specs and a straight link to buy.",
};

export default function RangePage() {
  return (
    <>
      <TabPage
        eyebrow="The range"
        status="Super Series Foams"
        title={
          <>
            The <span className="pk-gold-text">range.</span>
          </>
        }
        body="Every Super Series pad in 3D. Spin it, read the specs, and buy it straight from The Pad King."
      >
        <RangeShowroom />
      </TabPage>
      <SiteFooter />
    </>
  );
}
