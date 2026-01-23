import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Security from './components/Security';
import Features from './components/Features';
import BlogSection from './components/BlogSection';
import Team from './components/Team';
import BizFiSection from './components/BizFiSection';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Security />
        <Features />
        <BizFiSection />
        <BlogSection />
        <Team />
        <FAQ />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
