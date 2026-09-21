export const locales = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'nl', 'pt', 'ko', 'ru', 'ar', 'hi', 'it', 'sv', 'tr'] as const;
export const defaultLocale = 'en' as const;

export type Locale = typeof locales[number];

export const routing = {
  locales,
  defaultLocale
};