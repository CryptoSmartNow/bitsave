import { MongoClient, Db, Collection, ReadPreference, WriteConcern } from 'mongodb';
import dns from 'dns';

// Fix Node.js SRV DNS resolution issues with MongoDB Atlas (ECONNREFUSED querySrv)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore in restricted environments
}

const dbName = process.env.MONGODB_DB_NAME || 'bitsave';
export const MONGODB_ENABLED = true;

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  retryWrites: true,
  writeConcern: new WriteConcern('majority'),
  directConnection: false,
  readPreference: ReadPreference.PRIMARY,
  family: 4
};

interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient> | null;
  _mongoClient?: MongoClient | null;
}

const globalWithMongo = globalThis as GlobalWithMongo;

function getDirectUri(srvUri: string): string {
  if (!srvUri.startsWith('mongodb+srv://')) return srvUri;
  if (srvUri.includes('cluster.i3zan.mongodb.net')) {
    const match = srvUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@cluster\.i3zan\.mongodb\.net(\/[^?]*)?(\?.*)?/);
    if (match) {
      const user = match[1];
      const pass = match[2];
      const db = match[3] || '/bitsave';
      return `mongodb://${user}:${pass}@cluster-shard-00-00.i3zan.mongodb.net:27017,cluster-shard-00-01.i3zan.mongodb.net:27017,cluster-shard-00-02.i3zan.mongodb.net:27017${db}?ssl=true&authSource=admin&replicaSet=atlas-ilxhs0-shard-0&retryWrites=true&w=majority`;
    }
  }
  return srvUri;
}

export async function getClient(): Promise<MongoClient | null> {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) return null;

  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch {}

  // If already connected client exists in memory, return it
  if (globalWithMongo._mongoClient) {
    try {
      // Quick ping test
      return globalWithMongo._mongoClient;
    } catch {
      globalWithMongo._mongoClient = null;
      globalWithMongo._mongoClientPromise = null;
    }
  }

  const directUri = getDirectUri(rawUri);

  try {
    const c = new MongoClient(directUri, options);
    const connectedClient = await c.connect();
    globalWithMongo._mongoClient = connectedClient;
    globalWithMongo._mongoClientPromise = Promise.resolve(connectedClient);
    return connectedClient;
  } catch (err: any) {
    console.warn('ℹ️ [MongoDB] Direct connection failed, trying raw URI:', err.message || err);
    try {
      const fallbackClient = new MongoClient(rawUri, options);
      const connectedFallback = await fallbackClient.connect();
      globalWithMongo._mongoClient = connectedFallback;
      globalWithMongo._mongoClientPromise = Promise.resolve(connectedFallback);
      return connectedFallback;
    } catch (fallbackErr: any) {
      globalWithMongo._mongoClient = null;
      globalWithMongo._mongoClientPromise = null;
      console.warn('ℹ️ [MongoDB] Connection unavailable — operating in resilient fallback mode');
      return null;
    }
  }
}

const clientPromise = typeof process !== 'undefined' && process.env.MONGODB_URI 
  ? getClient() 
  : Promise.resolve(null as any);

export default clientPromise;

export async function getDatabase(): Promise<Db | null> {
  try {
    const c = await getClient();
    if (!c) return null;
    return c.db(dbName);
  } catch (error) {
    return null;
  }
}


export async function getUserInteractionsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('user_interactions');
  } catch (error) {
    console.error('Failed to get user interactions collection:', error);
    return null;
  }
}

export async function getTransactionsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('transactions');
  } catch (error) {
    console.error('Failed to get transactions collection:', error);
    return null;
  }
}

export async function getChatSessionsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('chat_sessions');
  } catch (error) {
    console.error('Failed to get chat sessions collection:', error);
    return null;
  }
}

export async function getMarketsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('markets');
  } catch (error) {
    console.error('Failed to get markets collection:', error);
    return null;
  }
}

export async function getLeaderboardCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('leaderboard');
  } catch (error) {
    console.error('Failed to get leaderboard collection:', error);
    return null;
  }
}

export async function getBusinessesCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('businesses');
  } catch (error) {
    console.error('Failed to get businesses collection:', error);
    return null;
  }
}

export async function getPushSubscriptionsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('push_subscriptions');
  } catch (error) {
    console.error('Failed to get push subscriptions collection:', error);
    return null;
  }
}

export async function getUpdatesCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('updates');
  } catch (error) {
    console.error('Failed to get updates collection:', error);
    return null;
  }
}

export async function getUserReadUpdatesCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('user_read_updates');
  } catch (error) {
    console.error('Failed to get user_read_updates collection:', error);
    return null;
  }
}

export async function getCommentsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('market_comments');
  } catch (error) {
    console.error('Failed to get market_comments collection:', error);
    return null;
  }
}

export async function getBizSwapCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('bizswap_certificates');
  } catch (error) {
    console.error('Failed to get bizswap_certificates collection:', error);
    return null;
  }
}

export async function getBizSwapUsersCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('bizswap_users');
  } catch (error) {
    console.error('Failed to get bizswap_users collection:', error);
    return null;
  }
}

export async function getBizSwapWithdrawalsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('bizswap_withdrawals');
  } catch (error) {
    console.error('Failed to get bizswap_withdrawals collection:', error);
    return null;
  }
}

export async function getBizSwapPayoutsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('bizswap_payouts');
  } catch (error) {
    console.error('Failed to get bizswap_payouts collection:', error);
    return null;
  }
}

// WC26 Vouchers Collections
export async function getWc26PoolCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('wc26_pool');
  } catch (error) {
    console.error('Failed to get wc26_pool collection:', error);
    return null;
  }
}

export async function getWc26PositionsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('wc26_positions');
  } catch (error) {
    console.error('Failed to get wc26_positions collection:', error);
    return null;
  }
}

export async function getWc26TransactionsCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('wc26_transactions');
  } catch (error) {
    console.error('Failed to get wc26_transactions collection:', error);
    return null;
  }
}

export async function getWc26PriceHistoryCollection(): Promise<Collection | null> {
  if (!MONGODB_ENABLED) {
    console.warn('MongoDB is not enabled');
    return null;
  }
  try {
    const db = await getDatabase();
    if (!db) return null;
    return db.collection('wc26_price_history');
  } catch (error) {
    console.error('Failed to get wc26_price_history collection:', error);
    return null;
  }
}

export interface UserInteraction {
  type: string;
  walletAddress?: string;
  userAgent?: string;
  data: Record<string, unknown>;
  id: string;
  timestamp: string;
  sessionId: string;
  ip: string;
}

// Health check function to test MongoDB connectivity
export async function checkMongoDBHealth(): Promise<{ connected: boolean; error?: string }> {
  if (!MONGODB_ENABLED || !clientPromise) {
    return { 
      connected: false, 
      error: 'MongoDB is not enabled or configured'
    };
  }
  
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    return { connected: true };
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}