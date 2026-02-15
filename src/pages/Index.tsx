import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { EventsPreviewSection } from "@/components/home/EventsPreviewSection";
import { SermonSeriesSection } from "@/components/home/SermonSeriesSection";
import { WelcomeCTASection } from "@/components/home/WelcomeCTASection";
import { PastorsSection } from "@/components/home/PastorsSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <WelcomeSection />
      <EventsPreviewSection />
      <SermonSeriesSection />
      <WelcomeCTASection />
      <PastorsSection />
    </Layout>
  );
};

export default Index;
