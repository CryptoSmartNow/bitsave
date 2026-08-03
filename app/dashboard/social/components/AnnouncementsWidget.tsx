'use client';

import { motion } from 'framer-motion';
import { Notification01Icon, SparklesIcon, Calendar01Icon, Rocket01Icon } from 'hugeicons-react';

const ANNOUNCEMENTS = [
  {
    id: 1,
    type: 'Feature',
    title: 'Your Savings, Wrapped is here!',
    date: 'August 1, 2026',
    icon: SparklesIcon,
    color: 'text-[#81D7B4]',
    bg: 'bg-[#1A2E26]'
  },
  {
    id: 2,
    type: 'Update',
    title: 'Yield rates increased for USDC Vaults',
    date: 'July 28, 2026',
    icon: Rocket01Icon,
    color: 'text-[#81D7B4]',
    bg: 'bg-[#1A2E26]'
  },
  {
    id: 3,
    type: 'Event',
    title: 'Community Townhall on X Spaces',
    date: 'July 25, 2026',
    icon: Calendar01Icon,
    color: 'text-[#81D7B4]',
    bg: 'bg-[#1A2E26]'
  }
];

export default function AnnouncementsWidget() {
  return (
    <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-7 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
          <Notification01Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Announcements</h3>
      </div>

      <div className="space-y-6 flex-1">
        {ANNOUNCEMENTS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer flex gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${item.bg} ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${item.color}`}>
                    {item.type}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {item.date}
                  </span>
                </div>
                <p className="text-base font-bold text-gray-800 dark:text-gray-200 leading-snug group-hover:text-[#81D7B4] dark:group-hover:text-[#81D7B4] transition-colors">
                  {item.title}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <button className="mt-8 w-full py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
        View All Updates
      </button>
    </div>
  );
}
