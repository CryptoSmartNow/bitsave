import { ImageResponse } from 'next/og';
import { getBizSwapCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: any) {
  try {
    const id = params.id;
    const collection = await getBizSwapCollection();
    if (!collection) {
      return new Response('Database error', { status: 500 });
    }
    const cert = await collection.findOne({ _id: new ObjectId(id) });

    if (!cert) {
      return new Response('Not found', { status: 404 });
    }

    const { instrument, investmentAmount, business } = cert;
    const bizName = business ? business.toUpperCase() : 'SHARD';
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '1200px',
            height: '630px',
            backgroundColor: '#0D1724',
            border: '20px solid #81D7B4',
            padding: '40px',
            color: '#F9F9FB',
            fontFamily: 'sans-serif'
          }}
        >
          <h1 style={{ fontSize: '80px', color: '#81D7B4', marginBottom: '20px' }}>BizMarket Certificate</h1>
          <h2 style={{ fontSize: '40px', color: '#7B8B9A', marginBottom: '60px' }}>{instrument.toUpperCase()}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1E2F45', padding: '40px', borderRadius: '20px' }}>
             <span style={{ fontSize: '30px', color: '#7B8B9A', marginBottom: '10px' }}>Investment Amount</span>
             <span style={{ fontSize: '60px', color: '#F9F9FB' }}>${investmentAmount}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response('Failed to generate image', { status: 500 });
  }
}
