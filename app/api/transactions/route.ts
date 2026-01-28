import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsCollection, getLeaderboardCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const collection = await getTransactionsCollection();
    
    if (!collection) {
      console.warn('MongoDB unavailable');
      return NextResponse.json({ 
        transactions: [],
        error: 'Database unavailable'
      }, { status: 503 });
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
    return NextResponse.json({
      transactions: transactions.map((tx: any) => ({
        id: tx.id || tx._id.toString(),
        transaction_type: tx.transaction_type || 'unknown',
        amount: tx.amount || '0',
        currency: tx.currency || 'ETH',
        created_at: tx.created_at || new Date().toISOString(),
        savingsname: tx.savingsname || 'Unknown Savings',
        txnhash: tx.txnhash || '0x0',
        chain: tx.chain || 'base',
        useraddress: tx.useraddress
      }))
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json({ 
      transactions: [],
      error: error instanceof Error ? error.message : 'Failed to fetch transactions'
    }, { status: 500 });
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

    const collection = await getTransactionsCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const newTransaction = {
      amount,
      txnhash,
      chain,
      savingsname: savingsname || 'Unknown', // optional in some cases?
      useraddress,
      transaction_type,
      currency,
      created_at: new Date().toISOString(),
      // Add any other fields needed
    };

    const result = await collection.insertOne(newTransaction);

    // Update Leaderboard
    try {
      const leaderboardCollection = await getLeaderboardCollection();
      if (leaderboardCollection) {
        // Parse amount
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount)) {
          // Determine if we should add or subtract based on transaction type
          // deposits and topups increase the balance, withdrawals decrease it
          const isAddition = transaction_type === 'deposit' || transaction_type === 'topup';
          const increment = isAddition ? numericAmount : -numericAmount;
          
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

    return NextResponse.json({
      success: true,
      transaction: {
        ...newTransaction,
        id: result.insertedId.toString()
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

    const result = await collection.deleteOne(query);

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
