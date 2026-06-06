import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const baseUrl = "https://b2b.dexpay.io";
    const apiKey = process.env.DEXPAY_API_KEY || "";
    const apiSecret = process.env.DEXPAY_API_SECRET || "";

    const isSandbox = false;
    const allowMocks = false;

    if (!apiKey || !apiSecret) {
      if (allowMocks) {
        return NextResponse.json({
          data: {
            id: orderId,
            status: "COMPLETED",
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
      `${baseUrl}/order/${orderId}`,
      {
        headers: {
          "Cancel-API-KEY": apiKey,
          "Cancel-API-SECRET": apiSecret,
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
            id: orderId,
            status: "COMPLETED",
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
    console.error("DexPay status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
