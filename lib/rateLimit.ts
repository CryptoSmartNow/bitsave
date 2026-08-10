import { NextRequest, NextResponse } from 'next/server';

const requestCounts = new Map<string, { count: number, resetTime: number }>();

export function rateLimit(request: NextRequest, limit: number, windowMs: number) {
  // Get IP address from headers
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous';
             
  const now = Date.now();
  
  // Clean up expired entries to prevent memory leaks
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }

  let rateData = requestCounts.get(ip);

  if (!rateData) {
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
