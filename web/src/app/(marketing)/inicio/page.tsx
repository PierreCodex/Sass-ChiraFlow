import HeaderAlert from "@/features/marketing/components/header/HeaderAlert";
import HpHeader from "@/features/marketing/components/header/HpHeader";
import Banner from "@/features/marketing/components/homepage/Banner";
import Features from "@/features/marketing/components/homepage/Features";
import StatsSection from "@/features/marketing/components/StatsSection";
import FAQ from "@/features/marketing/components/homepage/FAQ";
import PricingSection from "@/features/marketing/components/PricingSection";
import C2a from "@/features/marketing/components/homepage/C2a";
import Footer from "@/features/marketing/components/Footer";
import ScrollToTop from "@/features/marketing/components/ScrollToTop";

/**
 * Landing pública del SaaS, armada con los componentes reales de
 * `frontend-pages/homepage` de Modernize (mismo header, hero, cuadrícula de
 * features, FAQ, CTA, footer y botón scroll-to-top) — con el copy de este
 * producto y capturas reales del panel y de la tienda en vez de las de la demo.
 */
export default function InicioPage() {
  return (
    <>
      <HeaderAlert />
      <HpHeader />
      <Banner />
      <StatsSection />
      <Features />
      <FAQ />
      <PricingSection />
      <C2a />
      <Footer />
      <ScrollToTop />
    </>
  );
}
