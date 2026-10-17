import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const rpcUrl =
    process.env.SOLANA_RPC_URL ||
    (process.env.NEXT_PUBLIC_SOLANA_RPC_URL && !process.env.NEXT_PUBLIC_SOLANA_RPC_URL.startsWith("/")
      ? process.env.NEXT_PUBLIC_SOLANA_RPC_URL
      : "https://api.mainnet-beta.solana.com");

  try {
    const body = await req.text();
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Solana RPC Proxy Error:", error);
    return NextResponse.json(
      { error: "Solana RPC proxy failed", details: error?.message || "Unknown error" },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "solana-rpc-proxy" });
}
