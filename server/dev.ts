import { createApp } from './app';
import { getPool } from './db';

const pool = getPool();
const server = createApp(pool).listen(3001, '127.0.0.1', () => {
  console.log('API Jembatan: http://127.0.0.1:3001');
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { server.close(() => { void pool.end(); }); });
}
