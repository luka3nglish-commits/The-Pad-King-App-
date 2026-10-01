import type { Metadata } from "next";
import { PadMaker } from "@/components/maker/PadMaker";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Build your pad",
  description: "Design a custom Spitfire Green pad in 3D: size, thickness, edge and face. Send the build straight to The Pad King.",
};

export default function BuildPage() {
  return (
    <>
      <PadMaker />
      <SiteFooter />
    </>
  );
}
