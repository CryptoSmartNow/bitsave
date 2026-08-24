import { NextResponse } from "next/server";

export const revalidate = 86400; // Cache for 24 hours

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "057", name: "Zenith Bank" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "035", name: "Wema Bank" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "999991", name: "OPay Digital Services" },
  { code: "999992", name: "PalmPay" },
  { code: "100004", name: "Moniepoint Microfinance Bank" },
];

export async function GET() {
  try {
    const baseUrl = "https://b2b.dexpay.io";
    const apiKey = process.env.DEXPAY_API_KEY || "";
    const apiSecret = process.env.DEXPAY_API_SECRET || "";

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ data: NIGERIAN_BANKS });
    }

    const timeoutMs = Number(process.env.DEXPAY_TIMEOUT_MS ?? 8000);
    const signal = (AbortSignal as any).timeout
      ? (AbortSignal as any).timeout(timeoutMs)
      : undefined;

    const res = await fetch(
      `${baseUrl}/banks`,
      {
        headers: {
          "Cancel-API-KEY": apiKey,
          "Cancel-API-SECRET": apiSecret,
        },
        signal,
      }
    );

    if (!res.ok) {
      return NextResponse.json({ data: NIGERIAN_BANKS });
    }

    const data = await res.json();
    const bankList = data?.data && Array.isArray(data.data) && data.data.length > 0 ? data.data : NIGERIAN_BANKS;

    return NextResponse.json({ data: bankList }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error("DexPay banks fallback used:", error);
    return NextResponse.json({ data: NIGERIAN_BANKS });
  }
}
