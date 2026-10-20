import { Pool } from 'pg';

// Connection pooling via Supabase Supavisor (Port 6543)
// Transaction mode pool handles thousands of concurrent serverless requests
const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres.pmqtgqkgwmlztnmqmnag:Rivlet%401412@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const pool = global._pgPool || new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export default pool;
