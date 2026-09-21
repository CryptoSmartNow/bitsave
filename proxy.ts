import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'nl', 'pt', 'ko', 'ru', 'ar', 'hi', 'it', 'sv', 'tr'];
const defaultLocale = 'en';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the request is for a locale-based dashboard route
  const dashboardMatch = pathname.match(/^\/(en|es|fr|de|zh|ja|nl|pt|ko|ru|ar|hi|it|sv|tr)\/dashboard(.*)?$/);
  
  if (dashboardMatch) {
    const [, locale, dashboardPath] = dashboardMatch;
    const targetPath = `/dashboard${dashboardPath || ''}`;
    
    // Create redirect response
    const response = NextResponse.redirect(new URL(targetPath, request.url));
    
    // Set language preference cookie to preserve user's language choice
    response.cookies.set('bitsave_preferred_language', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  }
  
  // Check if we need to redirect a root path to a localized path
  // Only apply to root / or paths that don't match our specific exceptions
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If path is missing locale, and isn't a static asset or API, redirect
  if (
    pathnameIsMissingLocale && 
    !pathname.startsWith('/_next') && 
    !pathname.startsWith('/api') && 
    !pathname.startsWith('/dashboard') &&
    !pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webmanifest)$/)
  ) {
    // We could check the cookie here, but for simplicity we'll just redirect to default
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // Match internationalized pathnames and dashboard routes
  matcher: ['/', '/(de|en|es|fr|zh|ja|nl|pt|ko|ru|ar|hi|it|sv|tr)/:path*', '/dashboard/:path*']
};