import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BizFi - On-Chain Yield & Financing for Businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#020611',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '12px solid #81D7B4',
        }}
      >
        <div style={{ display: 'flex', fontSize: 140, fontWeight: 900, color: '#F9F9FB', letterSpacing: '-0.04em', marginBottom: '20px' }}>
          Biz<span style={{ color: '#81D7B4' }}>Fi</span>
        </div>
        <div style={{ display: 'flex', fontSize: 42, fontWeight: 600, color: '#7B8B9A', marginTop: 20, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          On-Chain Yield For Modern Businesses
        </div>
        <div style={{ position: 'absolute', bottom: 50, display: 'flex', fontSize: 24, fontWeight: 'bold', color: '#4A5B70', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          BizMarket Protocol
        </div>
      </div>
    ),
    { ...size }
  );
}
