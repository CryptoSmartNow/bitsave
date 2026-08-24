import { NextResponse } from 'next/server';
import { getUserInteractionsCollection } from '@/lib/mongodb';

const SUPPORTED_CHAINS = ['base', 'celo', 'lisk', 'bsc', 'avalanche'];

export async function GET() {
  try {
    const collection = await getUserInteractionsCollection();
    
    if (!collection) {
      return NextResponse.json({
        totalInteractions: 0,
        uniqueUsers: 0,
        errorRate: 0,
        activeToday: 0,
        tvsBreakdown: {}
      });
    }

    // Parallelize queries for better performance
    const [totalInteractions, errorCount, uniqueUsers, activeTodayUsers, tvsAggregation] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ 
        $or: [
          { type: { $regex: 'error', $options: 'i' } },
          { 'data.error': { $exists: true } }
        ]
      }),
      collection.distinct('walletAddress'),
      collection.distinct('walletAddress', {
        timestamp: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
        }
      }),
      collection.aggregate([
        { 
          $match: { 
            $or: [
              { type: 'savings_created' },
              { type: 'transaction', 'data.type': 'top_up' }
            ],
            // Only include 5 supported EVM chains, strictly exclude Solana and Hedera
            'data.chain': { 
              $nin: [/solana/i, /hedera/i],
              $in: [/base/i, /celo/i, /lisk/i, /bsc/i, /avalanche/i]
            }
          } 
        },
        {
          $group: {
            _id: { 
              chain: { $toLower: '$data.chain' }, 
              currency: { $toUpper: '$data.currency' }
            },
            totalAmount: { $sum: { $toDouble: '$data.amount' } }
          }
        }
      ]).toArray()
    ]);

    const errorRate = totalInteractions > 0 ? (errorCount / totalInteractions) * 100 : 0;

    // Process TVS aggregation into a cleaner format for supported chains only
    const tvsBreakdown: Record<string, Record<string, number>> = {};
    
    tvsAggregation.forEach((item: any) => {
      const rawChain = (item._id.chain || '').toLowerCase();
      const currency = item._id.currency || 'Unknown Token';
      
      // Strictly skip Solana, Hedera, or any unsupported chain
      if (!SUPPORTED_CHAINS.includes(rawChain) || rawChain.includes('solana') || rawChain.includes('hedera')) {
        return;
      }
      
      if (!tvsBreakdown[rawChain]) {
        tvsBreakdown[rawChain] = {};
      }
      
      tvsBreakdown[rawChain][currency] = (tvsBreakdown[rawChain][currency] || 0) + (item.totalAmount || 0);
    });

    return NextResponse.json({
      totalInteractions,
      uniqueUsers: uniqueUsers.length,
      errorRate,
      activeToday: activeTodayUsers.length,
      tvsBreakdown
    });

  } catch (error) {
    console.error('API Error fetching stats:', error);
    return NextResponse.json({
      totalInteractions: 0,
      uniqueUsers: 0,
      errorRate: 0,
      activeToday: 0,
      tvsBreakdown: {}
    }, { status: 500 });
  }
}
