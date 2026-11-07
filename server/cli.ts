import { getPool } from './db.js';
import { jalankanMigrasi } from './migrations.js';
import { isiDataContoh } from './seed.js';

const pool = getPool();
try {
  const client = await pool.connect();
  try {
    if (process.argv[2] === 'migrasi') await jalankanMigrasi(client);
    else if (process.argv[2] === 'seed') {
      if (process.env.ALLOW_SEED_RESET !== 'true') {
        throw new Error('Seed mengosongkan data. Atur ALLOW_SEED_RESET=true hanya pada database contoh Skillign.');
      }
      await isiDataContoh(client);
    } else throw new Error('Perintah tidak dikenal.');
    console.log('Selesai.');
  } finally { client.release(); }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Operasi database gagal.');
  process.exitCode = 1;
} finally { await pool.end(); }
