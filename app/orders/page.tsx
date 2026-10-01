import type { Metadata } from "next";
import { Steps, TabPage } from "@/components/TabPage";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Reorder" };

export default function OrdersPage() {
  return (
    <>
      <TabPage
        eyebrow="Reorder"
        title={
          <>
            Reorder in <span className="pk-gold-text">one tap.</span>
          </>
        }
        body="Your past pads and custom builds in one place, ready to go again. You'll get an email when your pads are due for replacing."
      >
        <Steps
          steps={[
            { title: "Sign in", body: "With your Pad King store account." },
            { title: "Your pads", body: "Every order and saved custom build, in one list." },
            { title: "Tap to reorder", body: "Plus an email reminder before your pads wear out." },
          ]}
        />
      </TabPage>
      <SiteFooter />
    </>
  );
}
