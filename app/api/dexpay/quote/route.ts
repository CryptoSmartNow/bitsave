import { NextResponse } from "next/server";

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

    const isSandbox = false;
    const allowMocks = false;

    if (!apiKey || !apiSecret) {
      if (allowMocks) {
        const rate = 1500;
        const margin = 0.005;
        const adjustedRate =
          body?.type === "BUY" ? rate * (1 + margin) : rate * (1 - margin);
        return NextResponse.json({
          data: {
            id: "mock-quote-" + Date.now(),
            rate,
            adjustedRate,
            fiatAmount: body?.fiatAmount,
            cryptoAmount: body?.fiatAmount ? body.fiatAmount / rate : undefined,
          },
        });
      }

      return NextResponse.json(
        { error: "DexPay credentials are not configured" },
        { status: 500 }
      );
    }

    const timeoutMs = Number(process.env.DEXPAY_TIMEOUT_MS ?? 10000);
    const signal = (AbortSignal as any).timeout
      ? (AbortSignal as any).timeout(timeoutMs)
      : undefined;

    const res = await fetch(`${baseUrl}/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
        "X-API-SECRET": apiSecret,
      },
      signal,
      body: JSON.stringify({
        ...(body.fiatAmount ? { fiatAmount: body.fiatAmount } : {}),
        ...(body.tokenAmount ? { tokenAmount: body.tokenAmount } : {}),
        asset: body.asset || "USDT",
        chain: body.chain || "TRON",
        type: body.type, // "BUY" or "SELL"
        receivingAddress: body.receivingAddress, // Added to fix 400 error
        bankCode: body.bankCode,
        accountName: body.accountName,
        accountNumber: body.accountNumber,
      }),
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(
        "DexPay quote non-JSON response:",
        requestId,
        res.status,
        text.slice(0, 500),
        baseUrl
      );
      if (
        allowMocks &&
        (res.status === 502 || res.status === 503 || res.status === 404)
      ) {
        data = {
          data: {
            id: "mock-quote-" + Date.now(),
            rate: 1500,
            fiatAmount: body.fiatAmount,
            cryptoAmount: body.fiatAmount / 1500,
          },
        };
      } else {
        return NextResponse.json(
          {
            error: "DexPay API returned an invalid response",
            requestId,
            upstreamStatus: res.status,
          },
          { status: res.status }
        );
      }
    }

    const extractQuote = (payload: any) => {
      if (!payload || typeof payload !== "object") return null;
      return (
        payload.data ??
        payload.quote ??
        payload.result ??
        payload.payload ??
        payload.response ??
        payload?.data?.data ??
        payload?.data?.quote ??
        payload?.data?.result ??
        null
      );
    };

    const quote = extractQuote(data);

    if (!res.ok) {
      const message =
        (data && (data.message || data.error)) ||
        `DexPay request failed (HTTP ${res.status})`;

      console.error("DexPay quote error:", requestId, res.status, message, baseUrl);

      return NextResponse.json(
        { error: message, requestId, upstreamStatus: res.status },
        { status: res.status }
      );
    }

    if (!quote || typeof quote !== "object") {
      console.error(
        "DexPay quote missing data:",
        requestId,
        res.status,
        baseUrl,
        JSON.stringify(data).slice(0, 500)
      );

      return NextResponse.json(
        { error: "DexPay returned no quote data", requestId },
        { status: 502 }
      );
    }

    // Apply 0.5% margin
    // DexPay gives exchange rate in data.data.rate (assuming)
    // If BUY, user pays fiat. We increase the fiat amount they pay or increase the rate (fiat per crypto)
    const margin = 0.005;
    
    // We adjust the rate. 
    // Example: DexPay rate = 1500 NGN/USDT. 
    // If BUY (On-ramp): we charge 1507.5.
    // If SELL (Off-ramp): we pay out 1492.5.
    if (quote) {
      const q = quote as any;
      const rateVal = q.price || q.rate || q.exchangeRate || (q.fiatAmount && q.tokenAmount ? q.fiatAmount / q.tokenAmount : 0);
      
      if (rateVal > 0) {
        if (body.type === "BUY") {
          q.adjustedRate = rateVal * (1 + margin);
        } else {
          q.adjustedRate = rateVal * (1 - margin);
        }
      }
      
      // Ensure cryptoAmount is populated for frontend display
      q.cryptoAmount = q.tokenAmount || (rateVal > 0 ? q.fiatAmount / rateVal : undefined);
    }

    return NextResponse.json({ data: quote });
  } catch (error) {
    console.error("DexPay quote error:", error);
    return NextResponse.json(
      { error: "Internal server error", requestId: String(Date.now()) },
      { status: 500 }
    );
  }
}
