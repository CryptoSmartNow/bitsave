async function test() {
  const baseUrl = process.env.DEXPAY_BASE_URL ?? 'https://b2b.dexpay.io';
  const apiKey = process.env.DEXPAY_API_KEY;
  const apiSecret = process.env.DEXPAY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Missing DEXPAY_API_KEY / DEXPAY_API_SECRET');
  }

  const res = await fetch(`${baseUrl}/quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
      'X-API-SECRET': apiSecret
    },
    body: JSON.stringify({
      fiatAmount: 50000,
      asset: "USDT",
      chain: "BSC",
      type: "BUY",
      receivingAddress: "0x6bd6109FB3Bf59F67c86caB3bC09adB8B77485B7"
    })
  });
  console.log(res.status);
  const text = await res.text();
  console.log(text);
}
test();
