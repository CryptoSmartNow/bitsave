import type { Metadata, Viewport } from 'next'
import { Exo } from 'next/font/google'
import './globals.css'

// Configure Exo font with all weights
const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-exo',
})

import { Providers } from './providers';
import ReferralTracker from '@/components/ReferralTracker';

// Add this import to your layout file
// import "../styles/date-picker.css";

export const metadata: Metadata = {
  title: 'BitSave - Simplified Crypto Savings',
  description: 'BitSave offers a simplified approach to crypto investing with professionally managed portfolios.',
  metadataBase: new URL('https://bitsave.app'),
  openGraph: {
    title: 'BitSave - Simplified Crypto Savings',
    description: 'BitSave offers a simplified approach to crypto investing with professionally managed portfolios.',
    images: [{
      url: '/bitsavepreview.png',
      width: 1200,
      height: 630,
      alt: 'BitSave - Simplified Crypto Savings'
    }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BitSave - Simplified Crypto Savings',
    description: 'BitSave offers a simplified approach to crypto investing with professionally managed portfolios.',
    images: ['/bitsavepreview.png']
  },
  icons: {
    icon: [
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/favicon_io/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon_io/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  manifest: '/favicon_io/site.webmanifest'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${exo.variable}`}>
      <body className={`${exo.className}`}>
        <Providers>
          <ReferralTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
