import { NextRequest, NextResponse } from 'next/server';
import { getUserInteractionsCollection, getTransactionsCollection, getLeaderboardCollection, UserInteraction } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
  
    const collection = await getUserInteractionsCollection();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    
    // If MongoDB is unavailable, return empty array with warning
    if (!collection) {
      console.warn('MongoDB unavailable, returning empty interactions');
      return NextResponse.json({
        interactions: [],
        warning: 'Database connection failed'
      });
    }
    

    const interactions = await collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray();

    
    // If no interactions exist, seed with sample data
    if (interactions.length === 0) {
      const sampleData = [
        {
          type: 'error',
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          data: {
            error: 'Transaction failed: Insufficient funds',
            context: 'Attempting to transfer 100 USDC',
            stack: 'Error: Insufficient funds\n    at TransactionService.transfer\n    at WalletComponent.handleTransfer'
          },
          id: 'error-001',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          sessionId: 'session-001',
          ip: '192.168.1.100'
        },
        {
          type: 'error',
          walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          data: {
            error: 'Network timeout: Unable to connect to blockchain',
            context: 'Loading wallet balance',
            stack: 'Error: Network timeout\n    at NetworkService.getBalance\n    at WalletService.updateBalance'
          },
          id: 'error-002',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          sessionId: 'session-002',
          ip: '10.0.0.50'
        },
        {
          type: 'error',
          walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
          data: {
            error: 'Invalid signature: Transaction signature verification failed',
            context: 'Signing transaction for token swap',
            stack: 'Error: Invalid signature\n    at SignatureService.verify\n    at TransactionService.sign'
          },
          id: 'error-003',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          sessionId: 'session-003',
          ip: '172.16.0.25'
        }
      ];
      
      await collection.insertMany(sampleData);
  
      return NextResponse.json(sampleData);
    }
    
    // Convert MongoDB documents to the expected format
    const formattedInteractions = interactions.map(interaction => ({
      type: interaction.type,
      walletAddress: interaction.walletAddress,
      userAgent: interaction.userAgent,
      data: interaction.data,
      id: interaction.id,
      timestamp: interaction.timestamp,
      sessionId: interaction.sessionId,
      ip: interaction.ip
    }));
    
    return NextResponse.json(formattedInteractions);
  } catch (error) {
    console.error('API Error fetching interactions:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return mock data when database is not available
    const mockData = [
      {
        type: 'error',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        data: {
          error: 'Transaction failed: Insufficient funds',
          context: 'Attempting to transfer 100 USDC',
          stack: 'Error: Insufficient funds\n    at TransactionService.transfer\n    at WalletComponent.handleTransfer'
        },
        id: 'error-001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        sessionId: 'session-001',
        ip: '192.168.1.100'
      },
      {
        type: 'error',
        walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        data: {
          error: 'Network timeout: Unable to connect to blockchain',
          context: 'Loading wallet balance',
          stack: 'Error: Network timeout\n    at NetworkService.getBalance\n    at WalletService.updateBalance'
        },
        id: 'error-002',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        sessionId: 'session-002',
        ip: '10.0.0.50'
      },
      {
        type: 'error',
        walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
        data: {
          error: 'Invalid signature: Transaction signature verification failed',
          context: 'Signing transaction for token swap',
          stack: 'Error: Invalid signature\n    at SignatureService.verify\n    at TransactionService.sign'
        },
        id: 'error-003',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        sessionId: 'session-003',
        ip: '172.16.0.25'
      }
    ];
    

    return NextResponse.json(mockData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const interaction: UserInteraction = await request.json();
    const collection = await getUserInteractionsCollection();
    
    // If MongoDB is unavailable, log the interaction but don't fail the request
    if (!collection) {
      console.warn('MongoDB unavailable, interaction not saved:', interaction);
      return NextResponse.json({ 
        message: 'Interaction logged (database unavailable)',
        warning: 'Database connection failed'
      });
    }
    
    if (!interaction.timestamp) {
      interaction.timestamp = new Date().toISOString();
    }
   
    const interactionData = interaction;
    
    await collection.insertOne(interactionData);

    // Sync to transactions and leaderboard if applicable
    if (interaction.type === 'savings_created' || interaction.type === 'transaction') {
      try {
        const transactionsCollection = await getTransactionsCollection();
        const leaderboardCollection = await getLeaderboardCollection();
        
        if (transactionsCollection && interaction.walletAddress) {
          const txData = interaction.data as any;
          
          // Create transaction record
          const transactionRecord = {
             id: interaction.id,
             transaction_type: txData.type || interaction.type,
             amount: txData.amount || '0',
             currency: txData.currency || 'ETH',
             created_at: interaction.timestamp,
             savingsname: txData.name || 'Unknown Savings',
             txnhash: txData.txHash || txData.hash || '0x0',
             chain: txData.chain || 'base',
             useraddress: interaction.walletAddress
          };
          
          await transactionsCollection.updateOne(
            { id: interaction.id },
            { $set: transactionRecord },
            { upsert: true }
          );

          // Update leaderboard
          if (leaderboardCollection) {
             // We need to parse amount as number for leaderboard aggregation
             const amount = parseFloat(transactionRecord.amount);
             if (!isNaN(amount) && amount > 0) {
                await leaderboardCollection.updateOne(
                  { useraddress: interaction.walletAddress },
                  { 
                    $inc: { totalamount: amount },
                    $set: { chain: transactionRecord.chain } // Update chain to latest
                  },
                  { upsert: true }
                );
             }
          }
        }
      } catch (syncError) {
        console.error('Error syncing to transactions/leaderboard:', syncError);
        // Don't fail the main request
      }
    }
    
    return NextResponse.json({ message: 'Interaction saved successfully' });
  } catch (error) {
    console.error('Error saving interaction:', error);
    return NextResponse.json(
      { error: 'Failed to save interaction' },
      { status: 500 }
    );
  }
}