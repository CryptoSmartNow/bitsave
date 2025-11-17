'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Globe, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: {
          new (options: {
            pageLanguage: string;
            includedLanguages: string;
            layout: number;
            autoDisplay: boolean;
            multilanguagePage?: boolean;
          }, elementId: string): void;
          InlineLayout: {
            SIMPLE: number;
          };
        };
      };
    };
    googleTranslateElementInit: () => void;
  }
}

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // localStorage key for language preference
  const LANGUAGE_STORAGE_KEY = 'bitsave_preferred_language';

  // Language options with country mappings and flags
  const languages = useMemo(() => [
    { code: 'en', name: 'English', country: 'US', flag: '🇺🇸' },
    { code: 'es', name: 'Español', country: 'ES', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', country: 'FR', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', country: 'DE', flag: '🇩🇪' },
    { code: 'zh', name: '中文', country: 'CN', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', country: 'JP', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', country: 'KR', flag: '🇰🇷' },
    { code: 'pt', name: 'Português', country: 'PT', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', country: 'RU', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', country: 'SA', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', country: 'IN', flag: '🇮🇳' },
    { code: 'it', name: 'Italiano', country: 'IT', flag: '🇮🇹' },
    { code: 'nl', name: 'Nederlands', country: 'NL', flag: '🇳🇱' },
    { code: 'sv', name: 'Svenska', country: 'SE', flag: '🇸🇪' },
    { code: 'tr', name: 'Türkçe', country: 'TR', flag: '🇹🇷' },
  ], []);

  const supportedLocales = useMemo(() => languages.map(lang => lang.code), [languages]);

  // Get stored language from localStorage or cookie
  const getStoredLanguage = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Check cookie first
      const cookieMatch = document.cookie.match(/bitsave_preferred_language=([^;]+)/);
      if (cookieMatch && supportedLocales.includes(cookieMatch[1])) {
        return cookieMatch[1];
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return stored && supportedLocales.includes(stored) ? stored : 'en';
    }
    return 'en';
  }, [supportedLocales]);

  // Save language to localStorage and cookie
  const saveLanguageToStorage = (languageCode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      document.cookie = `bitsave_preferred_language=${languageCode}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`;
    }
  };

  // Calculate dropdown position with viewport boundary detection
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = 256; // max-h-64 = 16rem = 256px
      const isMobile = viewportWidth < 640; // sm breakpoint
      const isTablet = viewportWidth < 1024; // lg breakpoint
      
      // Responsive dropdown width calculation
      let dropdownWidth;
      if (isMobile) {
        dropdownWidth = Math.min(viewportWidth - 24, 280); // Slightly narrower on mobile
      } else if (isTablet) {
        dropdownWidth = Math.max(rect.width, 240); // Slightly wider on tablet
      } else {
        dropdownWidth = Math.max(rect.width, 200); // Minimum width on desktop
      }
      
      // Calculate initial position
      let top = rect.bottom + 8;
      let left = rect.left;
      
      // Mobile-specific positioning
      if (isMobile) {
        // Center the dropdown on mobile
        left = (viewportWidth - dropdownWidth) / 2;
        
        // Ensure there's enough space, otherwise position above
        if (top + dropdownHeight > viewportHeight - 20) {
          top = rect.top - dropdownHeight - 8;
        }
      } else {
        // Desktop/tablet positioning logic
        // Check if dropdown would overflow bottom of viewport
        if (top + dropdownHeight > viewportHeight - 20) {
          top = rect.top - dropdownHeight - 8; // Position above the button
        }
        
        // Check if dropdown would overflow right edge of viewport
        if (left + dropdownWidth > viewportWidth - 16) {
          left = viewportWidth - dropdownWidth - 16; // 16px margin from edge
        }
        
        // Check if dropdown would overflow left edge of viewport
        if (left < 16) {
          left = 16; // 16px margin from edge
        }
      }
      
      // Ensure dropdown doesn't go above viewport (all devices)
      if (top < 20) {
        top = 20; // 20px margin from top
      }
      
      // Ensure dropdown doesn't go below viewport (all devices)
      if (top + dropdownHeight > viewportHeight - 20) {
        top = viewportHeight - dropdownHeight - 20;
      }
      
      setDropdownPosition({
        top,
        left,
        width: dropdownWidth,
      });
    }
  }, []);

  // Toggle dropdown with position calculation
  const toggleDropdown = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // Handle window resize to reposition dropdown
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, updateDropdownPosition]);

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    saveLanguageToStorage(languageCode);
    setIsOpen(false);

    // Handle routing
    const currentPath = pathname;
    const localePattern = new RegExp(`^\/(${supportedLocales.join('|')})`);
    const pathWithoutLocale = currentPath.replace(localePattern, '') || '/';
    
    const currentLocaleMatch = currentPath.match(/^\/(en|es|fr|de|zh|ja|ko|pt|ru|ar|hi|it|nl|sv|tr)/);
    const currentLocale = currentLocaleMatch ? currentLocaleMatch[1] : null;
    
    if (currentLocale !== languageCode) {
      const newPath = `/${languageCode}${pathWithoutLocale}`;
      router.push(newPath);
    }

    // Handle Google Translate based on language selection
    setTimeout(() => {
      if (languageCode === 'en') {
        // For English: Clear Google Translate and reset to original content
        document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        
        // Reset Google Translate widget to original language
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (selectElement) {
          selectElement.value = '';
          selectElement.dispatchEvent(new Event('change'));
        }
        
        // Force reload to ensure clean English content
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        // For other languages: Set Google Translate cookie and trigger translation
        const cookieValue = `/en/${languageCode}`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
        
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (selectElement) {
          selectElement.value = languageCode;
          selectElement.dispatchEvent(new Event('change'));
        }
      }
    }, 500);
  };

  // Initialize Google Translate
  useEffect(() => {
    const initializeGoogleTranslate = () => {
      if (typeof window !== 'undefined' && window.google && window.google.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: supportedLocales.join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
        setIsLoaded(true);
      }
    };

    if (!window.google || !window.google.translate) {
      window.googleTranslateElementInit = initializeGoogleTranslate;
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    } else {
      initializeGoogleTranslate();
    }

    // Set initial language
    const storedLanguage = getStoredLanguage();
    setSelectedLanguage(storedLanguage);
    setIsDetectingLocation(false);
  }, [supportedLocales, getStoredLanguage]);

  // Handle window resize and scroll to update dropdown position
  useEffect(() => {
    const handleWindowChange = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    if (isOpen) {
      window.addEventListener('resize', handleWindowChange);
      window.addEventListener('scroll', handleWindowChange);
      
      return () => {
        window.removeEventListener('resize', handleWindowChange);
        window.removeEventListener('scroll', handleWindowChange);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <>
      <style jsx global>{`
        .goog-te-gadget {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          width: 0 !important;
          height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          z-index: -9999 !important;
        }
        
        body {
          top: 0 !important;
        }
        
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        
        body.goog-te-hl {
          top: 0 !important;
        }
      `}</style>
      
      <div className={`relative ${className}`}>
        {/* Hidden Google Translate Element */}
        <div 
          id="google_translate_element" 
          style={{ 
            display: 'none',
            visibility: 'hidden', 
            width: '0px', 
            height: '0px',
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            zIndex: -9999
          }}
        ></div>

        {/* Custom Language Selector with Liquid Glass Design */}
        <div className="relative">
          <motion.button
            ref={buttonRef}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleDropdown}
            disabled={!isLoaded || isDetectingLocation}
            className="w-full bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-left shadow-2xl hover:bg-white/30 hover:shadow-xl transition-all duration-300 flex items-center justify-between group relative overflow-hidden"
          >
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 via-transparent to-white/10 pointer-events-none"></div>
            
            <div className="relative flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg">{selectedLang.flag}</span>
                <span className="font-medium text-gray-800 text-sm sm:text-base">{selectedLang.name}</span>
              </div>
            </div>
            
            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </motion.button>


        </div>

        {/* Loading indicator */}
        {(!isLoaded || isDetectingLocation) && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#81D7B4]"></div>
              {isDetectingLocation && (
                <span className="text-xs text-gray-600">Detecting location...</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Portal Dropdown Menu */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Enhanced Backdrop for click outside */}
          <div 
            className="fixed inset-0 z-[9999] bg-black/5 backdrop-blur-[1px]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu with Enhanced Visual Integration */}
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_20px_40px_-15px_rgba(129,215,180,0.3)] z-[10000] max-h-64 sm:max-h-72 overflow-y-auto"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
            >
              {/* Enhanced Gradient Overlays for Better Integration */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-white/20 pointer-events-none rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#81D7B4]/5 via-transparent to-white/20 pointer-events-none rounded-2xl"></div>
              
              {/* Visual Connection Line to Button */}
              <div className="absolute -top-1 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-[#81D7B4]/20 to-transparent"></div>
              
              <div className="relative p-2 sm:p-3">
                  {languages.map((language, index) => (
                    <motion.button
                      key={language.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.15 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 group touch-manipulation ${
                        selectedLanguage === language.code
                          ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg border border-[#81D7B4]/20'
                          : 'hover:bg-white/50 text-gray-700 hover:text-gray-900 hover:shadow-md active:bg-white/60'
                      }`}
                    >
                      <span className="text-base sm:text-lg transition-transform duration-200 group-hover:scale-110">{language.flag}</span>
                      <span className="font-medium flex-1 text-left text-sm sm:text-base">{language.name}</span>
                      {selectedLanguage === language.code && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#81D7B4] rounded-full shadow-sm"
                        />
                      )}
                    </motion.button>
                  ))}
              </div>
              
              {/* Bottom Visual Enhancement */}
              <div className="absolute -bottom-1 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-[#81D7B4]/10 to-transparent"></div>
            </motion.div>
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
};

export default LanguageSelector;