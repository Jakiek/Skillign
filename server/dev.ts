import { createApp } from './app.js';
import { getPool } from './db.js';

const pool = getPool();
const server = createApp(pool).listen(3001, '127.0.0.1', () => {
  console.log('API Skillign: http://127.0.0.1:3001');
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { server.close(() => { void pool.end(); }); });
}
