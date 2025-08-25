import { Metadata } from 'next';
import BlogListingClient from './BlogListingClient';

export const metadata: Metadata = {
  title: 'Blog | BitSave - Financial Insights & Savings Tips',
  description: 'Discover expert insights on financial wellness, smart saving strategies, and tips to help you achieve your financial goals with BitSave.',
  keywords: 'financial blog, savings tips, financial wellness, money management, BitSave insights',
  openGraph: {
    title: 'Blog | BitSave - Financial Insights & Savings Tips',
    description: 'Discover expert insights on financial wellness, smart saving strategies, and tips to help you achieve your financial goals with BitSave.',
    type: 'website',
    url: 'https://bitsave.io/blog',
    images: [
      {
        url: '/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'BitSave Blog'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | BitSave - Financial Insights & Savings Tips',
    description: 'Discover expert insights on financial wellness, smart saving strategies, and tips to help you achieve your financial goals with BitSave.',
    images: ['/og-blog.jpg']
  },
  alternates: {
    canonical: 'https://bitsave.io/blog'
  }
};

export default function BlogPage() {
  return <BlogListingClient />;
}