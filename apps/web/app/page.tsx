import FeaturesSection from "@/components/features-5";
import FooterSection from "@/components/footer";
import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-4";

export default function Page() {
  return (
    <div>
      <HeroHeader />
      <HeroSection />
      <FeaturesSection />
      <IntegrationsSection />
      <FooterSection />
    </div>
  );
}
