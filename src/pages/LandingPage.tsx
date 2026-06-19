import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureCards from '@/components/landing/FeatureCards';
import Testimonials from '@/components/landing/Testimonials';
import RippleCounter from '@/components/landing/RippleCounter';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <HowItWorks />
        <FeatureCards />
        <Testimonials />
        <RippleCounter />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
