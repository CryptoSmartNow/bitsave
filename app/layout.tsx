import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

// Inter: excellent readability at all sizes, modern body font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

// Plus Jakarta Sans: geometric display font for headings — premium, modern feel
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
})

import { Providers } from './providers';
import ReferralTracker from '@/components/ReferralTracker';
import InstallPWA from '@/components/InstallPWA';

// Add this import to your layout file
// import "../styles/date-picker.css";
import '@solana/wallet-adapter-react-ui/styles.css';

export const metadata: Metadata = {
  title: 'BitSave - Your Crypto Savings Protocol',
  description: 'Save your Stable Coins. Lock your Crypto. Build Wealth on Bitsave That Stops You From Rugging Yourself. Web3 onchain savings platform.',
  metadataBase: new URL('https://bitsave.io'),
  openGraph: {
    title: 'BitSave - Your Crypto Savings Protocol',
    description: 'Save your Stable Coins. Lock your Crypto. Build Wealth on Bitsave That Stops You From Rugging Yourself.',
    images: [{
      url: '/bitsavepreview.png',
      width: 1200,
      height: 630,
      alt: 'BitSave - Crypto Savings Protocol'
    }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BitSave - Your Crypto Savings Protocol',
    description: 'Save your Stable Coins. Lock your Crypto. Build Wealth on Bitsave.',
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
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.console.log = function() {};
                window.console.info = function() {};
                window.console.warn = function() {};
                window.console.error = function() {};
                window.console.debug = function() {};
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className}`}>
        <Providers>
          <ReferralTracker key="referral-tracker" />
          <InstallPWA key="install-pwa" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
