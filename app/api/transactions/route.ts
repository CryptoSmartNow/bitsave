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
    const response = await fetch(
      `https://bitsaveapi.vercel.app/transactions/?useraddress=${address}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
        }
      }
    );

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch transactions from external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the data to match expected format
    const transactions = data.results || [];
    
    return NextResponse.json({
      transactions: transactions.map((tx: {
        id?: string;
        transaction_type: string;
        amount: string;
        currency: string;
        created_at: string;
        savingsname: string;
        txnhash: string;
        chain: string;
      }) => ({
        id: tx.id || `${tx.txnhash}-${tx.created_at}`,
        transaction_type: tx.transaction_type,
        amount: tx.amount,
        currency: tx.currency,
        created_at: tx.created_at,
        savingsname: tx.savingsname,
        txnhash: tx.txnhash,
        chain: tx.chain
      }))
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}