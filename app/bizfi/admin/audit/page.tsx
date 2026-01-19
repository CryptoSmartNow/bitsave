'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Log {
  _id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
}

export default function BizFiAuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/bizfi/admin/audit');
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setLogs(data.logs);
    } catch (err) {
      console.error(err);
      setError('Could not load audit logs');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl md:text-3xl font-bold text-[#F9F9FB]">Audit Logs</h1>
        <p className="text-[#9BA8B5] text-sm md:text-base">System activity and security trail</p>
      </div>

      <div className="bg-[#1A2538]/50 backdrop-blur-sm rounded-2xl border border-[#7B8B9A]/10 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-[#9BA8B5]">
            No audit logs found.
          </div>
        ) : (
          <div className="divide-y divide-[#7B8B9A]/10">
            {logs.map((log) => (
              <div key={log._id} className="p-4 flex items-start gap-4 hover:bg-[#0F1825]/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#1A2538] border border-[#7B8B9A]/20 flex items-center justify-center text-[#9BA8B5] shrink-0 mt-1">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1.5">
                    <h4 className="font-bold text-[#F9F9FB] text-base truncate">{log.action}</h4>
                    <span className="text-[10px] md:text-xs font-medium text-[#7B8B9A] bg-[#0F1825] px-2 py-0.5 rounded-full border border-[#7B8B9A]/10 flex items-center gap-1 w-fit">
                      <Clock className="w-3 h-3" />
                      {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : '-'}
                    </span>
                  </div>
                  <p className="text-sm text-[#9BA8B5] break-words">
                    <span className="text-[#81D7B4] font-medium">{log.user}</span> - {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
