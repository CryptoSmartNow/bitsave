import { NextRequest, NextResponse } from 'next/server';

const MAX_TRACKED_IPS = 1000; // Cap to prevent memory bloating
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Periodic cleanup every 60s rather than scanning every single request
let lastCleanup = Date.now();

function cleanupExpired(now: number) {
  if (now - lastCleanup < 60000 && requestCounts.size < MAX_TRACKED_IPS) return;
  lastCleanup = now;
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}

export function rateLimit(request: NextRequest, limit: number, windowMs: number) {
  // Get IP address from headers
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'anonymous';
             
  const now = Date.now();
  cleanupExpired(now);

  let rateData = requestCounts.get(ip);

  if (!rateData) {
    // If map is at capacity, evict oldest entry
    if (requestCounts.size >= MAX_TRACKED_IPS) {
      const oldest = requestCounts.keys().next().value;
      if (oldest) requestCounts.delete(oldest);
    }
    rateData = { count: 1, resetTime: now + windowMs };
    requestCounts.set(ip, rateData);
    return null; // Not rate limited
  }

  if (now > rateData.resetTime) {
    rateData.count = 1;
    rateData.resetTime = now + windowMs;
    return null;
  }

  rateData.count++;

  if (rateData.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { 
        status: 429, 
        headers: {
          'Retry-After': Math.ceil((rateData.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateData.resetTime / 1000).toString()
        } 
      }
    );
  }

  return null;
}
