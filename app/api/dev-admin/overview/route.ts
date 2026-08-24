import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';
import { redis } from '@/lib/redis';

const JWT_SECRET_VALUE = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_VALUE || 'fallback-dev-only');

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const db = client.db('bitsave');
    const mongoLatency = Date.now() - startTime;

    const TWENTY_FOUR_HOURS_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalCertificates,
      pendingBizswapTxs,
      stalePendingTxs,
      completedTodayTxs,
      pendingFeedbackCount,
      unresolvedFeedback,
      recentTxs,
      saveFiSavingsCount,
      saveFiChildVaultsCount,
      bizFiCampaignsCount,
      cronLogDoc,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('bizswap_certificates').countDocuments(),
      db.collection('bizswap_transactions').countDocuments({
        status: { $in: ['pending', 'awaiting_deposit', 'processing'] }
      }),
      db.collection('bizswap_transactions').countDocuments({
        status: { $in: ['pending', 'awaiting_deposit', 'processing'] },
        timestamp: { $lte: TWENTY_FOUR_HOURS_AGO }
      }),
      db.collection('bizswap_transactions').find({
        status: 'completed',
        timestamp: { $gte: TWENTY_FOUR_HOURS_AGO }
      }).toArray(),
      db.collection('feedback_submissions').countDocuments({ status: 'pending' }),
      db.collection('feedback_submissions').find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('bizswap_transactions').find().sort({ timestamp: -1, createdAt: -1 }).limit(5).toArray(),
      db.collection('savings').countDocuments().catch(() => 0),
      db.collection('child_vaults').countDocuments().catch(() => 0),
      db.collection('bizfi_campaigns').countDocuments().catch(() => 0),
      db.collection('system_cron_logs').findOne({ job: 'reconcile-pending' }),
    ]);

    const volumeToday = completedTodayTxs.reduce((sum: number, tx: any) => sum + (Number(tx.usdcAmount) || 0), 0);

    let redisStatus = 'disconnected';
    if (redis) {
      try {
        const ping = await redis.ping();
        if (ping === 'PONG') redisStatus = 'connected';
      } catch (e) {
        redisStatus = 'fallback_memory';
      }
    }

    // Cron telemetry calculation
    const cronLastRun = cronLogDoc?.lastRunAt ? new Date(cronLogDoc.lastRunAt) : null;
    const minutesSinceCron = cronLastRun ? Math.floor((Date.now() - cronLastRun.getTime()) / (60 * 1000)) : null;
    const isCronHealthy = minutesSinceCron !== null ? minutesSinceCron <= 30 : true;

    return NextResponse.json({
      success: true,
      telemetry: {
        mongo: { status: 'healthy', latencyMs: mongoLatency },
        redis: { status: redisStatus },
        cron: {
          endpoint: '/api/cron/reconcile-pending',
          status: isCronHealthy ? 'active' : 'delayed',
          lastRunAt: cronLastRun ? cronLastRun.toISOString() : null,
          minutesSinceLastRun: minutesSinceCron,
          lastReconciledCount: cronLogDoc?.reconciledCount || 0,
          lastExpiredCount: cronLogDoc?.expiredCount || 0,
          lastEvaluatedCount: cronLogDoc?.evaluatedCount || 0,
        },
      },
      metrics: {
        // Global
        totalUsers,
        pendingFeedbackCount,
        
        // BizSwap
        bizswap: {
          totalCertificates,
          pendingTxs: pendingBizswapTxs,
          stalePendingTxs,
          volumeToday,
          completedTodayCount: completedTodayTxs.length,
        },

        // SaveFi
        savefi: {
          activeSavingsCount: saveFiSavingsCount || 0,
          childVaultsCount: saveFiChildVaultsCount || 0,
        },

        // BizFi
        bizfi: {
          activeCampaignsCount: bizFiCampaignsCount || 0,
        }
      },
      recentAlerts: {
        unresolvedFeedback: unresolvedFeedback.map((f: any) => ({
          _id: f._id.toString(),
          subject: f.subject,
          message: f.message,
          category: f.category,
          email: f.email,
          walletAddress: f.walletAddress,
          appContext: f.appContext,
          createdAt: f.createdAt,
        })),
        recentTxs: recentTxs.map((t: any) => ({
          _id: t._id.toString(),
          reference: t.reference,
          status: t.status,
          usdcAmount: t.usdcAmount,
          currency: t.currency,
          timestamp: t.timestamp || t.createdAt,
        })),
      }
    });

  } catch (error: any) {
    console.error('Error fetching dev-admin overview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Manual trigger for Cron Reconcile directly from Dev-Admin
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cronUrl = `${protocol}://${host}/api/cron/reconcile-pending`;

    const res = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        ...(process.env.CRON_SECRET ? { Authorization: `Bearer ${process.env.CRON_SECRET}` } : {})
      }
    });

    const data = await res.json();
    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      result: data
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to trigger cron' }, { status: 500 });
  }
}
