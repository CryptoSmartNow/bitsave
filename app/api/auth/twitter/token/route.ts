import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier, redirectUri } = await request.json();
    
    if (!code || !codeVerifier || !redirectUri) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Twitter OAuth 2.0 token endpoint
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: process.env.TWITTER_CLIENT_ID || process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || ''
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID || process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || ''}:${process.env.TWITTER_CLIENT_SECRET || ''}`
        ).toString('base64')}`
      },
      body: params.toString()
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Twitter token exchange failed:', { errorData, params: params.toString(), redirectUri });
      return NextResponse.json(
        { error: `Failed to exchange code for token` },
        { status: response.status }
      );
    }
    
    const tokenData = await response.json();
    
    return NextResponse.json(tokenData);
    
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}