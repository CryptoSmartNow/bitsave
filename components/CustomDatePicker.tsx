'use client'

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { Exo } from 'next/font/google';
import { motion } from 'framer-motion';

// Initialize the Space Grotesk font
const exo = Exo({ 
  subsets: ['latin'],
  display: 'swap',
})

export default function CustomDatePicker({
  selectedDate,
  onSelectDate,
  navigateToDate,
}: {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  navigateToDate?: Date | null
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Update current month when navigateToDate prop changes
  useEffect(() => {
    if (navigateToDate) {
      setCurrentMonth(startOfMonth(navigateToDate))
    }
  }, [navigateToDate])

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4 bg-gradient-to-r from-[#81D7B4]/5 to-[#6bc5a0]/5">
        <motion.button 
          onClick={prevMonth} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 xs:p-2 sm:p-3 bg-white hover:bg-gray-50 rounded-md xs:rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.button>
        <motion.span 
          className="text-lg sm:text-xl font-black text-gray-800 px-3 sm:px-4 py-1 sm:py-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm text-center min-w-[120px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={currentMonth.getTime()}
        >
          {format(currentMonth, 'MMM yyyy')}
        </motion.span>
        <motion.button 
          onClick={nextMonth} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 xs:p-2 sm:p-3 bg-white hover:bg-gray-50 rounded-md xs:rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    )
  }

  const renderDays = () => {
    const dateFormat = 'EEEEE' // Single letter for mobile, full name for larger screens
    const days = []
    const startDate = startOfWeek(currentMonth)

    for (let i = 0; i < 7; i++) {
      const dayName = format(addDays(startDate, i), dateFormat)
      days.push(
        <motion.div 
          key={i} 
          className="text-center text-xs sm:text-sm font-bold text-gray-400 py-2 sm:py-3 uppercase tracking-widest"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <span className="sm:hidden">{dayName.charAt(0)}</span>
          <span className="hidden sm:block">{dayName.slice(0, 3)}</span>
        </motion.div>
      )
    }

    return <div className="grid grid-cols-7 gap-1 sm:gap-2 px-2 sm:px-4">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const today = new Date()
    
    // Set today to start of day for proper comparison
    today.setHours(0, 0, 0, 0)
    
    // Calculate minimum selectable date (30 days from today)
    const minSelectableDate = new Date(today)
    minSelectableDate.setDate(today.getDate() + 30)

    const rows = []
    let days = []
    let day = startDate
    let weekIndex = 0

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        const isToday = isSameDay(day, new Date())
        const isSelected = selectedDate && isSameDay(day, selectedDate)
        const isCurrentMonth = isSameMonth(day, monthStart)
        const isPastDate = day < today
        const isTooSoon = day >= today && day < minSelectableDate
        const isSelectable = day >= minSelectableDate
        
        days.push(
          <motion.div
            key={day.toString()}
            className={`relative`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: (weekIndex * 7 + i) * 0.02 }}
          >
            <motion.div 
              onClick={() => isSelectable && onSelectDate(cloneDay)}
              whileHover={isSelectable ? { scale: 1.1, y: -2 } : {}}
              whileTap={isSelectable ? { scale: 0.95 } : {}}
              className={`
                flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-xl
                transition-all duration-300 ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'}
                ${!isCurrentMonth 
                  ? 'text-gray-300 hover:bg-gray-50/50' 
                  : isToday
                    ? 'bg-gradient-to-br from-[#81D7B4]/20 to-[#6bc5a0]/20 text-[#81D7B4] font-bold shadow-lg ring-1 ring-[#81D7B4]/50'
                  : isPastDate
                    ? 'text-gray-300 bg-gray-100/30'
                  : isTooSoon
                    ? 'text-gray-400 bg-gray-100/50'
                  : isSelected
                    ? 'bg-gradient-to-br from-[#81D7B4] to-[#6bc5a0] text-white shadow-xl ring-2 ring-[#81D7B4] ring-offset-2'
                    : 'text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md font-medium border border-gray-50'
              }
            `}
          >
            <span className={`text-sm sm:text-base font-bold ${isSelected ? 'drop-shadow-sm' : ''}`}>
              {format(day, 'd')}
            </span>
            </motion.div>
            
            {/* Today indicator */}
            {isCurrentMonth && isToday && !isSelected && (
              <motion.div 
                className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#81D7B4] rounded-full border-2 border-white shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              />
            )}
          </motion.div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
          {days}
        </div>
      )
      days = []
      weekIndex++
    }

    return <div className="mt-2 px-2 sm:px-4">{rows}</div>
  }

  return (
    <motion.div 
      className={`${exo.className} rounded-2xl overflow-hidden relative w-full max-w-full bg-white shadow-xl border border-gray-100 min-w-0`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Content */}
      <div className="relative z-10">
        {renderHeader()}
        <div className="p-4 sm:p-6">
          {renderDays()}
          {renderCells()}
        </div>
        
        {/* Footer with helpful info */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-br from-[#81D7B4] to-[#6bc5a0] rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">Selected</span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#81D7B4]/30 rounded-full border border-[#81D7B4]/50"></div>
              <span className="text-xs sm:text-sm font-medium">Today</span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-200 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">Unavailable</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}