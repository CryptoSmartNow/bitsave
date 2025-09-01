import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'nl', 'pt', 'ko', 'ru', 'ar', 'hi', 'it', 'sv', 'tr'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export default function middleware(request: NextRequest) {
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
  
  // Skip intl middleware for dashboard routes to prevent redirect loops
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  
  // For non-dashboard routes, use the default intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match internationalized pathnames and dashboard routes
  matcher: ['/', '/(de|en|es|fr|zh|ja|nl|pt|ko|ru|ar|hi|it|sv|tr)/:path*', '/dashboard/:path*']
};