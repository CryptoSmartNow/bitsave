import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/adminVerify';
import { rateLimit } from '@/lib/rateLimit';

const JWT_SECRET = getJwtSecret();

const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD;

// POST - Admin login
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 5, 300000); // 5 attempts per 5 minutes
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { password } = body;

    // Validate credentials
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({ username: 'Admin', role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Set cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: { username: 'Admin', role: 'admin' }
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

// GET - Verify admin session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return NextResponse.json({
      user: { username: payload.username, role: payload.role }
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

// DELETE - Admin logout
export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });

  return response;
}