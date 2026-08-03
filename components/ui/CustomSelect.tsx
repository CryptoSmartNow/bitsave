'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock ArrowDownIcon so we don't need huge icon libraries in the generic component
const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; icon?: React.ReactNode }[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-black/40 hover:border-[#81D7B4] focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-[#81D7B4]/10 transition-all text-sm font-bold shadow-sm outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && <div className="flex-shrink-0">{selectedOption.icon}</div>}
          <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 font-medium'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ArrowDownIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto p-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 text-sm font-bold rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-[#81D7B4]/20 text-[#2D5A4A] dark:text-[#81D7B4]'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon && <div className="flex-shrink-0">{option.icon}</div>}
                      <span>{option.label}</span>
                    </div>
                    {isSelected && <CheckIcon className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
