'use client';

import { motion } from 'framer-motion';
import { Calendar01Icon } from 'hugeicons-react';

const EVENTS = [
  {
    id: 1,
    month: 'Aug',
    day: '15',
    title: 'Community AMA',
    time: '2:00 PM EST',
    type: 'Online'
  },
  {
    id: 2,
    month: 'Aug',
    day: '28',
    title: 'Rewards Distribution',
    time: '12:00 PM EST',
    type: 'Distribution'
  }
];

export default function CalendarWidget() {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Minimal representation for August 2026
  // Starts on Saturday
  const dates = [
    null, null, null, null, null, null, 1,
    2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, 29,
    30, 31
  ];

  const events = [
    { date: 15, type: 'ama', color: 'bg-purple-500' },
    { date: 28, type: 'rewards', color: 'bg-[#81D7B4]' }
  ];

  return (
    <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-7 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
            <Calendar01Icon className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Community Calendar</h3>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center mb-6">
        {days.map(d => (
          <div key={d} className="text-[11px] font-bold text-gray-400 dark:text-gray-500">{d}</div>
        ))}
        {dates.map((d, i) => {
          const hasEvent = events.find(e => e.date === d);
          const isToday = d === 1; // Assuming August 1 is "today" for the demo

          return (
            <div key={i} className="flex items-center justify-center">
              {d ? (
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-all cursor-pointer
                  ${isToday ? 'bg-[#81D7B4] text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}
                  ${hasEvent && !isToday ? 'relative border border-gray-200 dark:border-white/10' : ''}
                `}>
                  {d}
                  {hasEvent && !isToday && (
                    <span className={`absolute top-0 right-0 w-2 h-2 rounded-full border border-white dark:border-[#1a1a1a] ${hasEvent.color}`}></span>
                  )}
                </div>
              ) : (
                <div className="w-8 h-8"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-6 flex-1">
        {EVENTS.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer flex gap-4"
          >
            <div className="w-12 shrink-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl py-2 border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{event.month}</span>
              <span className="text-lg font-black text-[#81D7B4] leading-tight">{event.day}</span>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-base font-bold text-gray-800 dark:text-gray-200 leading-snug group-hover:text-[#81D7B4] dark:group-hover:text-[#81D7B4] transition-colors">
                {event.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-medium text-gray-500">
                  {event.time}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span className="text-[11px] font-medium text-[#81D7B4]">
                  {event.type}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
