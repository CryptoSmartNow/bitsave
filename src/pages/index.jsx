'use client'

import 'aos/dist/aos.css';
import AOS from 'aos';
import Head from 'next/head';

import Header from '../components/Header'
import Footer from '../components/Footer'
import ProtocolSections from '../components/ProtocolSections'
import HowItWorks from '../components/HowItWorks'
import { useEffect } from 'react';


const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });

  }, []);
  return (
    <>
      <Head>
        <title>Bitsave | Decentralized Savings Platform</title>
        <meta name="description" content="Save and manage your crypto assets with Bitsave" />
      </Head>
      

      <Header />
      {/* <Banner/> */}
      <ProtocolSections />
      <HowItWorks />
      <Footer />

    
    </>
  );
};

export default Home;


