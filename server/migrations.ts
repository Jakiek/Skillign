import { readFile } from 'node:fs/promises';
import type { Database } from './database';

const migrasi = ['001_skema.sql', '002_view_analitik.sql', '003_sumber_referensi.sql'] as const;

// Pemanggil menyediakan satu koneksi: transaksi tidak boleh berpindah pool client.
export async function jalankanMigrasi(db: Database) {
  await db.query('BEGIN');
  try {
    await db.query('SELECT pg_advisory_xact_lock(2027)');
    await db.query(`CREATE TABLE IF NOT EXISTS migrasi (
      nama TEXT PRIMARY KEY, dijalankan_pada TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    for (const nama of migrasi) {
      const sudah = await db.query('SELECT nama FROM migrasi WHERE nama = $1', [nama]);
      if (sudah.rows.length) continue;
      const sql = await readFile(new URL(`./sql/${nama}`, import.meta.url), 'utf8');
      await db.query(sql);
      await db.query('INSERT INTO migrasi (nama) VALUES ($1)', [nama]);
    }
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}
