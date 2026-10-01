import type { Metadata } from "next";
import { PadMaker } from "@/components/maker/PadMaker";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Build your pad" };

export default function BuildPage() {
  return (
    <>
      <PadMaker />
      <SiteFooter />
    </>
  );
}
