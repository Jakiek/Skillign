import type { Skill, Talenta, Tantangan } from '../src/domain/types';
import type { Database } from './database';

export async function daftarSkill(db: Database) {
  return (await db.query<Skill & Record<string, unknown>>('SELECT id, nama, kategori FROM skill ORDER BY nama, id')).rows;
}

// Multi-skill memakai AND: tantangan harus memuat semua skill yang dipilih.
export async function daftarTantangan(db: Database, filter: { bidang?: string; skill?: string[]; id?: number; termasukDitutup?: boolean } = {}) {
  return (await db.query<Tantangan & Record<string, unknown>>(`
    SELECT t.id, t.judul, t.deskripsi, t.bidang, t.durasi_bulan AS "durasiBulan",
      t.status, t.data_contoh AS "dataContoh", t.dibuat_pada AS "dibuatPada",
      json_build_object('id', o.id, 'nama', o.nama, 'kota', o.kota, 'jenis', o.jenis) AS organisasi,
      COALESCE((SELECT json_agg(json_build_object('skillId', ts.skill_id, 'nama', s.nama, 'wajib', ts.wajib)
        ORDER BY ts.wajib DESC, s.nama, s.id)
        FROM tantangan_skill ts JOIN skill s ON s.id = ts.skill_id WHERE ts.tantangan_id = t.id), '[]'::json) AS skill,
      (SELECT count(*)::int FROM minat m WHERE m.tantangan_id = t.id) AS "jumlahMinat"
    FROM tantangan t JOIN organisasi o ON o.id = t.organisasi_id
    WHERE ($4::boolean OR t.status = 'terbuka') AND ($3::int IS NULL OR t.id = $3) AND ($1::text IS NULL OR t.bidang = $1)
      AND NOT EXISTS (SELECT 1 FROM unnest($2::text[]) dipilih(id)
        WHERE NOT EXISTS (SELECT 1 FROM tantangan_skill ts
          WHERE ts.tantangan_id = t.id AND ts.skill_id = dipilih.id))
    ORDER BY t.dibuat_pada DESC, t.id DESC
  `, [filter.bidang ?? null, filter.skill ?? [], filter.id ?? null, filter.termasukDitutup ?? false])).rows;
}

export async function daftarTalenta(db: Database, id?: number) {
  return (await db.query<Talenta & Record<string, unknown>>(`
    SELECT t.id, t.nama, t.peran, t.prodi, t.kampus, t.bio,
      t.data_contoh AS "dataContoh", t.dibuat_pada AS "dibuatPada",
      COALESCE((SELECT json_agg(json_build_object('skillId', ts.skill_id, 'nama', s.nama, 'level', ts.level)
        ORDER BY s.nama, s.id) FROM talenta_skill ts JOIN skill s ON s.id = ts.skill_id
        WHERE ts.talenta_id = t.id), '[]'::json) AS skill
    FROM talenta t WHERE ($1::int IS NULL OR t.id = $1) ORDER BY t.nama, t.id
  `, [id ?? null])).rows;
}
