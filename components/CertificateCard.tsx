import React from 'react';
import Image from 'next/image';
import { Exo } from 'next/font/google';

const exo = Exo({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] });

interface Holding {
  _id: string;
  instrument: string;
  investmentAmount: number;
  status: string;
  mintAddress: string;
  serialNumber: string;
  purchaseDate: string;
  apr: string;
  wallet?: string;
  business?: string | null;
}

interface CertificateCardProps {
  holding: Holding;
}

export function CertificateCard({ holding }: CertificateCardProps) {
  const { instrument, investmentAmount, serialNumber, purchaseDate, apr, wallet, business } = holding;

  // Derive values based on instrument type
  const isBizYield = instrument === 'BizYield';
  const isBizCredit = instrument === 'BizCredit';
  const isBizBond = instrument === 'BizBond';

  const unitPrice = isBizYield ? 10 : isBizCredit ? 100 : 1000;
  const units = Math.floor(investmentAmount / unitPrice);

  const displayAddress = wallet 
    ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
    : '7xKz...3mPq';

  // Specific Strings
  let title = '';
  let subtitle = 'Official RWA Record . Bizmarket Protocol';
  let centralTitle = '';
  let highlightText = '';
  let detailedText = '';
  
  if (isBizBond) {
    title = 'FIXED INCOME CERTIFICATE';
    centralTitle = 'BIZBOND';
    // Dummy values for demonstration if exact calculations aren't available
    const quarterly = (investmentAmount * 0.10) / 4;
    highlightText = `Fixed Annual Yield: 10% . $${quarterly.toFixed(2)} per quarter`;
    detailedText = `Entitled to $${quarterly.toFixed(2)} quarterly, paid in stablecoins. Fixed 10% annual return on $${investmentAmount.toFixed(2)} principal. Backed by government treasury instruments. Vesting period ends September 1, 2026. This certificate is irrefutably recorded and secured on the Solana blockchain.`;
  } else if (isBizCredit) {
    title = 'CREDIT YIELD CERTIFICATE';
    centralTitle = 'BIZCREDIT';
    const weekly = (investmentAmount * 0.16) / 52; // 16% APR approximation
    highlightText = `Weekly Yield: $${weekly.toFixed(2)} per week . 12 weeks`;
    const totalReturn = investmentAmount + (weekly * 12);
    detailedText = `Entitled to $${weekly.toFixed(2)} weekly for 12 consecutive weeks beginning July 20, 2026. Principal of $${investmentAmount.toFixed(2)} returned at Week 12. Total return: $${totalReturn.toFixed(2)}. Paid in USDC. This certificate is irrefutably recorded and secured on the Solana blockchain.`;
  } else if (isBizYield) {
    title = 'REVENUE SHARE CERTIFICATE';
    const bizName = business ? business.toUpperCase() : 'SHARD';
    centralTitle = `BIZYIELD - ${bizName}`;
    const sharePercent = (units * 0.1).toFixed(1); // Mock 0.1% per unit
    highlightText = `Revenue Share: ${sharePercent}% of ${bizName}'s monthly revenue pool`;
    detailedText = `Entitled to ${sharePercent}% of ${bizName}'s monthly revenue, paid monthly in stablecoins for 24 months. Yield begins September 1, 2026. This certificate is irrefutably recorded and secured on the Solana blockchain.`;
  } else {
    title = 'DIGITAL CERTIFICATE';
    centralTitle = instrument.toUpperCase();
    highlightText = `APR: ${apr}`;
    detailedText = `This certificate is irrefutably recorded and secured on the Solana blockchain.`;
  }

  const dateStr = purchaseDate 
    ? new Date(purchaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const prefix = isBizBond ? 'BB' : isBizCredit ? 'BC' : isBizYield ? 'BY' : 'CT';
  const certNo = `#${prefix}-${serialNumber ? serialNumber.slice(0, 5).toUpperCase() : '001'}`;

  // Styles per instrument
  let themeConfig = {
    color1Hex: '#5CDA94',
    bgGlow: 'from-[#132219]',
    borderFrom: 'from-[#5CDA94]/40',
    borderTo: 'to-[#F5A623]/40',
    edgeHFrom: 'from-[#5CDA94]/60',
    edgeHVia: 'via-[#5CDA94]/20',
    edgeHTo: 'to-[#F5A623]/60',
    edgeVFrom: 'from-[#5CDA94]/60',
    edgeVVia: 'via-[#5CDA94]/20',
    edgeVTo: 'to-[#5CDA94]/60',
    edgeVFrom2: 'from-[#F5A623]/60',
    edgeVVia2: 'via-[#F5A623]/20',
    edgeVTo2: 'to-[#F5A623]/60',
    cornerTL: 'border-[#5CDA94]/60',
    cornerTR: 'border-[#F5A623]/60',
    cornerBL: 'border-[#5CDA94]/60',
    cornerBR: 'border-[#F5A623]/60',
    textMain: 'text-[#5CDA94]',
    divider: 'via-[#5CDA94]/30',
    innerDivider: 'via-[#5CDA94]/40',
    dropShadow: 'drop-shadow-[0_0_20px_rgba(92,218,148,0.2)]',

    containerBg: 'bg-[#0A0D10]',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-400',
    textMuted: 'text-gray-300',
    textFaded: 'text-gray-200',
    innerContainerClasses: 'bg-[#0B1014] shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative',
    walletInputClasses: 'border-gray-700/50 bg-[#161B1E]/60 text-gray-300',
    sealOuterBg: 'bg-[#46C181]',
    sealInnerBg: 'bg-[#11161A]',
    sealIconColor: 'text-[#5CDA94]',
    sealColor: 'text-[#5CDA94]',
  };

  if (isBizBond) {
    themeConfig = {
      color1Hex: '#A3E5C2',
      bgGlow: 'from-[#182B24]/0',
      borderFrom: 'from-[#A3E5C2]/40',
      borderTo: 'to-[#3B82F6]/40',
      edgeHFrom: 'from-[#A3E5C2]/60',
      edgeHVia: 'via-[#A3E5C2]/20',
      edgeHTo: 'to-[#3B82F6]/60',
      edgeVFrom: 'from-[#A3E5C2]/60',
      edgeVVia: 'via-[#A3E5C2]/20',
      edgeVTo: 'to-[#A3E5C2]/60',
      edgeVFrom2: 'from-[#3B82F6]/60',
      edgeVVia2: 'via-[#3B82F6]/20',
      edgeVTo2: 'to-[#3B82F6]/60',
      cornerTL: 'border-[#A3E5C2]/60',
      cornerTR: 'border-[#3B82F6]/60',
      cornerBL: 'border-[#A3E5C2]/60',
      cornerBR: 'border-[#3B82F6]/60',
      textMain: 'text-[#A3E5C2]',
      divider: 'via-[#A3E5C2]/30',
      innerDivider: 'via-[#A3E5C2]/40',
      dropShadow: 'drop-shadow-[0_0_20px_rgba(163,229,194,0.2)]',

      containerBg: 'bg-[#E8F8F0]',
      textPrimary: 'text-[#1D2A24]',
      textSecondary: 'text-[#3E5549]',
      textMuted: 'text-[#1D2A24]',
      textFaded: 'text-[#2A4736]',
      innerContainerClasses: 'bg-[#D2F3E1] shadow-sm relative border border-[#A3E5C2]',
      walletInputClasses: 'border-[#A3E5C2] bg-[#E8F8F0] text-[#1D2A24]',
      sealOuterBg: 'bg-[#85D3AD]',
      sealInnerBg: 'bg-[#E8F8F0]',
      sealIconColor: 'text-[#A3E5C2]',
      sealColor: 'text-[#A3E5C2]',
    };
  } else if (isBizCredit) {
    themeConfig = {
      color1Hex: '#ffffff',
      bgGlow: 'from-[#4ade80]/20', // subtle lighter green glow
      borderFrom: 'from-white/50',
      borderTo: 'to-white/50',
      edgeHFrom: 'from-white/60',
      edgeHVia: 'via-white/30',
      edgeHTo: 'to-white/60',
      edgeVFrom: 'from-white/60',
      edgeVVia: 'via-white/30',
      edgeVTo: 'to-white/60',
      edgeVFrom2: 'from-white/60',
      edgeVVia2: 'via-white/30',
      edgeVTo2: 'to-white/60',
      cornerTL: 'border-white/60',
      cornerTR: 'border-white/60',
      cornerBL: 'border-white/60',
      cornerBR: 'border-white/60',
      textMain: 'text-white',
      divider: 'via-white/50',
      innerDivider: 'via-white/40',
      dropShadow: 'drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]',

      containerBg: 'bg-[#31BC6C]', // Solid vibrant green from image
      textPrimary: 'text-white',
      textSecondary: 'text-green-100', // Light green for secondary text
      textMuted: 'text-white',
      textFaded: 'text-white',
      innerContainerClasses: 'bg-black/10 backdrop-blur-md relative border border-transparent', // Darker translucent box
      walletInputClasses: 'border-white/30 bg-black/10 text-white',
      sealOuterBg: 'bg-gray-300', // Grey outer ring
      sealInnerBg: 'bg-[#31BC6C]', // Green inner circle
      sealIconColor: 'text-white', // White check
      sealColor: 'text-gray-200', // Light grey scalloped star
    };
  }

  return (
    <div className={`relative w-full max-w-[1100px] mx-auto rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-center items-center py-16 px-8 md:px-16 font-sans ${exo.className} ${themeConfig.containerBg} ${themeConfig.textPrimary}`}>
      
      {/* Universal gradient borders based on theme */}
      <>
        {/* Subtle background glow */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${themeConfig.bgGlow} via-[#0A0D10] to-[#0A0D10] opacity-90`} />
        
        {/* Outer simple rounded border */}
        <div className={`absolute inset-1.5 rounded-xl border border-transparent bg-gradient-to-br ${themeConfig.borderFrom} via-transparent ${themeConfig.borderTo} [mask-composite:exclude]`} style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', padding: '1px' }} />
        
        {/* Inner border with concave corners */}
        {/* Straight edges */}
        <div className={`absolute top-6 left-16 right-16 h-px bg-gradient-to-r ${themeConfig.edgeHFrom} ${themeConfig.edgeHVia} ${themeConfig.edgeHTo}`} />
        <div className={`absolute bottom-6 left-16 right-16 h-px bg-gradient-to-r ${themeConfig.edgeHFrom} ${themeConfig.edgeHVia} ${themeConfig.edgeHTo}`} />
        <div className={`absolute left-6 top-16 bottom-16 w-px bg-gradient-to-b ${themeConfig.edgeVFrom} ${themeConfig.edgeVVia} ${themeConfig.edgeVTo}`} />
        <div className={`absolute right-6 top-16 bottom-16 w-px bg-gradient-to-b ${themeConfig.edgeVFrom2} ${themeConfig.edgeVVia2} ${themeConfig.edgeVTo2}`} />

        {/* Concave corners */}
        <div className={`absolute top-6 left-6 w-10 h-10 border-b border-r ${themeConfig.cornerTL} rounded-br-[100%]`} />
        <div className={`absolute top-6 right-6 w-10 h-10 border-b border-l ${themeConfig.cornerTR} rounded-bl-[100%]`} />
        <div className={`absolute bottom-6 left-6 w-10 h-10 border-t border-r ${themeConfig.cornerBL} rounded-tr-[100%]`} />
        <div className={`absolute bottom-6 right-6 w-10 h-10 border-t border-l ${themeConfig.cornerBR} rounded-tl-[100%]`} />
      </>

      <div className={`relative z-20 flex flex-col items-center text-center w-full h-full justify-center mt-2 mb-2`}>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-wide mb-1 drop-shadow-md uppercase">
          {title}
        </h1>
        <p className={`text-[10px] md:text-xs tracking-widest mb-6 font-light ${themeConfig.textSecondary}`}>
          Official RWA Record . <span className={themeConfig.textMain}>Bizmarket Protocol</span>
        </p>

        <p className={`text-[10px] md:text-xs mb-3 font-light ${themeConfig.textSecondary}`}>
          This certifies that the wallet address
        </p>
        <div className={`px-10 py-2 rounded-full font-mono text-sm tracking-widest mb-4 border shadow-inner ${themeConfig.walletInputClasses}`}>
          {wallet || '7xKzQ2mJ9v1Fz3gYbWq8rTnL5sH9dP3mQeR7cJ3mPq'}
        </div>
        <p className={`text-[10px] md:text-xs mb-5 font-light ${themeConfig.textSecondary}`}>
          is the registered holder of
        </p>

        <div className={`w-64 mx-auto h-px bg-gradient-to-r from-transparent ${themeConfig.divider} to-transparent mb-6`}></div>

        {/* Central Information Block */}
        <div className={`w-full max-w-3xl py-8 px-10 rounded-xl mb-6 ${themeConfig.innerContainerClasses}`}>
          
          <div className={`absolute inset-0 rounded-xl border border-transparent bg-gradient-to-br ${themeConfig.borderFrom} via-transparent to-transparent [mask-composite:exclude]`} style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', padding: '1px' }} />

          <p className={`text-base md:text-lg mb-2 tracking-widest ${themeConfig.textFaded} font-light`}>
            - {units} Unit{units !== 1 ? 's' : ''} -
          </p>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-md ${themeConfig.textMain}`}>
            {centralTitle}
          </h2>
          <p className={`text-base md:text-lg ${themeConfig.textMuted} font-light mb-6`}>
            Investment Value: <span className={`font-bold ${themeConfig.textPrimary}`}>${investmentAmount.toFixed(2)}</span>
          </p>

          <div className={`w-3/4 mx-auto h-px bg-gradient-to-r from-transparent ${themeConfig.innerDivider} to-transparent mb-4`}></div>

          <p className={`text-xs md:text-sm font-light ${themeConfig.textFaded}`}>
            {highlightText}
          </p>

          {/* Certificate Stamp / Seal Mock */}
          <div className={`absolute -right-16 top-1/2 -translate-y-1/2 w-36 h-36 flex items-center justify-center filter ${themeConfig.dropShadow}`}>
             <svg viewBox="0 0 100 100" className={`w-full h-full fill-current drop-shadow-lg ${themeConfig.sealColor}`}>
               <path d="M50 2.5 L56 12 L66.5 9 L69 19.5 L80 20 L79 31 L88 35.5 L83 45 L90 53 L83 60 L85 70.5 L75 73.5 L73 84 L62.5 83 L57 92 L47 88.5 L38.5 96 L31.5 88.5 L21 91.5 L20 81 L9 78.5 L12 68 L3.5 61 L9 52 L3 42.5 L12 37 L11.5 26.5 L22 24.5 L25 14 L35.5 16 L42 7 Z" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
               <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${themeConfig.sealOuterBg}`}>
                 <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-inner border border-black/10 ${themeConfig.sealInnerBg}`}>
                   <svg className={`w-7 h-7 ${themeConfig.sealIconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <p className={`text-[10px] md:text-xs leading-relaxed max-w-3xl mx-auto mb-10 ${themeConfig.textSecondary}`}>
          {detailedText}
        </p>

        {/* Footer Area */}
        <div className="w-full max-w-4xl flex justify-between items-end px-4 mt-auto">
          <div className="text-left w-1/3">
            <p className={`text-xs font-bold mb-1 ${themeConfig.textMain}`}>Certificate No.</p>
            <p className="font-mono text-sm md:text-base font-bold">{certNo}</p>
          </div>
          
          <div className="flex flex-col items-center w-1/3 pb-1">
             <div className="flex items-center justify-center mb-1 w-32 md:w-40">
               <Image 
                 src="/bizmarket.png" 
                 alt="BizMarket" 
                 width={200} 
                 height={60} 
                 className="w-full h-auto object-contain"
                 style={{ filter: 'brightness(1.1)' }}
               />
             </div>
             <p className={`text-[10px] uppercase tracking-widest font-semibold ${themeConfig.textSecondary}`}>Authorized Issuer</p>
          </div>

          <div className="text-right w-1/3">
            <p className={`text-xs font-bold mb-1 ${themeConfig.textMain}`}>Issue Date</p>
            <p className="font-mono text-sm md:text-base font-bold">{dateStr}</p>
          </div>
        </div>

        <p className={`text-xs mt-12 mb-4 font-bold ${isBizYield ? 'text-[#81D7B4]' : isBizCredit ? 'text-green-100' : 'text-[#3E5549]'}`}>
          Verify on Solana Explorer -&gt;
        </p>

      </div>
    </div>
  );
}
