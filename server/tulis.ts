import type { Database } from './database.js';
import type { TantanganBaru, MinatBaru } from '../src/domain/schemas.js';

export async function buatTantangan(db: Database, data: TantanganBaru) {
  // Satu statement atomik: kegagalan FK skill membatalkan tantangan sekaligus.
  const result = await db.query<{ id: number }>(`WITH baru AS (
    INSERT INTO tantangan (organisasi_id,judul,deskripsi,bidang,durasi_bulan,data_contoh)
    VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING id
  ), kebutuhan AS (
    INSERT INTO tantangan_skill (tantangan_id,skill_id,wajib)
    SELECT baru.id, s.id, TRUE FROM baru CROSS JOIN unnest($6::text[]) s(id)
    UNION ALL SELECT baru.id, s.id, FALSE FROM baru CROSS JOIN unnest($7::text[]) s(id)
  ) SELECT id FROM baru`, [data.organisasiId, data.judul, data.deskripsi, data.bidang, data.durasiBulan, data.skillWajib, data.skillTambahan]);
  return result.rows[0];
}
export async function ajukanMinat(db: Database, data: MinatBaru) {
  return (await db.query<{ id: number }>(`WITH terbuka AS (
    SELECT id FROM tantangan WHERE id=$1 AND status='terbuka' FOR SHARE
  ) INSERT INTO minat (tantangan_id,talenta_id,pesan)
    SELECT id,$2,$3 FROM terbuka ON CONFLICT (tantangan_id,talenta_id) DO NOTHING RETURNING id`, [data.tantanganId, data.talentaId, data.pesan])).rows[0];
}
