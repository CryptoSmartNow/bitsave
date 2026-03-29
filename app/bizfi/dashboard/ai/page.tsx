'use client';
import { Exo } from 'next/font/google';
import BizFiAI from '../components/BizFiAI';

const exo = Exo({ subsets: ['latin'], display: 'swap', variable: '--font-exo' });

export default function BizFiAIPage() {
  return (
    <div className={`${exo.variable} font-sans min-h-screen bg-transparent px-4 sm:px-6 lg:px-8 py-8`}>
      <BizFiAI />
    </div>
  );
}
