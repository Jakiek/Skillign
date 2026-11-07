import { PGlite } from '@electric-sql/pglite';
import { createApp } from './app';
import type { Database } from './database';
import { jalankanMigrasi } from './migrations';
import { isiDataContoh } from './seed';

const pg = new PGlite();
const db: Database = {
  async query<T extends Record<string, unknown>>(sql: string, values?: unknown[]) {
    if (values) return pg.query<T>(sql, values);
    const result = await pg.exec(sql);
    return { rows: (result.at(-1)?.rows ?? []) as T[] };
  },
};
await jalankanMigrasi(db);
await isiDataContoh(db);
const server = createApp(db).listen(3001, '127.0.0.1', () => {
  console.log('API Data contoh: http://127.0.0.1:3001 — database sementara, hilang setelah server dihentikan.');
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { server.close(() => { void pg.close(); }); });
}
