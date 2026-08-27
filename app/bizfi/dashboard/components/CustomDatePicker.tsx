'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar03Icon, ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from 'hugeicons-react';

interface CustomDatePickerProps {
    label?: string;
    required?: boolean;
    value?: string; // Format: YYYY-MM-DD
    onChange: (dateStr: string) => void;
    maxDate?: string;
    minDate?: string;
    placeholder?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({
    label = 'Date of Birth',
    required = false,
    value,
    onChange,
    maxDate = new Date().toISOString().split('T')[0], // Default cannot be future for birthday
    minDate = '1920-01-01',
    placeholder = 'Select date'
}: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial selected date or defaults
    const parsedDate = value ? new Date(value) : null;
    const initialYear = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : 2000;
    const initialMonth = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() : 0;

    const [viewYear, setViewYear] = useState(initialYear);
    const [viewMonth, setViewMonth] = useState(initialMonth);

    // Sync view with external value changes
    useEffect(() => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Generate years array for quick dropdown selection (1920 to current year)
    const currentYear = new Date().getFullYear();
    const yearsList: number[] = [];
    for (let y = currentYear; y >= 1920; y--) {
        yearsList.push(y);
    }

    // Days calculation
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(v => v - 1);
        } else {
            setViewMonth(v => v - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(v => v + 1);
        } else {
            setViewMonth(v => v + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        const formattedMonth = String(viewMonth + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    // Format display string nicely
    const formatDisplay = (val?: string) => {
        if (!val) return '';
        try {
            const parts = val.split('-');
            if (parts.length === 3) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                const d = parseInt(parts[2], 10);
                return `${MONTHS[m]?.slice(0, 3)} ${d}, ${y}`;
            }
        } catch {
            return val;
        }
        return val;
    };

    const selectedParts = value ? value.split('-').map(Number) : null;
    const isSelected = (day: number) => {
        if (!selectedParts || selectedParts.length !== 3) return false;
        return (
            selectedParts[0] === viewYear &&
            selectedParts[1] === viewMonth + 1 &&
            selectedParts[2] === day
        );
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#9BA8B5] mb-1.5">
                    {label} {required && <span className="text-[#81D7B4]">*</span>}
                </label>
            )}

            {/* Input Trigger Field */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3.5 py-2.5 bg-[#0F1825]/70 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isOpen
                        ? 'border-[#81D7B4] ring-1 ring-[#81D7B4]/30'
                        : 'border-[#7B8B9A]/20 hover:border-[#81D7B4]/40'
                }`}
            >
                <div className="flex items-center gap-2">
                    <Calendar03Icon className="w-4 h-4 text-[#81D7B4] shrink-0" />
                    <span className={`text-xs sm:text-sm font-medium ${value ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]/50'}`}>
                        {value ? formatDisplay(value) : placeholder}
                    </span>
                </div>

                {value && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                        }}
                        className="p-1 text-[#7B8B9A] hover:text-[#F9F9FB] rounded-md transition-colors"
                        title="Clear date"
                    >
                        <Cancel01Icon className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Custom Popover Calendar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-[#0F1825] border border-[#7B8B9A]/25 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 p-4 backdrop-blur-xl"
                    >
                        {/* Month & Year Selectors */}
                        <div className="flex items-center justify-between gap-1 mb-3 pb-2.5 border-b border-[#7B8B9A]/15">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1.5 text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#1A2538] rounded-lg transition-colors cursor-pointer"
                            >
                                <ArrowLeft01Icon className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1.5">
                                {/* Month selector */}
                                <select
                                    value={viewMonth}
                                    onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                                    className="bg-[#1A2538] text-[#F9F9FB] text-xs font-bold px-2 py-1 rounded-lg border border-[#7B8B9A]/20 focus:outline-none focus:border-[#81D7B4] cursor-pointer"
                                >
                                    {MONTHS.map((m, idx) => (
                                        <option key={m} value={idx}>
                                            {m}
                                        </option>
                                    ))}
                                </select>

                                {/* Year selector */}
                                <select
                                    value={viewYear}
                                    onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                                    className="bg-[#1A2538] text-[#F9F9FB] text-xs font-bold px-2 py-1 rounded-lg border border-[#7B8B9A]/20 focus:outline-none focus:border-[#81D7B4] cursor-pointer font-mono"
                                >
                                    {yearsList.map(y => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1.5 text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#1A2538] rounded-lg transition-colors cursor-pointer"
                            >
                                <ArrowRight01Icon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Weekday Names Header */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                            {DAYS_OF_WEEK.map((day) => (
                                <div key={day} className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Leading blank slots */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`blank-${i}`} className="h-8 w-8" />
                            ))}

                            {/* Actual day buttons */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const selected = isSelected(day);
                                const currentDayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isFuture = Boolean(maxDate && currentDayStr > maxDate);

                                return (
                                    <button
                                        key={`day-${day}`}
                                        type="button"
                                        disabled={isFuture}
                                        onClick={() => handleSelectDay(day)}
                                        className={`h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                            selected
                                                ? 'bg-[#81D7B4] text-[#0F1825] font-black shadow-[0_0_12px_rgba(129,215,180,0.4)]'
                                                : isFuture
                                                ? 'text-[#7B8B9A]/30 cursor-not-allowed'
                                                : 'text-[#F9F9FB] hover:bg-[#1A2538] hover:text-[#81D7B4]'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer Quick Action */}
                        <div className="mt-3 pt-2.5 border-t border-[#7B8B9A]/15 flex items-center justify-between text-[11px]">
                            <button
                                type="button"
                                onClick={() => {
                                    const y2k = `${viewYear}-01-01`;
                                    onChange(y2k);
                                    setIsOpen(false);
                                }}
                                className="text-[#7B8B9A] hover:text-[#81D7B4] transition-colors"
                            >
                                Jan 1, {viewYear}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-bold text-[#81D7B4] hover:underline"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
