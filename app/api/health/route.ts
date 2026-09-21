import { NextResponse } from 'next/server';
import { checkMongoDBHealth } from '@/lib/mongodb';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const mongoHealth = await checkMongoDBHealth();
    let redisConnected = false;
    let redisError = null;

    try {
      if (redis) {
        redisConnected = redis.status === 'ready' || redis.status === 'connecting' || redis.status === 'connect';
        if (!redisConnected) {
          redisError = 'Redis client not ready: ' + redis.status;
        }
      } else {
        redisError = 'Redis client not initialized (fallback mode)';
      }
    } catch (e: any) {
      redisError = e.message;
    }
    
    const healthStatus = {
      status: (mongoHealth.connected && redisConnected) ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: {
          connected: mongoHealth.connected,
          error: mongoHealth.error || null
        },
        redis: {
          connected: redisConnected,
          error: redisError
        }
      }
    };

    return NextResponse.json(healthStatus, {
      status: (mongoHealth.connected && redisConnected) ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}