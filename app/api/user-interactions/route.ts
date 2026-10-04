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

    // If no interactions exist, return empty array
    if (interactions.length === 0) {
      return NextResponse.json([]);
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
    // Return empty array when database is not available
    return NextResponse.json([]);
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

          // Update leaderboard for EVM wallets
          if (leaderboardCollection && interaction.walletAddress.startsWith('0x') && transactionRecord.chain !== 'solana') {
             const rawAmount = parseFloat(transactionRecord.amount);
             if (!isNaN(rawAmount) && rawAmount > 0) {
                const curr = (transactionRecord.currency || '').toLowerCase();
                let usdVal = rawAmount;

                if (curr.includes('gooddollar') || curr === '$g' || curr === 'g$') {
                  usdVal = rawAmount * 0.0001086;
                } else if (curr === 'eth' || curr === 'ethereum') {
                  usdVal = rawAmount * 3500;
                } else if (curr.includes('cngn') || curr === 'ngn') {
                  usdVal = rawAmount / 1500;
                }

                await leaderboardCollection.updateOne(
                  { useraddress: interaction.walletAddress },
                  { 
                    $inc: { totalamount: usdVal },
                    $set: { 
                      chain: transactionRecord.chain || 'base',
                      last_updated: new Date().toISOString()
                    }
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