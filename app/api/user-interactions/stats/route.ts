import { NextResponse } from 'next/server';
import { getUserInteractionsCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getUserInteractionsCollection();
    
    if (!collection) {
      return NextResponse.json({
        totalInteractions: 0,
        uniqueUsers: 0,
        errorRate: 0,
        activeToday: 0
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
            ]
          } 
        },
        {
          $group: {
            _id: { 
              chain: '$data.chain', 
              currency: { $toUpper: '$data.currency' }
            },
            totalAmount: { $sum: { $toDouble: '$data.amount' } }
          }
        }
      ]).toArray()
    ]);

    const errorRate = totalInteractions > 0 ? (errorCount / totalInteractions) * 100 : 0;

    // Process TVS aggregation into a cleaner format
    const tvsBreakdown: Record<string, Record<string, number>> = {};
    
    tvsAggregation.forEach((item: any) => {
      const chain = item._id.chain || 'Unknown Chain';
      const currency = item._id.currency || 'Unknown Token';
      
      if (!tvsBreakdown[chain]) {
        tvsBreakdown[chain] = {};
      }
      
      tvsBreakdown[chain][currency] = item.totalAmount;
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
      activeToday: 0
    }, { status: 500 });
  }
}
