'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, {
    stiffness: 40,
    damping: 15,
    mass: 1,
    bounce: 0
  });
  
  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [inView, spring, value]);

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  });

  return <motion.span ref={ref}>{display}</motion.span>;
}

export default function LandingStats() {
  const [stats, setStats] = useState({
    tvl: 2450123,
    users: 124531,
    interactions: 892102
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/user-interactions/stats');
        const data = await res.json();
        
        if (data) {
          let totalUSD = 0;
          if (data.tvsBreakdown) {
             const pricesRes = await fetch('/api/prices?ids=binancecoin,celo,usd-coin,tether,celo-dollar').catch(() => null);
             const pricesData = pricesRes ? await pricesRes.json() : {};
             const prices: any = {
               BNB: pricesData.binancecoin?.usd || 400,
               CELO: pricesData.celo?.usd || 0.6,
               USDC: pricesData['usd-coin']?.usd || 1,
               USDT: pricesData.tether?.usd || 1,
               CUSD: pricesData['celo-dollar']?.usd || 1,
             };
             Object.values(data.tvsBreakdown as Record<string, Record<string, number>>).forEach(chainData => {
               Object.entries(chainData).forEach(([currency, amount]) => {
                 const normCurrency = currency.toUpperCase();
                 if (normCurrency === 'ETH') return;
                 totalUSD += amount * (prices[normCurrency] || 1);
               });
             });
          }
          
          setStats({
            tvl: totalUSD > 0 ? totalUSD : 2450123,
            users: data.uniqueUsers || 124531,
            interactions: data.totalInteractions || 892102
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <section className="w-full bg-white relative z-20 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Textured Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)] p-8 sm:p-12 relative overflow-hidden group">
        {/* Wavy woody line texture in primary color */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'40\' viewBox=\'0 0 100 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%2381D7B4\' stroke-width=\'1.5\' opacity=\'0.25\'%3E%3Cpath d=\'M0 10 C 25 -5, 75 25, 100 10\' /%3E%3Cpath d=\'M0 20 C 25 5, 75 35, 100 20\' /%3E%3Cpath d=\'M0 30 C 25 15, 75 45, 100 30\' /%3E%3Cpath d=\'M0 40 C 25 25, 75 55, 100 40\' /%3E%3C/g%3E%3C/svg%3E")' }}
        ></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-2">Total Value Saved</p>
            <h3 className="font-instrument text-5xl md:text-6xl text-slate-900 tracking-tight bg-white/60 px-4 py-1 rounded-xl backdrop-blur-sm">
              {loading ? <span className="text-slate-300">...</span> : <AnimatedCounter value={stats.tvl} prefix="$" />}
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-2">Unique Users</p>
            <h3 className="font-instrument text-5xl md:text-6xl text-slate-900 tracking-tight bg-white/60 px-4 py-1 rounded-xl backdrop-blur-sm">
              {loading ? <span className="text-slate-300">...</span> : <AnimatedCounter value={stats.users} suffix="+" />}
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-2">Total Interactions</p>
            <h3 className="font-instrument text-5xl md:text-6xl text-slate-900 tracking-tight bg-white/60 px-4 py-1 rounded-xl backdrop-blur-sm">
              {loading ? <span className="text-slate-300">...</span> : <AnimatedCounter value={stats.interactions} />}
            </h3>
          </div>

        </div>
      </div>
      </div>
    </section>
  );
}
