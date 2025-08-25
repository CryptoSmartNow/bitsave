'use client'

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { Space_Grotesk } from 'next/font/google';

// Initialize the Space Grotesk font
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
})

export default function CustomDatePicker({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/30 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <button 
          onClick={prevMonth} 
          className="p-2 sm:p-2.5 bg-white/40 hover:bg-white/60 rounded-full transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="text-base sm:text-xl font-bold text-gray-800 bg-gradient-to-r from-[#81D7B4] to-blue-400 bg-clip-text text-transparent px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button 
          onClick={nextMonth} 
          className="p-2 sm:p-2.5 bg-white/40 hover:bg-white/60 rounded-full transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    )
  }

  const renderDays = () => {
    const dateFormat = 'EEE'
    const days = []
    const startDate = startOfWeek(currentMonth)

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2 sm:py-3">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      )
    }

    return <div className="grid grid-cols-7 gap-1 px-1 sm:px-2">{days}</div>
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
          <div
            key={day.toString()}
            className={`relative group`}
          >
            <div 
              onClick={() => isSelectable && onSelectDate(cloneDay)}
              className={`
                flex items-center justify-center h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 mx-auto rounded-lg sm:rounded-xl
                transition-all duration-300 ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'}
                ${!isCurrentMonth 
                  ? 'text-gray-300 hover:bg-gray-50/50' 
                  : isToday
                    ? 'bg-[#81D7B4]/20 text-[#81D7B4] font-bold shadow-[0_2px_8px_rgba(129,215,180,0.15)]'
                  : isPastDate
                    ? 'text-gray-300 bg-gray-100/30'
                  : isTooSoon
                    ? 'text-gray-400 bg-gray-100/50'
                  : isSelected
                    ? 'bg-gradient-to-br from-[#81D7B4] to-[#81D7B4]/80 text-white shadow-[0_4px_10px_rgba(129,215,180,0.4)]'
                    : 'text-gray-700 bg-white/40 hover:bg-white/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] font-medium'
                }
              `}
            >
              <span className={`text-xs sm:text-sm md:text-base ${isSelected ? 'animate-pulse-once' : ''}`}>
                {format(day, 'd')}
              </span>
              
              {/* Enhanced hover effect for selectable dates */}
              {isCurrentMonth && !isSelected && isSelectable && (
                <div className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 bg-white/60 border border-[#81D7B4]/20 shadow-[0_2px_8px_rgba(129,215,180,0.15)] transition-all duration-300"></div>
              )}
            </div>
            
            {/* Add indicator for minimum selectable date */}
            {isCurrentMonth && isSameDay(day, minSelectableDate) && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#81D7B4] rounded-full"></div>
            )}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1 mb-1 sm:mb-2">
          {days}
        </div>
      )
      days = []
    }

    return <div className="mt-2 sm:mt-3 px-1 sm:px-2">{rows}</div>
  }

  return (
    <div className={`${spaceGrotesk.className} bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] sm:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] overflow-hidden relative w-full max-w-full`}>
      {/* Glassmorphism background effects */}
      <div className="absolute -top-20 -right-20 w-32 sm:w-40 h-32 sm:h-40 bg-[#81D7B4]/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-32 sm:w-40 h-32 sm:h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-md z-0"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {renderHeader()}
        <div className="p-2 sm:p-4 md:p-5">
          {renderDays()}
          {renderCells()}
        </div>
      </div>
    </div>
  )
}