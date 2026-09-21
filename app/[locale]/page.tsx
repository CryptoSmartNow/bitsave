import Header from '../components/Header';
import Hero from '../components/Hero';
import LandingStats from '../components/LandingStats';
import HowItWorks from '../components/HowItWorks';
import Security from '../components/Security';
import Features from '../components/Features';
import BlogSection from '../components/BlogSection';
import CredibilitySection from '../components/CredibilitySection';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
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
    </div>
  );
}