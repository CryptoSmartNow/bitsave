import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsCollection, getLeaderboardCollection } from '@/lib/mongodb';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // Simple protection
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'migration_secret_2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const transactionsCollection = await getTransactionsCollection();
    const leaderboardCollection = await getLeaderboardCollection();

    if (!transactionsCollection || !leaderboardCollection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    // 1. Fetch Leaderboard
    console.log('Fetching leaderboard from external API...');
    const leaderboardResponse = await axios.get('https://bitsaveapi.vercel.app/leaderboard', {
      headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '' }
    });
    
    const leaderboardData = leaderboardResponse.data;
    if (!Array.isArray(leaderboardData)) {
        throw new Error('Invalid leaderboard data format');
    }

    console.log(`Found ${leaderboardData.length} users in leaderboard.`);

    // 2. Save Leaderboard Data
    // We clear existing data to ensure a fresh sync or we could use upsert. 
    // Given "no loss of data", upsert is safer.
    
    let usersProcessed = 0;
    let transactionsProcessed = 0;

    for (const user of leaderboardData) {
      // Upsert user into leaderboard collection
      // Ensure totalamount is a number and handle potential currency symbols
      let numericAmount = 0;
      if (typeof user.totalamount === 'number') {
        numericAmount = user.totalamount;
      } else if (typeof user.totalamount === 'string') {
        // Remove currency symbols and other non-numeric chars (except dot and minus)
        const cleanStr = user.totalamount.replace(/[^0-9.-]+/g, '');
        numericAmount = parseFloat(cleanStr);
      }

      const safeUser = {
        ...user,
        totalamount: !isNaN(numericAmount) ? numericAmount : 0
      };

      await leaderboardCollection.updateOne(
        { useraddress: user.useraddress },
        { $set: safeUser },
        { upsert: true }
      );
      usersProcessed++;

      // 3. Fetch Transactions for this user
      if (user.useraddress) {
        try {
            console.log(`Fetching transactions for ${user.useraddress}...`);
            const txResponse = await axios.get(`https://bitsaveapi.vercel.app/transactions/${user.useraddress}`, {
                headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '' }
            });
            
            const txData = txResponse.data;
            const transactions = Array.isArray(txData) ? txData : (txData.results || txData.transactions || []);
            
            if (transactions.length > 0) {
                const bulkOps = transactions.map((tx: any) => {
                    // Normalize transaction object
                    const normalizedTx = {
                        ...tx,
                        useraddress: user.useraddress, // Ensure we link it to the user
                        migrated_at: new Date().toISOString()
                    };
                    
                    // Use id or txnhash as unique identifier
                    const uniqueId = tx.id || tx._id || tx.txnhash;
                    
                    return {
                        updateOne: {
                            filter: { $or: [{ id: uniqueId }, { txnhash: tx.txnhash }] },
                            update: { $set: normalizedTx },
                            upsert: true
                        }
                    };
                });

                if (bulkOps.length > 0) {
                    await transactionsCollection.bulkWrite(bulkOps);
                    transactionsProcessed += transactions.length;
                }
            }
        } catch (err) {
            console.error(`Failed to fetch transactions for ${user.useraddress}`, err);
            // Continue to next user
        }
      }
    }

    return NextResponse.json({
      message: 'Migration completed successfully',
      stats: {
        usersProcessed,
        transactionsProcessed
      }
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
