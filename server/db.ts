import 'dotenv/config';
import pg from 'pg';

let pool: pg.Pool | undefined;
export function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL belum diatur di .env.');
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 10_000 });
  return pool;
}
