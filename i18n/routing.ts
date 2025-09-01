import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'nl', 'pt', 'ko', 'ru', 'ar', 'hi', 'it', 'sv', 'tr'] as const;
export const defaultLocale = 'en' as const;

export type Locale = typeof locales[number];

export const routing = defineRouting({
  locales,
  defaultLocale
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);