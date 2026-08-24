'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Notification01Icon, SparklesIcon, Rocket01Icon, ArrowRight01Icon } from 'hugeicons-react';
import Link from 'next/link';

interface UpdateItem {
  id: string;
  title: string;
  content: string;
  date: string;
  isNew?: boolean;
}

export default function AnnouncementsWidget() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch('/api/updates');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setUpdates(data.slice(0, 3));
          }
        }
      } catch (e) {
        console.error('Failed to fetch announcements', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4]">
            <Notification01Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white font-instrument">
              Announcements
            </h3>
            <p className="text-[11px] text-gray-400">Official protocol releases & updates</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-gray-400 font-medium">No new announcements at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group flex items-start gap-3 p-3 rounded-2xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#81D7B4]/40 transition-all"
              >
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-[#81D7B4]/15 text-[#81D7B4]">
                  {i === 0 ? <SparklesIcon className="w-4 h-4" /> : <Rocket01Icon className="w-4 h-4" />}
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#81D7B4]">
                      Update
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug group-hover:text-[#81D7B4] transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {item.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <Link 
        href="/dashboard/forum"
        className="mt-6 w-full py-2.5 rounded-2xl border border-gray-200/70 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all text-center flex items-center justify-center gap-1"
      >
        <span>Community Discussions</span>
        <ArrowRight01Icon className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
