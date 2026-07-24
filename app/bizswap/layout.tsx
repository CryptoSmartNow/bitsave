import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BizSwap - Digital Business Assets',
  description: 'Trade, mint and earn from real world business assets on the blockchain.',
  manifest: '/bizswap.webmanifest',
  icons: {
    icon: [
      { url: '/bizmarket.png', sizes: 'any', type: 'image/png' }
    ],
    apple: [
      { url: '/bizmarket.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/bizmarket.png', sizes: '192x192', type: 'image/png' },
      { url: '/bizmarket.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BizSwap',
  },
};

export default function BizSwapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
