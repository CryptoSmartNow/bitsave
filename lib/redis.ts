import Redis from 'ioredis';

// Allow users to provide a custom REDIS_URL or fallback gracefully
const REDIS_URL = process.env.REDIS_URL;

// High-speed In-Memory fallback store
interface MemoryCacheItem {
  value: string;
  expiry: number; // Unix timestamp in ms
}

const memoryStore = new Map<string, MemoryCacheItem>();

// Clean up expired in-memory items periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, item] of memoryStore.entries()) {
      if (item.expiry > 0 && item.expiry < now) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

let isRedisConnected = false;
let lastErrorLogTime = 0;

const createRedisClient = () => {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!REDIS_URL) {
    console.log('ℹ️ [Cache] No REDIS_URL configured — using high-performance In-Memory cache.');
    return null;
  }

  try {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 4000,
      lazyConnect: false,
      retryStrategy(times) {
        // Exponential backoff capped at 15s
        const delay = Math.min(times * 1000, 15000);
        return delay;
      },
    });

    client.on('connect', () => {
      isRedisConnected = true;
      console.log('✅ [Cache] Redis connected successfully');
    });

    client.on('ready', () => {
      isRedisConnected = true;
    });

    client.on('close', () => {
      isRedisConnected = false;
    });

    client.on('error', (err) => {
      isRedisConnected = false;
      const now = Date.now();
      // Throttle error logs to at most once every 30 seconds to prevent console flood
      if (now - lastErrorLogTime > 30000) {
        console.warn(`⚠️ [Cache] Redis connection notice (${err.message}). Seamlessly utilizing in-memory cache.`);
        lastErrorLogTime = now;
      }
    });

    return client;
  } catch (err: any) {
    console.warn('⚠️ [Cache] Failed to initialize Redis client:', err.message);
    return null;
  }
};

const getRedisClient = () => {
  if (typeof window !== 'undefined') return null;

  if (process.env.NODE_ENV === 'development') {
    const globalWithRedis = global as typeof globalThis & {
      _redisClient?: Redis | null;
    };

    if (globalWithRedis._redisClient === undefined) {
      globalWithRedis._redisClient = createRedisClient();
    }
    return globalWithRedis._redisClient;
  }

  return createRedisClient();
};

export const redis = getRedisClient();

/**
 * Resilient Cache Retriever
 * Tries Redis first if connected; seamlessly falls back to In-Memory store.
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    // 1. Try Redis if available & connected
    if (redis && isRedisConnected) {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    }
  } catch (error) {
    // Fallthrough to memory store on error
  }

  // 2. Fallback to In-Memory cache
  try {
    const memoryItem = memoryStore.get(key);
    if (memoryItem) {
      if (memoryItem.expiry === 0 || memoryItem.expiry > Date.now()) {
        return JSON.parse(memoryItem.value) as T;
      } else {
        memoryStore.delete(key);
      }
    }
  } catch (memError) {
    // Return null if parse fails
  }

  return null;
};

/**
 * Resilient Cache Setter
 * Stores in both Redis and In-Memory fallback store.
 */
export const setCache = async <T>(key: string, data: T, ttlSeconds: number = 3600): Promise<void> => {
  const serialized = JSON.stringify(data);
  const expiryMs = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;

  // 1. Always write to In-Memory cache
  memoryStore.set(key, { value: serialized, expiry: expiryMs });

  // 2. Write to Redis if available
  if (redis && isRedisConnected) {
    try {
      if (ttlSeconds > 0) {
        await redis.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }
    } catch (error) {
      // Ignored: In-memory copy is already saved
    }
  }
};

/**
 * Resilient Cache Invalidator
 * Deletes from both Redis and In-Memory fallback store.
 */
export const clearCache = async (key: string): Promise<void> => {
  // 1. Clear In-Memory cache
  memoryStore.delete(key);

  // 2. Clear Redis if available
  if (redis && isRedisConnected) {
    try {
      await redis.del(key);
    } catch (error) {
      // Handled silently
    }
  }
};

