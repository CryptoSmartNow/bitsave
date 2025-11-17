import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Fetch transactions from the external API
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    const apiUrl = `https://bitsaveapi.vercel.app/transactions/?useraddress=${address}`;
    
    console.log('Fetching transactions from external API:', apiUrl);
    console.log('API Key present:', !!apiKey);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    }).catch(fetchError => {
      console.error('Network error fetching transactions:', fetchError);
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`);
    });

    if (!response.ok) {
      console.error('External API error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      // Return empty transactions instead of error for 404s
      if (response.status === 404) {
        return NextResponse.json({ transactions: [] });
      }
      
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    let data;
    try {
      data = await response.json();
      console.log('External API response data:', JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error('Error parsing external API JSON response:', jsonError);
      const textResponse = await response.text().catch(() => 'Could not read response');
      console.error('Raw external API response:', textResponse);
      return NextResponse.json({ transactions: [] });
    }
    
    // Transform the data to match expected format
    const transactions = data.results || data.transactions || [];
    
    if (!Array.isArray(transactions)) {
      console.warn('Unexpected data format from external API:', data);
      return NextResponse.json({ transactions: [] });
    }
    
    return NextResponse.json({
      transactions: transactions.map((tx: {
        id?: string;
        transaction_type?: string;
        amount?: string;
        currency?: string;
        created_at?: string;
        savingsname?: string;
        txnhash?: string;
        chain?: string;
      }) => ({
        id: tx.id || `${tx.txnhash || 'unknown'}-${tx.created_at || Date.now()}`,
        transaction_type: tx.transaction_type || 'unknown',
        amount: tx.amount || '0',
        currency: tx.currency || 'ETH',
        created_at: tx.created_at || new Date().toISOString(),
        savingsname: tx.savingsname || 'Unknown Savings',
        txnhash: tx.txnhash || '0x0',
        chain: tx.chain || 'base'
      }))
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    // Return empty transactions array instead of error for better UX
    // This allows the UI to continue working even if transaction data fails
    return NextResponse.json({ 
      transactions: [],
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      fallback: true
    });
  }
}