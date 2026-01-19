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
import InstallPWA from '@/components/InstallPWA';

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
      { url: '/bitsaveicon.jpg', sizes: 'any', type: 'image/jpeg' }
    ],
    apple: [
      { url: '/bitsaveicon.jpg', sizes: '180x180', type: 'image/jpeg' }
    ],
    other: [
      { url: '/bitsaveicon.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/bitsaveicon.jpg', sizes: '512x512', type: 'image/jpeg' }
    ]
  },
  manifest: '/favicon_io/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BitSave',
  },
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
    <html lang="en" className={`${exo.variable}`} suppressHydrationWarning>
      <body className={`${exo.className}`}>
        <Providers>
          <ReferralTracker />
          <InstallPWA />
          {children}
        </Providers>
      </body>
    </html>
  );
}
