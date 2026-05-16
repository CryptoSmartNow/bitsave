import { NextResponse } from "next/server";

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    const baseUrl = "https://b2b.dexpay.io";
    const apiKey = "DP_API_9D113B358BA85112DC468D61CF6976EE";
    const apiSecret = "DP_SEC_1A74163BBA1F8212A97EE0EE47F8CA45";

    const isSandbox = false;
    const allowMocks = false;

    if (!apiKey || !apiSecret) {
      if (allowMocks) {
        return NextResponse.json({
          data: [
            { code: "044", name: "Access Bank" },
            { code: "011", name: "First Bank of Nigeria" },
            { code: "058", name: "Guaranty Trust Bank" },
          ],
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
      `${baseUrl}/banks`,
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
          data: [
            { code: "044", name: "Access Bank" },
            { code: "011", name: "First Bank of Nigeria" },
            { code: "058", name: "Guaranty Trust Bank" },
          ],
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

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error("DexPay banks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
