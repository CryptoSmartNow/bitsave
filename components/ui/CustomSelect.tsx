'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; icon?: React.ReactNode }[];
  placeholder?: string;
  className?: string;
  showSearch?: boolean;
  useModal?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  showSearch = true,
  useModal = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = useModal ? 'hidden' : '';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, useModal]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] hover:border-[#81D7B4] focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 transition-all text-xs sm:text-sm font-bold shadow-xs outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <div className="flex-shrink-0">{selectedOption.icon}</div>}
          <span className={`truncate ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ArrowDownIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 ml-2 shrink-0" />
      </button>

      {/* Popup Modal / Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-[420px] bg-white dark:bg-[#161616] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-white/5">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">
                  {placeholder || 'Select Option'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              {showSearch && (
                <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#121212]/50">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-white/10 focus-within:border-[#81D7B4] transition-all">
                    <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search destination bank..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Bank List */}
              <div className="overflow-y-auto p-2 space-y-1 max-h-72 custom-scrollbar">
                {filteredOptions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 font-medium">
                    No matching banks found
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#81D7B4]/20 text-[#2D5A4A] dark:text-[#81D7B4] border border-[#81D7B4]/30'
                            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {option.icon && <div className="flex-shrink-0">{option.icon}</div>}
                          <span className="truncate">{option.label}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#81D7B4] flex items-center justify-center shrink-0 ml-2">
                            <CheckIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


