import Redis from 'ioredis';

// Allow users to provide a custom REDIS_URL or fallback to standard localhost
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const getRedisClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Redis client cannot be instantiated on the client-side.');
  }

  // Reuse the connection in development mode to prevent connection leaks during fast refreshes
  if (process.env.NODE_ENV === 'development') {
    const globalWithRedis = global as typeof globalThis & {
      _redisClient?: Redis;
    };

    if (!globalWithRedis._redisClient) {
      globalWithRedis._redisClient = new Redis(REDIS_URL);
    }
    return globalWithRedis._redisClient;
  }

  return new Redis(REDIS_URL);
};

export const redis = getRedisClient();

// Add event listeners to verify connection status
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

// Utility for easy caching
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving cache for key ${key}:`, error);
    return null;
  }
};

export const setCache = async <T>(key: string, data: T, ttlSeconds: number = 3600): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
};

export const clearCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
  }
};
