'use client';

import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
} 