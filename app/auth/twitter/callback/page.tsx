'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TwitterCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        // Check for errors
        if (error) {
          window.opener?.postMessage({
            type: 'TWITTER_AUTH_ERROR',
            error: error
          }, window.location.origin);
          window.close();
          return;
        }
        
        // Verify state parameter
        const storedState = localStorage.getItem('twitter_state');
        if (state !== storedState) {
          window.opener?.postMessage({
            type: 'TWITTER_AUTH_ERROR',
            error: 'Invalid state parameter'
          }, window.location.origin);
          window.close();
          return;
        }
        
        if (code) {
          // Exchange authorization code for access token
          const codeVerifier = localStorage.getItem('twitter_code_verifier');
          
          const tokenResponse = await fetch('/api/auth/twitter/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              codeVerifier,
              redirectUri: `${window.location.origin}/auth/twitter/callback`
            })
          });
          
          if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token');
          }
          
          const tokenData = await tokenResponse.json();
          
          // Fetch user profile
          const userResponse = await fetch('/api/auth/twitter/user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`
            }
          });
          
          if (!userResponse.ok) {
            throw new Error('Failed to fetch user profile');
          }
          
          const userData = await userResponse.json();
          
          // Send success message to parent window
          window.opener?.postMessage({
            type: 'TWITTER_AUTH_SUCCESS',
            username: userData.username,
            accessToken: tokenData.access_token,
            user: userData
          }, window.location.origin);
          
          // Clean up session storage
          localStorage.removeItem('twitter_code_verifier');
          localStorage.removeItem('twitter_state');
          
          window.close();
        }
      } catch (error) {
        console.error('Twitter callback error:', error);
        window.opener?.postMessage({
          type: 'TWITTER_AUTH_ERROR',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, window.location.origin);
        window.close();
      }
    };
    
    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Twitter authentication...</p>
      </div>
    </div>
  );
}

export default function TwitterCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TwitterCallbackContent />
    </Suspense>
  );
}