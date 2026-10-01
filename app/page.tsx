import { HeroStory } from "@/components/hero/HeroStory";
import { PadMaker } from "@/components/maker/PadMaker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TigerBackdrop } from "@/components/TigerBackdrop";

export default function Home() {
  return (
    <>
      <TigerBackdrop />
      <SiteHeader />
      <main className="relative z-10">
        <HeroStory />
        <PadMaker />
      </main>
      <SiteFooter />
    </>
  );
}
