import { MongoClient, Db, Collection, ReadPreference, WriteConcern } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'bitsave';

// MongoDB is optional - app can work without it
const MONGODB_ENABLED = !!uri;

const options = {
  serverSelectionTimeoutMS: 10000, // Increase timeout to 10s
  connectTimeoutMS: 10000, // Give up initial connection after 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  retryWrites: true,
  writeConcern: new WriteConcern('majority'),
  directConnection: false, // Allow driver to discover all nodes
  readPreference: ReadPreference.PRIMARY
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient> | null;
}

const globalWithMongo = globalThis as GlobalWithMongo;

if (MONGODB_ENABLED) {
  if (process.env.NODE_ENV === 'development') {
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri!, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri!, options);
    clientPromise = client.connect();
  }
}


export default clientPromise;

export async function getDatabase(): Promise<Db | null> {
  if (!MONGODB_ENABLED || !clientPromise) {
    console.warn('MongoDB is not enabled or configured');
    return null;
  }
  
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
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