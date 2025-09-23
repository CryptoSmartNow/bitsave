'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

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

interface GoogleTranslateProps {
  className?: string;
}

const GoogleTranslate: React.FC<GoogleTranslateProps> = ({ className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);

  // localStorage key for language preference
  const LANGUAGE_STORAGE_KEY = 'bitsave_preferred_language';

  // Language options with country mappings
  const languages = useMemo(() => [
    { code: 'en', name: 'English', country: 'US' },
    { code: 'es', name: 'Español', country: 'ES' },
    { code: 'fr', name: 'Français', country: 'FR' },
    { code: 'de', name: 'Deutsch', country: 'DE' },
    { code: 'zh', name: '中文', country: 'CN' },
    { code: 'ja', name: '日本語', country: 'JP' },
    { code: 'ko', name: '한국어', country: 'KR' },
    { code: 'pt', name: 'Português', country: 'PT' },
    { code: 'ru', name: 'Русский', country: 'RU' },
    { code: 'ar', name: 'العربية', country: 'SA' },
    { code: 'hi', name: 'हिन्दी', country: 'IN' },
    { code: 'it', name: 'Italiano', country: 'IT' },
    { code: 'nl', name: 'Nederlands', country: 'NL' },
    { code: 'sv', name: 'Svenska', country: 'SE' },
    { code: 'tr', name: 'Türkçe', country: 'TR' }
  ], []);

  // Country to language mapping
  const countryToLanguage: { [key: string]: string } = useMemo(() => ({
    'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'NZ': 'en',
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es',
    'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr',
    'DE': 'de', 'AT': 'de',
    'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'SG': 'zh',
    'JP': 'ja',
    'KR': 'ko',
    'BR': 'pt', 'PT': 'pt',
    'RU': 'ru', 'BY': 'ru', 'KZ': 'ru',
    'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'JO': 'ar',
    'IN': 'hi',
    'IT': 'it',
    'NL': 'nl',
    'SE': 'sv',
    'TR': 'tr'
  }), []);

  // Get supported locales from the languages array
  const supportedLocales = useMemo(() => languages.map(lang => lang.code), [languages]);
  
  // RTL languages list
  const RTL_LANGUAGES = useMemo(() => ['ar', 'he', 'fa', 'ur'], []);

  // Get language from cookie or localStorage
  const getStoredLanguage = useCallback((): string => {
    if (typeof window !== 'undefined') {
      // First check for cookie (set by middleware redirect)
      const cookies = document.cookie.split(';');
      const languageCookie = cookies.find(cookie => cookie.trim().startsWith('bitsave_preferred_language='));
      if (languageCookie) {
        const cookieValue = languageCookie.split('=')[1];
        if (cookieValue && supportedLocales.includes(cookieValue)) {
          return cookieValue;
        }
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
      // Also save to cookie for consistency with middleware
      document.cookie = `bitsave_preferred_language=${languageCode}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`;
    }
  };

  // Detect user's location and set language
  const detectLocationAndSetLanguage = useCallback(async () => {
    try {
      // First check if user has a stored preference
      const storedLanguage = getStoredLanguage();
      if (storedLanguage !== 'en') {
        // User has a stored preference, use it
        const finalLanguage = storedLanguage;
        setSelectedLanguage(finalLanguage);
        
        // Handle routing for stored language
        const currentPath = pathname;
        const localePattern = new RegExp(`^\/(${supportedLocales.join('|')})`);
        const pathWithoutLocale = currentPath.replace(localePattern, '') || '/';
        
        const currentLocaleMatch = currentPath.match(/^\/(en|es|fr|de|zh|ja|ko|pt|ru|ar|hi|it|nl|sv|tr)/);
        const currentLocale = currentLocaleMatch ? currentLocaleMatch[1] : null;
        
        if (currentLocale !== finalLanguage) {
          const newPath = `/${finalLanguage}${pathWithoutLocale}`;
          router.push(newPath);
        }
        
        // Set Google Translate cookie
         const cookieValue = `/en/${finalLanguage}`;
         document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
         
         // Trigger translation after navigation
         setTimeout(() => {
           const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
           if (selectElement) {
             selectElement.value = finalLanguage;
             selectElement.dispatchEvent(new Event('change'));
           }
         }, 2000);
         
         // Set document direction for RTL languages
         const isRTL = RTL_LANGUAGES.includes(finalLanguage);
         document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
         document.documentElement.lang = finalLanguage;
         
         setIsDetectingLocation(false);
         return;
       }
       
       // If no stored preference, try to get location from IP
       const response = await fetch('https://ipapi.co/json/');
       const data = await response.json();
       
       if (data.country_code) {
         const detectedLanguage = countryToLanguage[data.country_code] || 'en';
         
         // Validate that the detected language is supported
         const finalLanguage = supportedLocales.includes(detectedLanguage) ? detectedLanguage : 'en';
         setSelectedLanguage(finalLanguage);
         
         // Save detected language to localStorage
         saveLanguageToStorage(finalLanguage);
         
         // Handle routing and cookies for the detected language
         const currentPath = pathname;
         const localePattern = new RegExp(`^\/(${supportedLocales.join('|')})`);
         const pathWithoutLocale = currentPath.replace(localePattern, '') || '/';
         
         // Only navigate if we're not already on the correct locale path
         const currentLocaleMatch = currentPath.match(/^\/(en|es|fr|de|zh|ja|ko|pt|ru|ar|hi|it|nl|sv|tr)/);
         const currentLocale = currentLocaleMatch ? currentLocaleMatch[1] : null;
         
         if (currentLocale !== finalLanguage) {
           const newPath = `/${finalLanguage}${pathWithoutLocale}`;
           router.push(newPath);
         }
         
         // Set Google Translate cookie
         if (finalLanguage !== 'en') {
           const cookieValue = `/en/${finalLanguage}`;
           document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
          
          // Trigger translation after navigation
          setTimeout(() => {
            const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (selectElement) {
              selectElement.value = finalLanguage;
              selectElement.dispatchEvent(new Event('change'));
            }
          }, 2000);
        } else {
          // Clear Google Translate cookie for English
          document.cookie = `googtrans=; path=/; domain=${window.location.hostname}`;
        }
        
        // Set document direction for RTL languages
        const isRTL = RTL_LANGUAGES.includes(finalLanguage);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = finalLanguage;
      }
    } catch (error) {
      console.log('Location detection failed, defaulting to English:', error);
      setSelectedLanguage('en');
      
      // Ensure we're on the English route if no locale is detected
      const currentPath = pathname;
      const localePattern = new RegExp(`^\/(${supportedLocales.join('|')})`);
      const hasLocale = localePattern.test(currentPath);
      
      if (!hasLocale) {
        const newPath = `/en${currentPath}`;
        router.push(newPath);
      }
      
      // Clear Google Translate cookie for English
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}`;
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    } finally {
      setIsDetectingLocation(false);
    }
  }, [getStoredLanguage, supportedLocales, pathname, router, RTL_LANGUAGES, countryToLanguage]);

  useEffect(() => {
    // First, check if there's a locale in the current URL path
    const currentPath = pathname;
    const localeMatch = currentPath.match(/^\/(en|es|fr|de|zh|ja|ko|pt|ru|ar|hi|it|nl|sv|tr)/);
    
    if (localeMatch) {
      // If URL contains a supported locale, use it and save to localStorage
      const urlLocale = localeMatch[1];
      setSelectedLanguage(urlLocale);
      saveLanguageToStorage(urlLocale);
      setIsDetectingLocation(false);
      
      // Set Google Translate cookie for non-English languages
      if (urlLocale !== 'en') {
        const cookieValue = `/en/${urlLocale}`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
      } else {
        // Clear Google Translate cookie for English
        document.cookie = `googtrans=; path=/; domain=${window.location.hostname}`;
      }
      
      // Set document direction for RTL languages
      const isRTL = RTL_LANGUAGES.includes(urlLocale);
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = urlLocale;
    } else {
      // If no locale in URL, check if we're on the root path
      if (currentPath === '/') {
        // On root path, check localStorage first, then detect location
        const storedLanguage = getStoredLanguage();
        if (storedLanguage && storedLanguage !== 'en') {
          // User has a stored preference, redirect to that language
          const newPath = `/${storedLanguage}`;
          router.push(newPath);
        } else {
          // No stored preference or English preference, redirect to /en
          router.push('/en');
        }
      } else {
        // On other paths without locale, detect location and set language
        detectLocationAndSetLanguage();
      }
    }

    // Load Google Translate script
    const addGoogleTranslateScript = () => {
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.head.appendChild(script);
      }
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: languages.map(lang => lang.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          },
          'google_translate_element'
        );
        setIsLoaded(true);
      }
    };

    addGoogleTranslateScript();

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const script = document.getElementById('google-translate-script');
      if (script) {
        script.remove();
      }
    };
  }, [languages, RTL_LANGUAGES, getStoredLanguage, detectLocationAndSetLanguage, pathname, router]);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    
    // Save language preference to localStorage
    saveLanguageToStorage(languageCode);
    
    // Handle Next.js routing for internationalization
    const currentPath = pathname;
    let newPath = '';
    
    // Remove existing locale from path if present
    const localePattern = new RegExp(`^\/(${supportedLocales.join('|')})`);
    const pathWithoutLocale = currentPath.replace(localePattern, '') || '/';
    
    // Construct new path with selected language
    if (languageCode === 'en') {
      // For English, always use /en prefix for consistency
      newPath = `/en${pathWithoutLocale}`;
    } else {
      // For other languages, always use locale prefix
      newPath = `/${languageCode}${pathWithoutLocale}`;
    }
    
    // Navigate to the new path
    router.push(newPath);
    
    // Handle Google Translate and document settings after navigation
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
      
      // Set document direction for RTL languages
      const isRTL = RTL_LANGUAGES.includes(languageCode);
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
      
      // Force page reload for all language changes to ensure proper loading
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, 500);
  };

  return (
    <>
      {/* Global CSS to hide all Google Translate UI elements */}
      <style jsx global>{`
        .goog-te-banner-frame,
        .goog-te-menu-frame,
        .goog-te-ftab,
        .goog-te-balloon-frame,
        .goog-te-menu2,
        .goog-te-menu-value,
        .goog-te-gadget,
        .goog-te-combo,
        .skiptranslate,
        #google_translate_element,
        #google_translate_element *,
        .goog-te-spinner-pos,
        .goog-tooltip,
        .goog-tooltip *,
        .goog-text-highlight {
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
      
      {/* Custom Language Selector */}
      <div className="relative">
        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          disabled={!isLoaded || isDetectingLocation}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </select>
        
        {/* Globe Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Globe className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {/* Loading indicator */}
      {(!isLoaded || isDetectingLocation) && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            {isDetectingLocation && (
              <span className="text-xs text-gray-500 dark:text-gray-400">Detecting location...</span>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default GoogleTranslate;