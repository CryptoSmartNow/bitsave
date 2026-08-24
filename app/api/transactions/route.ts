import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsCollection, getLeaderboardCollection } from '@/lib/mongodb';
import { getCache, setCache, clearCache } from '@/lib/redis';
import { sendPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const cacheKey = address ? `transactions:${address.toLowerCase()}` : null;
    
    // Check Redis Cache first (only return if non-empty)
    if (cacheKey) {
      const cachedTransactions = await getCache<any[]>(cacheKey);
      if (cachedTransactions && Array.isArray(cachedTransactions) && cachedTransactions.length > 0) {
        return NextResponse.json({ transactions: cachedTransactions });
      }
    }

    const collection = await getTransactionsCollection();
    
    if (!collection) {
      return NextResponse.json({ 
        transactions: []
      }, { status: 200 });
    }

    let query = {};
    if (address) {
      query = { useraddress: { $regex: new RegExp(`^${address}$`, 'i') } };
    }

    // Query local MongoDB
    const transactions = await collection.find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
    
    // Format response
    let formattedTransactions = transactions.map((tx: any) => ({
      id: tx.id || tx._id.toString(),
      transaction_type: tx.transaction_type || 'unknown',
      amount: tx.amount || '0',
      currency: tx.currency || 'ETH',
      created_at: tx.created_at || new Date().toISOString(),
      savingsname: tx.savingsname || 'Unknown Savings',
      txnhash: tx.txnhash || '0x0',
      chain: tx.chain || 'base',
      useraddress: tx.useraddress
    }));

    // Fail-Proof Self-Healing: If no DB transactions exist for this wallet, auto-reconcile from on-chain vaults
    if (formattedTransactions.length === 0 && address) {
      try {
        const origin = request.nextUrl.origin || 'http://localhost:3000';
        const savingsRes = await fetch(`${origin}/api/savings-data?address=${address}`, {
          signal: AbortSignal.timeout(6000)
        });
        if (savingsRes.ok) {
          const sData = await savingsRes.json();
          const autoTxs: any[] = [];
          
          (sData.completedPlans || []).forEach((p: any) => {
            const isWithdrawn = p.isWithdrawn || p.status === 'Withdrawn';
            autoTxs.push({
              id: `onchain-${p.id}`,
              transaction_type: isWithdrawn ? 'withdrawal' : 'deposit',
              amount: p.amount || p.currentAmount || '0',
              currency: p.tokenName || 'USDC',
              created_at: new Date(Number((isWithdrawn ? p.maturityTime : p.startTime) || Date.now() / 1000) * 1000).toISOString(),
              savingsname: p.name || 'Savings Vault',
              txnhash: p.contractAddress || '0x0',
              chain: (p.network || 'Base').toLowerCase(),
              useraddress: address
            });
          });

          (sData.currentPlans || []).forEach((p: any) => {
            autoTxs.push({
              id: `onchain-${p.id}`,
              transaction_type: 'deposit',
              amount: p.amount || p.currentAmount || '0',
              currency: p.tokenName || 'USDC',
              created_at: new Date(Number(p.startTime || Date.now() / 1000) * 1000).toISOString(),
              savingsname: p.name || 'Savings Vault',
              txnhash: p.contractAddress || '0x0',
              chain: (p.network || 'Base').toLowerCase(),
              useraddress: address
            });
          });

          if (autoTxs.length > 0) {
            formattedTransactions = autoTxs;
          }
        }
      } catch (reconErr: any) {
        console.error('[Transactions API] recon error:', reconErr?.message);
      }
    }

    // Save to Cache with 15 mins TTL if address is present
    if (cacheKey && formattedTransactions.length > 0) {
      await setCache(cacheKey, formattedTransactions, 900); // 15 mins
    }

    return NextResponse.json({
      transactions: formattedTransactions
    });
    
  } catch (error) {
    console.warn('Notice fetching transactions, returning empty list fallback:', error);
    
    return NextResponse.json({ 
      transactions: []
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      txnhash,
      chain,
      savingsname,
      useraddress,
      transaction_type,
      currency
    } = body;

    // Basic validation
    if (!amount || !txnhash || !chain || !useraddress || !transaction_type || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newTransaction = {
      amount,
      txnhash,
      chain,
      savingsname: savingsname || 'Unknown',
      useraddress,
      transaction_type,
      currency,
      created_at: new Date().toISOString(),
    };

    const cacheKey = `transactions:${useraddress.toLowerCase()}`;
    const cached = (await getCache<any[]>(cacheKey)) || [];
    if (!cached.some((t: any) => t.txnhash === txnhash)) {
      cached.unshift(newTransaction);
      await setCache(cacheKey, cached.slice(0, 50), 900);
    }

    const collection = await getTransactionsCollection();
    
    if (!collection) {
      return NextResponse.json(
        { success: true, message: 'Transaction recorded in fallback store' },
        { status: 200 }
      );
    }

    // Use updateOne with upsert to prevent duplicates if the transaction is retried
    const result = await collection.updateOne(
      { txnhash: txnhash },
      { $setOnInsert: newTransaction },
      { upsert: true }
    );

    // Invalidate Redis Cache
    await clearCache(`transactions:${useraddress.toLowerCase()}`);

    // Update Leaderboard
    try {
      const leaderboardCollection = await getLeaderboardCollection();
      if (leaderboardCollection) {
        // Parse amount
        const rawAmount = parseFloat(amount);
        if (!isNaN(rawAmount) && rawAmount > 0) {
          const curr = (currency || '').toLowerCase();
          let usdVal = rawAmount;

          if (curr.includes('gooddollar') || curr === '$g' || curr === 'g$') {
            usdVal = rawAmount * 0.0001086;
          } else if (curr === 'eth' || curr === 'ethereum') {
            usdVal = rawAmount * 3500;
          } else if (curr.includes('cngn') || curr === 'ngn') {
            usdVal = rawAmount / 1500;
          }

          // Determine if we should add or subtract based on transaction type
          const isAddition = transaction_type === 'deposit' || transaction_type === 'topup';
          const increment = isAddition ? usdVal : -usdVal;
          
          await leaderboardCollection.updateOne(
            { useraddress: useraddress },
            { 
              $inc: { totalamount: increment },
              $set: { 
                chain: chain, // Update chain to latest used
                last_updated: new Date().toISOString()
              },
              $setOnInsert: {
                id: useraddress // Ensure id exists on insert
              }
            },
            { upsert: true }
          );
        }
      }
    } catch (lbError) {
      console.error('Failed to update leaderboard:', lbError);
      // We don't fail the transaction if leaderboard update fails
    }

    // Sent Push Notification
    try {
      let title = 'Transaction Successful';
      let body = `Your ${transaction_type} of ${amount} ${currency} on ${chain} was successful.`;
      
      if (transaction_type === 'deposit') {
        title = 'Savings Created';
        body = `Successfully locked ${amount} ${currency} into ${savingsname || 'your new saving plan'}.`;
      } else if (transaction_type === 'topup') {
        title = 'Savings Topped Up';
        body = `Successfully added ${amount} ${currency} to ${savingsname || 'your saving plan'}.`;
      } else if (transaction_type === 'withdraw' || transaction_type === 'withdrawal') {
        title = 'Withdrawal Successful';
        body = `Successfully withdrew ${amount} ${currency} from ${savingsname || 'your saving plan'}.`;
      }

      await sendPushNotification(useraddress, { title, body, url: '/dashboard' });
    } catch (pushErr) {
      console.error('Failed to send push notification:', pushErr);
    }

    return NextResponse.json({
      success: true,
      transaction: {
        ...newTransaction,
        id: result.upsertedId ? result.upsertedId.toString() : txnhash
      }
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, amount, transaction_type, chain, useraddress, currency, txnhash, savingsname } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing transaction ID' },
        { status: 400 }
      );
    }

    const collection = await getTransactionsCollection();
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Try to find by _id (ObjectId) or id string
    let query;
    try {
      const { ObjectId } = require('mongodb');
      query = { _id: new ObjectId(id) };
    } catch {
      query = { id: id };
    }

    // Get old transaction to adjust leaderboard if amount changed
    const oldTx = await collection.findOne(query);

    const updateData: any = {};
    if (amount) updateData.amount = parseFloat(amount);
    if (transaction_type) updateData.transaction_type = transaction_type;
    if (chain) updateData.chain = chain;
    if (useraddress) updateData.useraddress = useraddress;
    if (currency) updateData.currency = currency;
    if (txnhash) updateData.txnhash = txnhash;
    if (savingsname) updateData.savingsname = savingsname;
    updateData.updated_at = new Date().toISOString();

    const result = await collection.updateOne(query, { $set: updateData });

    // Invalidate Cache
    if (oldTx && oldTx.useraddress) {
      await clearCache(`transactions:${oldTx.useraddress.toLowerCase()}`);
    } else if (useraddress) {
      await clearCache(`transactions:${useraddress.toLowerCase()}`);
    }

    if (result.matchedCount === 0) {
      // Fallback search by string id if ObjectId failed
      const result2 = await collection.updateOne(
        { id: id },
        { $set: updateData }
      );
      if (result2.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }
    }

    // Update Leaderboard if amount or type changed
    // This is complex because we need to reverse the old effect and apply the new one
    // For simplicity in this dev tool, we might skip perfect sync or just do a simple adjustment
    // But to be "robust", we should try.
    if (oldTx && (amount || transaction_type)) {
       try {
         const leaderboardCollection = await getLeaderboardCollection();
         if (leaderboardCollection) {
            // Reverse old
            const oldAmount = parseFloat(oldTx.amount);
            const oldType = oldTx.transaction_type;
            const oldIsAdd = oldType === 'deposit' || oldType === 'topup';
            const oldIncrement = oldIsAdd ? -oldAmount : oldAmount; // Reverse

            // Apply new
            const newAmount = amount ? parseFloat(amount) : oldAmount;
            const newType = transaction_type || oldType;
            const newIsAdd = newType === 'deposit' || newType === 'topup';
            const newIncrement = newIsAdd ? newAmount : -newAmount;

            await leaderboardCollection.updateOne(
              { useraddress: oldTx.useraddress },
              { $inc: { totalamount: oldIncrement + newIncrement } }
            );
         }
       } catch (err) {
         console.error('Leaderboard adjustment failed', err);
       }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const collection = await getTransactionsCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Try to delete by _id (ObjectId) or id string
    let query;
    try {
      const { ObjectId } = require('mongodb');
      query = { _id: new ObjectId(id) };
    } catch {
      query = { id: id };
    }

    // Fetch tx to invalidate cache
    const txToDelete = await collection.findOne(query);

    const result = await collection.deleteOne(query);

    // Invalidate Cache
    if (txToDelete && txToDelete.useraddress) {
      await clearCache(`transactions:${txToDelete.useraddress.toLowerCase()}`);
    }

    if (result.deletedCount === 0) {
      // Fallback: try finding by id string if ObjectId failed or wasn't found
      const result2 = await collection.deleteOne({ id: id });
      if (result2.deletedCount === 0) {
         // Fallback 2: try txnhash
         const result3 = await collection.deleteOne({ txnhash: id });
         if (result3.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
         }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
