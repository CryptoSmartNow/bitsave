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

    // Fetch transactions from the external API using the specific endpoint structure provided
    // URL format: https://bitsaveapi.vercel.app/transactions/{address}
    const apiUrl = `https://bitsaveapi.vercel.app/transactions/${address}`;
    
    console.log('Fetching transactions from external API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'accept': 'application/json'
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
      // console.log('External API response data:', JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error('Error parsing external API JSON response:', jsonError);
      return NextResponse.json({ transactions: [] });
    }
    
    // The new API endpoint returns a direct array of transactions
    const transactions = Array.isArray(data) ? data : (data.results || data.transactions || []);
    
    // Return formatted response that matches what the frontend expects
    // The frontend expects { transactions: [...] }
    return NextResponse.json({
      transactions: transactions.map((tx: any) => ({
        id: tx.id || tx._id || `${tx.txnhash || 'unknown'}-${Date.now()}`,
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
    return NextResponse.json({ 
      transactions: [],
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      fallback: true
    });
  }
}
