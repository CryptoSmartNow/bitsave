import Header from './components/Header';
import Hero from './components/Hero';
import LandingStats from './components/LandingStats';
import HowItWorks from './components/HowItWorks';
import Security from './components/Security';
import Features from './components/Features';
import BlogSection from './components/BlogSection';
import CredibilitySection from './components/CredibilitySection';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

export default function Home() {
  return (
    <div className="min-h-screen">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (min-width: 1024px) {
          html { font-size: 90% !important; }
        }
      `}} />
      <Header />
      <main>
        <Hero />
        <LandingStats />
        <HowItWorks />
        <CredibilitySection />
        <Security />
        <Features />
        <BlogSection />
        <FAQ />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
