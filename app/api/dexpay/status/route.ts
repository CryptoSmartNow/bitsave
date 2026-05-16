import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const baseUrl = "https://b2b.dexpay.io";
    const apiKey = "DP_API_9D113B358BA85112DC468D61CF6976EE";
    const apiSecret = "DP_SEC_1A74163BBA1F8212A97EE0EE47F8CA45";

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
