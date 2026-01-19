'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
  downloadUrl?: string;
}

export default function BizFiReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/bizfi/admin/reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.reports);
    } catch (err) {
      console.error(err);
      setError('Could not load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#81D7B4] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-2xl text-red-200 flex items-center gap-3">
        <AlertCircle className="w-6 h-6" />
        {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#F9F9FB]">Reports</h1>
        <p className="text-[#9BA8B5] text-sm md:text-base">Generated system reports and archives</p>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-[#1A2538]/50 backdrop-blur-sm p-4 rounded-xl border border-[#7B8B9A]/10 flex items-center justify-between gap-4 hover:border-[#81D7B4]/30 transition-all group">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-[#F9F9FB] truncate">{report.name}</h3>
                <p className="text-sm text-[#9BA8B5] truncate">{report.date} • {report.size}</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(report.downloadUrl)}
              className="p-2 text-[#9BA8B5] hover:text-[#81D7B4] hover:bg-[#81D7B4]/10 rounded-lg transition-colors shrink-0"
              title="Download Report"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
