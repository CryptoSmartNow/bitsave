import { NextResponse } from "next/server";

const DEFAULT_RATE = 1485;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    const baseUrl = "https://b2b.dexpay.io";
    const apiKey = process.env.DEXPAY_API_KEY || "";
    const apiSecret = process.env.DEXPAY_API_SECRET || "";

    const generateFallbackQuote = () => {
      const rate = DEFAULT_RATE;
      const margin = 0.005;
      const adjustedRate = body?.type === "BUY" ? rate * (1 + margin) : rate * (1 - margin);
      const fiatAmount = body?.fiatAmount || (body?.tokenAmount ? body.tokenAmount * rate : 0);
      const cryptoAmount = body?.tokenAmount || (body?.fiatAmount ? body.fiatAmount / rate : 0);

      return {
        id: "quote-" + Date.now(),
        rate,
        adjustedRate,
        fiatAmount,
        cryptoAmount,
        tokenAmount: cryptoAmount,
        asset: body?.asset || "USDC",
        chain: body?.chain || "BASE",
        type: body?.type || "BUY"
      };
    };

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ data: generateFallbackQuote() });
    }

    const timeoutMs = Number(process.env.DEXPAY_TIMEOUT_MS ?? 6000);
    const signal = (AbortSignal as any).timeout
      ? (AbortSignal as any).timeout(timeoutMs)
      : undefined;

    try {
      const res = await fetch(`${baseUrl}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cancel-API-KEY": apiKey,
          "Cancel-API-SECRET": apiSecret,
        },
        signal,
        body: JSON.stringify({
          ...(body.fiatAmount ? { fiatAmount: body.fiatAmount } : {}),
          ...(body.tokenAmount ? { tokenAmount: body.tokenAmount } : {}),
          asset: body.asset || "USDC",
          chain: body.chain || "BASE",
          type: body.type,
          receivingAddress: body.receivingAddress,
          bankCode: body.bankCode,
          accountName: body.accountName,
          accountNumber: body.accountNumber,
        }),
      });

      if (!res.ok) {
        console.warn("DexPay upstream returned status:", res.status, "using fallback quote");
        return NextResponse.json({ data: generateFallbackQuote() });
      }

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json({ data: generateFallbackQuote() });
      }

      const extractQuote = (payload: any) => {
        if (!payload || typeof payload !== "object") return null;
        return (
          payload.data ??
          payload.quote ??
          payload.result ??
          payload?.data?.data ??
          null
        );
      };

      const quote = extractQuote(data);
      if (!quote) {
        return NextResponse.json({ data: generateFallbackQuote() });
      }

      const margin = 0.005;
      const q = quote as any;
      const rateVal = q.price || q.rate || q.exchangeRate || (q.fiatAmount && q.tokenAmount ? q.fiatAmount / q.tokenAmount : DEFAULT_RATE);
      
      if (rateVal > 0) {
        q.adjustedRate = body.type === "BUY" ? rateVal * (1 + margin) : rateVal * (1 - margin);
      } else {
        q.adjustedRate = DEFAULT_RATE;
      }
      q.cryptoAmount = q.tokenAmount || (rateVal > 0 ? q.fiatAmount / rateVal : undefined);

      return NextResponse.json({ data: q });
    } catch (fetchErr) {
      console.warn("DexPay fetch error, providing fallback quote:", fetchErr);
      return NextResponse.json({ data: generateFallbackQuote() });
    }
  } catch (error) {
    console.error("DexPay quote error:", error);
    return NextResponse.json({
      data: {
        id: "quote-" + Date.now(),
        rate: DEFAULT_RATE,
        adjustedRate: DEFAULT_RATE,
        fiatAmount: 10000,
        cryptoAmount: 10000 / DEFAULT_RATE,
      }
    });
  }
}

