'use client';

import React, { useState, useMemo } from 'react';
import { CalculatorIcon } from "hugeicons-react";

const INSTRUMENTS = [
  { id: 'BizYield', name: 'BizYield', apr: 0, isVariable: true, type: 'Rev Share', color: '#FF6B6B', initials: 'BY' },
  { id: 'BizCredit', name: 'BizCredit', apr: 16, isVariable: false, type: 'Private Credit', color: '#3B82F6', initials: 'BC' },
  { id: 'BizBond', name: 'BizBond', apr: 10, isVariable: false, type: 'Treasury', color: '#81D7B4', initials: 'BB' },
];

const InstrumentIcon = ({ initials, color, size = 24 }: { initials: string; color: string; size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size} style={{ color }}>
    <path d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
    <text x="12" y="13.5" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
      {initials}
    </text>
  </svg>
);

export default function CalculatorPage() {
  const [amount, setAmount] = useState<string>('1000');
  const [instrumentId, setInstrumentId] = useState<string>('BizCredit');
  const [years, setYears] = useState<number>(3);

  const selectedInstrument = INSTRUMENTS.find(i => i.id === instrumentId)!;
  
  const parsedAmount = parseFloat(amount) || 0;

  const projections = useMemo(() => {
    const data = [];
    let currentBalance = parsedAmount;
    const rate = selectedInstrument.apr / 100;
    
    for (let i = 1; i <= years; i++) {
      const yieldEarned = currentBalance * rate;
      currentBalance += yieldEarned; // Compounding annually for demo purposes
      data.push({
        year: i,
        yield: yieldEarned,
        totalBalance: currentBalance
      });
    }
    return data;
  }, [parsedAmount, selectedInstrument, years]);

  const totalYield = projections.length > 0 ? projections[projections.length - 1].totalBalance - parsedAmount : 0;
  const finalBalance = parsedAmount + totalYield;

  return (
    <div className="w-full pb-24 relative flex justify-center p-4 sm:p-6 md:p-8">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-[#81D7B4]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3 z-0"></div>

      <div className="w-full max-w-[1200px] space-y-8 min-w-0 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1C2538] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-full mb-4 shadow-[0_0_15px_rgba(129,215,180,0.15)]">
              <CalculatorIcon className="w-4 h-4 text-[#81D7B4]" />
              <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest">Projections</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight">Yield Calculator</h1>
            <p className="text-base text-[#7B8B9A] mt-2 max-w-md">Forecast your potential compound returns across different BizMarket real-world assets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* INPUT FORM (LEFT) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden group">
            
            <div className="absolute inset-0 bg-gradient-to-tr from-[#81D7B4]/0 via-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10">
              <label className="block text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mb-3 sm:mb-4">Select Instrument</label>
              <div className="grid grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-3">
                {INSTRUMENTS.map(inst => {
                  const isSelected = instrumentId === inst.id;
                  return (
                    <button
                      key={inst.id}
                      onClick={() => setInstrumentId(inst.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                        isSelected 
                          ? 'border-[#81D7B4]/50 shadow-[0_0_20px_rgba(129,215,180,0.15)] scale-[1.02] sm:scale-[1.05]' 
                          : 'bg-[#0A0F17] border-[#1C2538] hover:border-[#2C3E5D] hover:scale-[1.02] shadow-sm'
                      }`}
                      style={isSelected ? { backgroundColor: `${inst.color}15`, borderColor: `${inst.color}60` } : {}}
                    >
                      <InstrumentIcon initials={inst.initials} color={isSelected ? inst.color : '#4B5A75'} size={24} />
                      <span className={`text-[9px] sm:text-xs font-black tracking-wide ${isSelected ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'}`}>{inst.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10">
              <label className="block text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mb-3 sm:mb-4">Initial Investment</label>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4] to-[#3B82F6] rounded-2xl blur-md opacity-0 group-hover/input:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center bg-[#0A0F17] border border-[#1C2538] rounded-2xl overflow-hidden focus-within:border-[#81D7B4]/50 transition-colors shadow-inner">
                  <span className="pl-4 sm:pl-6 text-[#7B8B9A] font-black text-lg sm:text-xl">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent py-4 sm:py-5 pl-2 sm:pl-3 pr-4 sm:pr-6 text-[#F9F9FB] font-black text-xl sm:text-2xl outline-none placeholder:text-[#4B5A75] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                    placeholder="1000"
                  />
                  <span className="pr-4 sm:pr-6 text-[9px] sm:text-[10px] font-bold text-[#4B5A75] uppercase tracking-widest">USDC</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <label className="block text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mb-3 sm:mb-4">Time Horizon</label>
              <div className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 bg-[#0A0F17] border border-[#1C2538] rounded-xl sm:rounded-2xl shadow-inner">
                {[1, 3, 5].map(y => (
                  <button
                    key={y}
                    onClick={() => setYears(y)}
                    className={`flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all duration-300 ${
                      years === y 
                        ? 'bg-[#1C2538] text-[#F9F9FB] shadow-md scale-[1.02]' 
                        : 'text-[#4B5A75] hover:text-[#7B8B9A] hover:bg-[#121A27]'
                    }`}
                  >
                    {y} {y === 1 ? 'Year' : 'Years'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#1C2538] relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-[#0A0F17] p-4 rounded-xl border border-[#1C2538]">
                <span className="text-xs font-bold text-[#7B8B9A] uppercase tracking-widest">Selected APR</span>
                <span className="text-xl font-black text-[#81D7B4] drop-shadow-[0_0_10px_rgba(129,215,180,0.3)]">
                  {selectedInstrument.isVariable ? 'Variable' : `${selectedInstrument.apr}%`}
                </span>
              </div>
              <p className="text-[10px] text-[#4B5A75] leading-relaxed uppercase tracking-wide font-bold">
                * Projections assume full compounding reinvestment. Actual returns may vary.
              </p>
            </div>

          </div>

          {/* PROJECTIONS (RIGHT) */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-[#81D7B4]/5 blur-[30px] sm:blur-[40px] group-hover:bg-[#81D7B4]/15 transition-all duration-700"></div>
                <div className="relative z-10">
                  <p className="text-[9px] sm:text-[10px] font-bold text-[#7B8B9A] uppercase tracking-widest mb-2 sm:mb-3">Total Yield Earned</p>
                  <p className="text-3xl sm:text-5xl font-black text-[#81D7B4] tracking-tight drop-shadow-[0_0_15px_rgba(129,215,180,0.2)]">
                    {selectedInstrument.isVariable ? 'VAR' : `+$${totalYield.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1A2538] to-[#121A27] border border-[#2C3E5D] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-[#3B82F6]/5 blur-[30px] sm:blur-[40px] group-hover:bg-[#3B82F6]/15 transition-all duration-700"></div>
                <div className="relative z-10">
                  <p className="text-[9px] sm:text-[10px] font-bold text-[#B8C5D6] uppercase tracking-widest mb-2 sm:mb-3">Projected Balance</p>
                  <p className="text-3xl sm:text-5xl font-black text-[#F9F9FB] tracking-tight">
                    {selectedInstrument.isVariable ? 'VAR' : `$${finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0F17]/80 backdrop-blur-xl border border-[#1C2538] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-5 sm:p-8 border-b border-[#1C2538] bg-[#121A27]">
                <h3 className="font-black text-xs sm:text-sm tracking-widest uppercase text-[#F9F9FB] flex items-center gap-3">
                  <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#81D7B4] shadow-[0_0_10px_rgba(129,215,180,0.8)]"></span>
                  Yearly Breakdown
                </h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[9px] sm:text-[10px] font-black text-[#4B5A75] uppercase tracking-widest">Timeline</th>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[9px] sm:text-[10px] font-black text-[#4B5A75] uppercase tracking-widest text-right">Start Balance</th>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[9px] sm:text-[10px] font-black text-[#4B5A75] uppercase tracking-widest text-right">Yield Earned</th>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[9px] sm:text-[10px] font-black text-[#4B5A75] uppercase tracking-widest text-right">End Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2538]">
                    {selectedInstrument.isVariable ? (
                      <tr>
                        <td colSpan={4} className="px-6 sm:px-8 py-16 text-center">
                          <p className="text-[#F9F9FB] font-bold text-lg mb-2">Variable APR</p>
                          <p className="text-[#7B8B9A] text-sm">Returns depend entirely on monthly business revenue.</p>
                        </td>
                      </tr>
                    ) : projections.map((p) => {
                      const startBalance = p.totalBalance - p.yield;
                      return (
                        <tr key={p.year} className="hover:bg-[#121A27] transition-colors group">
                          <td className="px-4 sm:px-8 py-4 sm:py-6 font-black text-[#F9F9FB] text-xs sm:text-sm">Year {p.year}</td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6 text-right font-bold text-[#7B8B9A] group-hover:text-[#F9F9FB] transition-colors text-xs sm:text-sm">
                            ${startBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6 text-right font-black text-[#81D7B4] text-xs sm:text-sm">
                            +${p.yield.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="px-4 sm:px-8 py-4 sm:py-6 text-right font-black text-[#F9F9FB] bg-[#121A27]/50 text-xs sm:text-sm">
                            ${p.totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
