import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import dns from 'dns';

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records on Windows/local networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if environment forbids custom DNS
}

// ─── Environment Variable Loading ───────────────────────────────────────────
export const loadEnvironment = (): string | null => {
  const candidatePaths = [
    path.resolve(process.cwd(), 'server', '.env'),
    path.resolve(process.cwd(), '.env'),
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return envPath;
    }
  }

  dotenv.config();
  return null;
};

// Ensure env is loaded as early as possible
loadEnvironment();

// ─── Database State Tracking ────────────────────────────────────────────────
export type StorageMode = 'atlas' | 'local' | 'in-memory' | 'uninitialized';

interface DatabaseState {
  mode: StorageMode;
  host: string;
  databaseName: string;
  isPersistent: boolean;
}

let mongoMemoryInstance: MongoMemoryServer | null = null;
const dbState: DatabaseState = {
  mode: 'uninitialized',
  host: '',
  databaseName: 'procurex',
  isPersistent: false,
};

// ─── URI Utility & Sanitization ─────────────────────────────────────────────
export const sanitizeMongoUri = (uri: string): string => {
  if (!uri) return '';
  // Mask password while keeping username and host intact
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
};

export const extractHostFromUri = (uri: string): string => {
  try {
    const atSplit = uri.split('@');
    if (atSplit.length > 1) {
      const hostPart = atSplit[1].split('/')[0].split('?')[0];
      return hostPart;
    }
    const clean = uri.replace(/^mongodb(?:\+srv)?:\/\//, '');
    return clean.split('/')[0].split('?')[0];
  } catch {
    return 'cluster-host';
  }
};

export const isPlaceholderUri = (uri: string): boolean => {
  const lower = uri.toLowerCase();
  return (
    lower.includes('username:password') ||
    lower.includes('your_cluster') ||
    lower.includes('cluster0.xxxxx') ||
    lower.includes('<username>') ||
    lower.includes('<password>')
  );
};

export const normalizeMongoUri = (rawUri: string): string => {
  const trimmed = rawUri.trim();
  // Safe URL encoding for credentials if raw special characters exist
  const regex = /^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*?)@([^/?]+)(.*)$/;
  const match = trimmed.match(regex);
  if (match) {
    const [, protocol, username, password, host, rest] = match;
    const encodedUser = encodeURIComponent(decodeURIComponent(username));
    const encodedPass = encodeURIComponent(decodeURIComponent(password));
    
    // Ensure database name 'procurex' is present if missing before query string
    let pathAndQuery = rest;
    if (!pathAndQuery || pathAndQuery === '/' || pathAndQuery.startsWith('/?')) {
      const query = pathAndQuery.startsWith('/?') ? pathAndQuery.slice(1) : (pathAndQuery.startsWith('?') ? pathAndQuery : '?retryWrites=true&w=majority');
      pathAndQuery = `/procurex${query.startsWith('?') ? query : `?${query}`}`;
    }

    return `${protocol}${encodedUser}:${encodedPass}@${host}${pathAndQuery}`;
  }
  return trimmed;
};

// ─── Main Connection Handler ────────────────────────────────────────────────
export const connectDB = async (options: { allowMemoryFallback?: boolean } = {}): Promise<string> => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return (mongoose.connection as any).client?.s?.url || mongoose.connection.host || 'connected';
  }

  loadEnvironment();
  const rawUri = process.env.MONGODB_URI?.trim();

  // ── CASE A: MONGODB_URI is explicitly configured ──
  if (rawUri) {
    if (isPlaceholderUri(rawUri)) {
      console.error('\n' + '='.repeat(70));
      console.error('[Database] CONFIGURATION ERROR: Unreplaced Atlas Placeholder Detected');
      console.error('='.repeat(70));
      console.error('Your server/.env file contains template credentials:');
      console.error(`  ${sanitizeMongoUri(rawUri)}`);
      console.error('\nPlease edit server/.env and replace USERNAME, PASSWORD, and YOUR_CLUSTER');
      console.error('with your actual MongoDB Atlas cluster credentials.');
      console.error('Example: MONGODB_URI=mongodb+srv://admin:MyPass123@cluster0.abcde.mongodb.net/procurex?retryWrites=true&w=majority');
      console.error('='.repeat(70) + '\n');
      throw new Error('MONGODB_URI contains placeholder credentials. Configuration required in server/.env.');
    }

    const normalizedUri = normalizeMongoUri(rawUri);
    const sanitized = sanitizeMongoUri(normalizedUri);
    const host = extractHostFromUri(normalizedUri);
    const isAtlas = normalizedUri.startsWith('mongodb+srv://') || normalizedUri.includes('.mongodb.net');

    console.log(`[Database] Attempting connection to ${isAtlas ? 'MongoDB Atlas' : 'Configured MongoDB'} cluster: ${host}...`);

    try {
      await mongoose.connect(normalizedUri, {
        serverSelectionTimeoutMS: 10000, // 10-second timeout for cloud DNS & handshake
      });

      dbState.mode = isAtlas ? 'atlas' : 'local';
      dbState.host = host;
      dbState.databaseName = mongoose.connection.name || 'procurex';
      dbState.isPersistent = true;

      console.log(`[Database] Connected successfully to ${isAtlas ? 'MongoDB Atlas' : 'persistent database'} (${sanitized})`);
      console.log(`[Database] Active database: ${dbState.databaseName} | Storage: PERSISTENT`);
      return normalizedUri;
    } catch (err: any) {
      console.error('\n' + '='.repeat(70));
      console.error(`[Database] CRITICAL: Failed to connect to ${isAtlas ? 'MongoDB Atlas' : 'configured database'}`);
      console.error('='.repeat(70));
      console.error(`Target Host: ${host}`);
      console.error(`Error Message: ${err.message}`);

      // Detailed diagnostics
      if (err.message?.includes('bad auth') || err.message?.includes('Authentication failed')) {
        console.error('Likely Cause: Invalid database username or password in MONGODB_URI.');
      } else if (err.message?.includes('querySrv') || err.message?.includes('ENOTFOUND')) {
        console.error('Likely Cause: DNS / SRV lookup failed. Verify your Atlas cluster hostname in MONGODB_URI.');
      } else if (err.name === 'MongooseServerSelectionError' || err.message?.includes('timed out')) {
        console.error('Likely Cause: IP Access Restriction or Network Timeout.');
        console.error('  → Ensure your IP is allowed in MongoDB Atlas: Security > Network Access > Add IP Address (use 0.0.0.0/0 for anywhere).');
      }

      if (options.allowMemoryFallback || process.env.NODE_ENV === 'test') {
        console.warn('[Database] Test environment active: Starting embedded in-memory MongoDB for test suite...');
        mongoMemoryInstance = await MongoMemoryServer.create();
        const memUri = mongoMemoryInstance.getUri();
        await mongoose.connect(memUri);
        dbState.mode = 'in-memory';
        dbState.host = 'embedded-memory-server';
        dbState.databaseName = mongoose.connection.name || 'procurex';
        dbState.isPersistent = false;
        return memUri;
      }

      console.error('\n[Database] REFUSING SILENT FALLBACK: Application will NOT start with in-memory storage');
      console.error('because MONGODB_URI was explicitly configured for persistent storage.');
      console.error('='.repeat(70) + '\n');

      throw err; // Halts startup safely without masking the issue
    }
  }

  // ── CASE B: MONGODB_URI is NOT configured ──
  // Check if a local MongoDB server exists on default port
  const defaultLocalUri = 'mongodb://127.0.0.1:27017/procurex';
  try {
    console.log('[Database] MONGODB_URI not set. Probing default local MongoDB at 127.0.0.1:27017...');
    await mongoose.connect(defaultLocalUri, {
      serverSelectionTimeoutMS: 1500, // Quick 1.5s probe
    });

    dbState.mode = 'local';
    dbState.host = '127.0.0.1:27017';
    dbState.databaseName = 'procurex';
    dbState.isPersistent = true;

    console.log('[Database] Connected successfully to local MongoDB instance at 127.0.0.1:27017/procurex');
    return defaultLocalUri;
  } catch {
    // Local MongoDB is not running — intentional development fallback
    console.warn('\n' + '!'.repeat(70));
    console.warn('[Database] WARNING: No MONGODB_URI configured & local MongoDB unreachable.');
    console.warn('[Database] Starting temporary embedded in-memory MongoDB for offline demo...');
    console.warn('[Database] NOTICE: Storage is NON-PERSISTENT. Records will reset on server restart.');
    console.warn('[Database] To connect to MongoDB Atlas, add MONGODB_URI to server/.env');
    console.warn('!'.repeat(70) + '\n');

    try {
      mongoMemoryInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryInstance.getUri();
      await mongoose.connect(memUri);

      dbState.mode = 'in-memory';
      dbState.host = 'embedded-memory-server';
      dbState.databaseName = mongoose.connection.name || 'procurex';
      dbState.isPersistent = false;

      console.log(`[Database] Connected to embedded in-memory MongoDB (${memUri})`);
      return memUri;
    } catch (memErr: any) {
      console.error(`[Database] Failed to initialize embedded in-memory database: ${memErr.message}`);
      throw memErr;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryInstance) {
    await mongoMemoryInstance.stop();
    mongoMemoryInstance = null;
  }
  dbState.mode = 'uninitialized';
  dbState.isPersistent = false;
};

export const getDatabaseInfo = () => {
  const readyState = mongoose.connection.readyState;
  const statusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: statusMap[readyState] || 'unknown',
    mode: dbState.mode,
    host: dbState.host,
    databaseName: dbState.databaseName,
    isPersistent: dbState.isPersistent,
  };
};
