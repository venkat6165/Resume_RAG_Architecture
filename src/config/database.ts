import { MongoClient, Db } from 'mongodb';
import { env } from './env';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) return db;

  try {
    client = new MongoClient(env.mongodbUri);
    await client.connect();
    db = client.db(env.mongodbDbName);
    console.log(`[Database] Connected to MongoDB database: ${env.mongodbDbName}`);
    return db;
  } catch (error) {
    console.error('[Database] Connection failure:', error);
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase first.');
  }
  return db;
}

export interface DbHealthResult {
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<DbHealthResult> {
  try {
    const database = db || (await connectDatabase());
    const start = Date.now();
    await database.command({ ping: 1 });
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      latencyMs,
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error?.message || 'Database connection error',
    };
  }
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[Database] Connection closed');
  }
}
