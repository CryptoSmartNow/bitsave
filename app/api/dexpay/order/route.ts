import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { quoteId } = await req.json();

    const baseUrl = "https://b2b.dexpay.io";
    const apiKey = process.env.DEXPAY_API_KEY || "";
    const apiSecret = process.env.DEXPAY_API_SECRET || "";

    const isSandbox = false;
    const allowMocks = false;

    if (!apiKey || !apiSecret) {
      if (allowMocks) {
        return NextResponse.json({
          data: {
            id: "mock-order-" + Date.now(),
            status: "PENDING",
            bankName: "Access Bank",
            accountNumber: "0123456789",
            depositAddress: "TRXmockAddress123456789",
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

    const res = await fetch(
      `${baseUrl}/quote/${quoteId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
          "X-API-SECRET": apiSecret,
        },
        signal,
      }
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (allowMocks) {
        data = {
          data: {
            id: "mock-order-" + Date.now(),
            status: "PENDING",
            bankName: "Access Bank",
            accountNumber: "0123456789",
            depositAddress: "TRXmockAddress123456789",
          },
        };
      } else {
        return NextResponse.json(
          { error: "DexPay API returned an invalid response", details: text },
          { status: res.status }
        );
      }
    }

    if (!res.ok && !isSandbox) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("DexPay order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
