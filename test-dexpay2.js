async function test() {
  const baseUrl = process.env.DEXPAY_BASE_URL ?? 'https://b2b.dexpay.io';
  const apiKey = process.env.DEXPAY_API_KEY;
  const apiSecret = process.env.DEXPAY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Missing DEXPAY_API_KEY / DEXPAY_API_SECRET');
  }

  const paths = ['/api/quote', '/v1/quote', '/api/v1/quote', '/quote'];
  for (const p of paths) {
    const res = await fetch(baseUrl + p, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'X-API-SECRET': apiSecret
      },
      body: JSON.stringify({
        fiatAmount: 50000,
        asset: "USDC",
        chain: "BASE",
        type: "BUY"
      })
    });
    console.log(p, res.status);
    const text = await res.text();
    console.log(text.substring(0, 50));
  }
}
test();
