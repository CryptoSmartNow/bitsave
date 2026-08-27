'use client';

import {
  File01Icon,
  Download01Icon,
  Activity01Icon,
  Building04Icon,
  Shield01Icon,
  Tick01Icon,
  Calendar01Icon
} from "hugeicons-react";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function BizFiReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (endpoint: string, filename: string, id: string) => {
    setDownloading(id);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to generate export file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: 'businesses_csv',
      title: 'Businesses Registry Report',
      description: 'Comprehensive export of all registered businesses, wallet addresses, tiers, dates, and verification statuses.',
      icon: Building04Icon,
      format: 'CSV Document',
      endpoint: '/api/bizfi/admin/export/businesses',
      filename: `bizfi_businesses_${format(new Date(), 'yyyyMMdd')}.csv`,
      badge: 'Real-time',
      badgeColor: 'emerald'
    },
    {
      id: 'audit_csv',
      title: 'Security Audit Trail',
      description: 'Full chronological audit logs of all administrator actions, status changes, and platform interventions.',
      icon: Activity01Icon,
      format: 'CSV Document',
      endpoint: '/api/bizfi/admin/export/audit',
      filename: `bizfi_audit_logs_${format(new Date(), 'yyyyMMdd')}.csv`,
      badge: 'Security',
      badgeColor: 'amber'
    },
    {
      id: 'analytics_json',
      title: 'Telemetry & Analytics Snapshot',
      description: 'Raw protocol telemetry including tier breakdowns, revenue figures, and historical registration trajectory.',
      icon: Shield01Icon,
      format: 'JSON Dataset',
      endpoint: '/api/bizfi/admin/analytics',
      filename: `bizfi_telemetry_${format(new Date(), 'yyyyMMdd')}.json`,
      badge: 'Telemetry',
      badgeColor: 'purple'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 max-w-[1600px] mx-auto font-sans"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1A2538]/70 border border-[#7B8B9A]/20 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] border border-[#81D7B4]/25">
              <File01Icon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#F9F9FB] tracking-tight">
              Reports & Data Exports
            </h1>
          </div>
          <p className="text-[#9BA8B5] text-xs md:text-sm max-w-xl">
            Export official protocol registries, administrative security trails, and real-time performance datasets.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((rep) => {
          const Icon = rep.icon;
          const isCurrentDownloading = downloading === rep.id;
          return (
            <div
              key={rep.id}
              className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 p-6 shadow-xl flex flex-col justify-between hover:border-[#81D7B4]/40 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/15 border border-[#81D7B4]/25 flex items-center justify-center text-[#81D7B4] group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    rep.badgeColor === 'emerald'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : rep.badgeColor === 'amber'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {rep.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#F9F9FB] group-hover:text-[#81D7B4] transition-colors">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-[#9BA8B5] mt-1.5 leading-relaxed">
                    {rep.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#7B8B9A]/15 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-[#7B8B9A]">
                  {rep.format}
                </span>

                <button
                  onClick={() => handleDownload(rep.endpoint, rep.filename, rep.id)}
                  disabled={Boolean(downloading)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl text-xs font-black transition-all shadow-md shadow-[#81D7B4]/20 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isCurrentDownloading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#0F1825] border-t-transparent animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download01Icon className="w-4 h-4" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compliance & Export Notice */}
      <div className="bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] shrink-0 mt-0.5">
          <Shield01Icon className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#F9F9FB] uppercase tracking-wider">Protocol Data Integrity Notice</h4>
          <p className="text-xs text-[#9BA8B5] leading-relaxed">
            All generated reports reflect authoritative cryptographic state stored on MongoDB & smart contract registries. Exports contain administrative audit trails compliant with protocol transparency standards.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
