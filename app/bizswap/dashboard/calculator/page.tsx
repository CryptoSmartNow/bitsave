'use client';

import React, { useState, useMemo } from 'react';
import { Activity01Icon, BarChartIcon, Dollar01Icon, Shield01Icon } from "hugeicons-react";

const INSTRUMENTS = [
  { id: 'BizYield', name: 'BizYield', apr: 0, isVariable: true, type: 'Rev Share', icon: BarChartIcon, color: '#FF6B6B' },
  { id: 'BizCredit', name: 'BizCredit', apr: 16, isVariable: false, type: 'Private Credit', icon: Dollar01Icon, color: '#3B82F6' },
  { id: 'BizBond', name: 'BizBond', apr: 10, isVariable: false, type: 'Treasury', icon: Shield01Icon, color: '#81D7B4' },
];

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
    <div className="p-4 md:p-8 w-full max-w-[1200px] mx-auto space-y-6 md:space-y-8 min-w-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1C2538] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[#F9F9FB]">Yield Calculator</h1>
          <p className="text-sm text-[#7B8B9A] mt-1">Project your potential returns across different BizMarket instruments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT FORM (LEFT) */}
        <div className="lg:col-span-5 space-y-6 bg-[#121A27] border border-[#1C2538] rounded-3xl p-6 md:p-8">
          
          <div>
            <label className="block text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-3">Select Instrument</label>
            <div className="grid grid-cols-3 gap-3">
              {INSTRUMENTS.map(inst => {
                const Icon = inst.icon;
                const isSelected = instrumentId === inst.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => setInstrumentId(inst.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      isSelected 
                        ? `bg-[${inst.color}]/10 border-[${inst.color}] shadow-[0_0_15px_rgba(0,0,0,0.1)] shadow-[${inst.color}]/20` 
                        : 'bg-[#0A0F17] border-[#1C2538] hover:border-[#2C3E5D]'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? `text-[${inst.color}]` : 'text-[#7B8B9A]'}`} style={{ color: isSelected ? inst.color : undefined }} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'}`}>{inst.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-3">Investment Amount (USDC)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B8B9A] font-bold">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0A0F17] border border-[#1C2538] rounded-xl py-4 pl-8 pr-4 text-[#F9F9FB] font-black text-xl outline-none focus:border-[#81D7B4] transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                placeholder="1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-3">Time Horizon</label>
            <div className="flex items-center gap-4 bg-[#0A0F17] border border-[#1C2538] rounded-xl p-2">
              {[1, 3, 5].map(y => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    years === y 
                      ? 'bg-[#1C2538] text-[#F9F9FB]' 
                      : 'text-[#7B8B9A] hover:text-[#F9F9FB]'
                  }`}
                >
                  {y} {y === 1 ? 'Year' : 'Years'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#1C2538]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#7B8B9A]">Selected APR</span>
              <span className="text-lg font-black text-[#81D7B4]">{selectedInstrument.isVariable ? 'Variable' : `${selectedInstrument.apr}%`}</span>
            </div>
            <p className="text-xs text-[#4B5A75] leading-relaxed">
              * Yield projections assume full reinvestment of distributions (compounding annually). Actual returns may vary based on pool performance.
            </p>
          </div>

        </div>

        {/* PROJECTIONS (RIGHT) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A2538] border border-[#2C3E5D] rounded-3xl p-6">
              <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Total Yield Earned</p>
              <p className="text-3xl font-black text-[#81D7B4]">{selectedInstrument.isVariable ? 'Variable' : `+$${totalYield.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
            </div>
            <div className="bg-[#1A2538] border border-[#2C3E5D] rounded-3xl p-6">
              <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Final Balance</p>
              <p className="text-3xl font-black text-[#F9F9FB]">{selectedInstrument.isVariable ? 'Variable' : `$${finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
            </div>
          </div>

          <div className="bg-[#121A27] border border-[#1C2538] rounded-3xl overflow-hidden min-w-0">
            <div className="p-6 border-b border-[#1C2538]">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">Yearly Breakdown</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0A0F17]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Year</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest text-right">Starting Balance</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest text-right">Yield Earned</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest text-right">End Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2538]">
                  {selectedInstrument.isVariable ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[#7B8B9A] font-medium">
                        Variable APR depends on monthly business revenue.
                      </td>
                    </tr>
                  ) : projections.map((p) => {
                    const startBalance = p.totalBalance - p.yield;
                    return (
                      <tr key={p.year} className="hover:bg-[#1C2538]/30 transition-colors">
                        <td className="px-6 py-5 font-bold text-[#F9F9FB]">Year {p.year}</td>
                        <td className="px-6 py-5 text-right text-[#7B8B9A]">
                          ${startBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-5 text-right font-black text-[#81D7B4]">
                          +${p.yield.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-5 text-right font-black text-[#F9F9FB]">
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
  );
}
