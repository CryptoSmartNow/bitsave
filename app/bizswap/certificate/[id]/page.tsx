import { Metadata } from 'next';
import { getBizSwapCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const id = params.id;

  try {
    const collection = await getBizSwapCollection();
    if (!collection) {
      return { title: 'Certificate Not Found' };
    }
    const cert = await collection.findOne({ _id: new ObjectId(id) });

    if (!cert) {
      return {
        title: 'Certificate Not Found - BizSwap',
      };
    }

    const { instrument, investmentAmount, business } = cert;
    const bizName = business ? business.toUpperCase() : 'SHARD';
    const amountStr = `$${investmentAmount.toLocaleString()}`;

    const title = `BizMarket Certificate - ${instrument}`;
    const description = `I just purchased a ${amountStr} ${instrument} on Bitsave's BizMarket! My stable coins work for me.`;
    const ogUrl = `https://www.bitsave.io/api/og/bizswap/${id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: ogUrl,
            width: 1200,
            height: 630,
            alt: 'BizMarket Certificate',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogUrl],
      },
    };
  } catch (error) {
    return {
      title: 'BizMarket Certificate',
    };
  }
}

export default function CertificatePage({ params }: any) {
  // A simple page redirecting back to the main bizswap page or displaying the cert.
  // We can just render a simple redirect or meta refresh.
  return (
    <div style={{ backgroundColor: '#080E18', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <meta httpEquiv="refresh" content="2;url=/bizswap" />
      <p style={{ color: '#F9F9FB', fontFamily: 'sans-serif' }}>Redirecting to BizSwap...</p>
    </div>
  );
}
