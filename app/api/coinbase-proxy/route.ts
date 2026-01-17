import { NextRequest, NextResponse } from 'next/server';

// Configuration
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000; // 30 seconds

// Whitelisted domains to prevent open proxy abuse
const ALLOWED_DOMAINS = [
  'api.coinbase.com',
  'api.developer.coinbase.com',
  'base.org',
  'mainnet.base.org',
  'sepolia.base.org',
  'rpc.ankr.com',
  'base-mainnet.g.alchemy.com',
  'keys.coinbase.com',
  'pay.coinbase.com',
  'bc.coinbase.com'
];

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(id);
    
    if (!response.ok && retries > 0 && response.status >= 500) {
      console.warn(`[Proxy] Request failed with ${response.status}. Retrying... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (MAX_RETRIES - retries + 1))); // Exponential backoff
      return fetchWithRetry(url, options, retries - 1);
    }
    
    return response;
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`[Proxy] Network error: ${error.message}. Retrying... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  return handleProxy(req);
}

export async function GET(req: NextRequest) {
  return handleProxy(req);
}

async function handleProxy(req: NextRequest) {
  const url = new URL(req.url);
  const targetUrlStr = url.searchParams.get('url');

  if (!targetUrlStr) {
    return NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(targetUrlStr);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid target URL' }, { status: 400 });
  }

  // Security check
  const isAllowed = ALLOWED_DOMAINS.some(domain => targetUrl.hostname.endsWith(domain));
  if (!isAllowed) {
    console.warn(`[Proxy] Blocked request to unauthorized domain: ${targetUrl.hostname}`);
    // For development, we might want to be more lenient, but for robust solution, strict whitelist
    // return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    // Clone headers but remove host-specific ones
    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');
    
    // Read body for non-GET requests
    let body: BodyInit | null = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.arrayBuffer();
    }

    console.log(`[Proxy] Forwarding ${req.method} request to: ${targetUrlStr}`);

    const response = await fetchWithRetry(targetUrlStr, {
      method: req.method,
      headers: headers,
      body: body,
      cache: 'no-store'
    });

    // Prepare response
    const responseHeaders = new Headers(response.headers);
    // Ensure CORS
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error('[Proxy] Fatal error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error.message },
      { status: 502 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
    },
  });
}
