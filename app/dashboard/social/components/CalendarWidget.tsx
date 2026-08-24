'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar01Icon, Location01Icon, Time01Icon, ArrowRight01Icon } from 'hugeicons-react';

interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  type?: string;
  url?: string;
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();
  const monthName = now.toLocaleString('default', { month: 'short' });

  // Compute first day of month and total days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dates: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) dates.push(null);
  for (let d = 1; d <= totalDays; d++) dates.push(d);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (e) {
        console.error('Failed to fetch events', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events occurring in the active month
  const activeMonthEvents = events.map(evt => {
    const d = new Date(evt.date);
    const isValid = !isNaN(d.getTime());
    const isThisMonth = isValid && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    return {
      ...evt,
      parsedDate: isValid ? d : null,
      dayOfMonth: isThisMonth ? d.getDate() : null
    };
  });

  const eventsThisMonth = activeMonthEvents.filter(e => e.dayOfMonth !== null);

  return (
    <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4]">
              <Calendar01Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white font-instrument">
                Community Events
              </h3>
              <p className="text-[11px] text-gray-400">{monthName} {currentYear} • Official Schedule</p>
            </div>
          </div>
        </div>

        {/* Mini Calendar Matrix */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center mb-6">
          {days.map(d => (
            <div key={d} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{d}</div>
          ))}
          {dates.map((d, i) => {
            const hasEvent = d ? eventsThisMonth.some(e => e.dayOfMonth === d) : false;
            const isToday = d === todayDate;

            return (
              <div key={i} className="flex items-center justify-center py-0.5">
                {d ? (
                  <div className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-bold transition-all relative
                    ${isToday ? 'bg-[#81D7B4] text-white shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}
                    ${hasEvent && !isToday ? 'border-2 border-[#81D7B4] text-[#81D7B4] font-black' : ''}
                  `}>
                    {d}
                    {hasEvent && !isToday && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#81D7B4] ring-2 ring-white dark:ring-[#161616]"></span>
                    )}
                  </div>
                ) : (
                  <div className="w-7 h-7"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Real Events List from Database */}
        {isLoading ? (
          <div className="space-y-2.5">
            <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Upcoming Scheduled Events
            </span>
            {events.slice(0, 3).map((evt, i) => {
              const d = new Date(evt.date);
              const formattedDay = !isNaN(d.getTime()) ? d.getDate() : '01';
              const formattedMonth = !isNaN(d.getTime()) ? d.toLocaleString('default', { month: 'short' }) : 'Event';

              return (
                <motion.div
                  key={evt.id || i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                >
                  <div className="w-10 h-10 shrink-0 flex flex-col items-center justify-center bg-white dark:bg-[#121212] rounded-xl border border-gray-200/50 dark:border-white/10">
                    <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                      {formattedMonth}
                    </span>
                    <span className="text-sm font-black text-[#81D7B4] leading-tight">
                      {formattedDay}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 leading-snug truncate">
                      {evt.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {evt.time || '12:00 PM UTC'}
                      </span>
                      {evt.location && (
                        <span className="text-[9px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-1.5 py-0.2 rounded-md truncate max-w-[100px]">
                          {evt.location}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
            <Calendar01Icon className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-0.5">No Events Scheduled</p>
            <p className="text-[11px] text-gray-400">Official AMAs, townhalls, and community events will appear here once scheduled by admins.</p>
          </div>
        )}
      </div>
    </div>
  );
}
