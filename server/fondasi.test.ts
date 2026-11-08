import type { Analitik, DetailTalenta, DetailTantangan } from '../src/domain/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import request from 'supertest';
import { createApp } from './app.js';
import type { Database } from './database.js';
import { jalankanMigrasi } from './migrations.js';
import { isiDataContoh } from './seed.js';

const pg = new PGlite();
const db: Database = {
  async query<T extends Record<string, unknown>>(sql: string, values?: unknown[]) {
    if (!values) {
      const results = await pg.exec(sql);
      return { rows: (results.at(-1)?.rows ?? []) as T[] };
    }
    return pg.query<T>(sql, values);
  },
};
const app = createApp(db);
beforeAll(async () => { await jalankanMigrasi(db); await isiDataContoh(db); }, 30_000);
afterAll(async () => { await pg.close(); });

async function snapshot() {
  const tables = ['skill', 'organisasi', 'tantangan', 'tantangan_skill', 'talenta', 'talenta_skill', 'minat'];
  return Promise.all(tables.map(async (table) =>
    // Nama tabel berasal dari daftar internal tetap, bukan input pengguna.
    (await db.query(`SELECT * FROM ${table} ORDER BY 1, 2`)).rows));
}

// Nama organisasi nyata dari versi awal data contoh; hanya untuk memastikan tidak muncul lagi.
const NAMA_ORGANISASI_LAMA = ['DTETI', 'jteti', 'JALA Tech', 'Karya Solusi Angkasa', 'Buana Karya', 'Beehive', 'Nusapala', 'Gamatechno', 'Global Data Inspirasi', 'Aino Indonesia'];

describe('fondasi PostgreSQL dan API', () => {
  it('migrasi dapat diulang tanpa menghapus data', async () => {
    await jalankanMigrasi(db);
    expect((await db.query('SELECT * FROM migrasi')).rows).toHaveLength(4);
    expect((await db.query('SELECT * FROM tantangan')).rows).toHaveLength(30);
  });
  it('seed dua kali menghasilkan semua baris yang identik', async () => {
    const awal = await snapshot();
    await isiDataContoh(db);
    expect(await snapshot()).toEqual(awal);
    expect(awal.map((rows) => rows.length)).toEqual([40, 12, 30, 120, 60, expect.any(Number), 40]);
  });
  it('seed gagal dibatalkan seluruhnya, data lama tetap utuh', async () => {
    const awal = await snapshot();
    const gagal: Database = {
      query: (sql, values) => {
        if (sql.startsWith('INSERT INTO talenta ')) throw new Error('Simulasi kegagalan seed');
        return db.query(sql, values);
      },
    };
    await expect(isiDataContoh(gagal)).rejects.toThrow('Simulasi kegagalan seed');
    expect(await snapshot()).toEqual(awal);
  });
  it('permintaan React dan SQL lebih tinggi daripada ketersediaan', async () => {
    const { rows } = await db.query(`SELECT s.id,
      (SELECT count(*)::int FROM tantangan_skill WHERE skill_id=s.id AND wajib) AS permintaan,
      (SELECT count(*)::int FROM talenta_skill WHERE skill_id=s.id) AS ketersediaan
      FROM skill s WHERE s.id IN ('react','sql')`);
    expect(rows).toHaveLength(2);
    for (const row of rows) expect(Number(row.permintaan)).toBeGreaterThan(Number(row.ketersediaan));
  });
  it('menolak minat duplikat di database', async () => {
    await expect(db.query('INSERT INTO minat (tantangan_id, talenta_id) VALUES (1,1)')).rejects.toMatchObject({ code: '23505' });
  });
  it('menolak referensi skill dan level yang tidak valid', async () => {
    await expect(db.query("INSERT INTO talenta_skill VALUES (1,'tidak-ada',1)")).rejects.toMatchObject({ code: '23503' });
    await expect(db.query("INSERT INTO talenta_skill VALUES (1,'sql',4)")).rejects.toMatchObject({ code: '23514' });
  });
  it('mengembalikan 40 skill dengan slug unik', async () => {
    const { body } = await request(app).get('/api/skill').expect(200);
    expect(body).toHaveLength(40);
    expect(new Set(body.map((s: { id: string }) => s.id)).size).toBe(40);
  });
  it('mengembalikan 30 tantangan berlabel data contoh dengan organisasi dan skill', async () => {
    const { body } = await request(app).get('/api/tantangan').expect(200);
    expect(body).toHaveLength(30);
    expect(body[0]).toMatchObject({ dataContoh: true, organisasi: { nama: expect.any(String) }, jumlahMinat: expect.any(Number) });
    expect(body.every((t: { skill: unknown[] }) => t.skill.length === 4)).toBe(true);
  });
  it('filter skill menggunakan AND dan normalisasi slug', async () => {
    const { body } = await request(app).get('/api/tantangan?bidang=web&skill=React,%20TypeScript,react').expect(200);
    expect(body).toHaveLength(6);
    const kosong = await request(app).get('/api/tantangan?skill=react,sql').expect(200);
    expect(kosong.body).toEqual([]);
  });
  it('tidak menampilkan tantangan ditutup', async () => {
    await db.query("UPDATE tantangan SET status='ditutup' WHERE id=30");
    try { expect((await request(app).get('/api/tantangan').expect(200)).body).toHaveLength(29); }
    finally { await db.query("UPDATE tantangan SET status='terbuka' WHERE id=30"); }
  });
  it('filter bidang/skill malformed ditolak, skill tak dikenal memberi daftar kosong', async () => {
    await request(app).get('/api/tantangan?bidang=asing').expect(400);
    await request(app).get('/api/tantangan?skill[]=react').expect(400);
    await request(app).get('/api/tantangan?skill=%27%3Bdrop%20table').expect(400);
    expect((await request(app).get('/api/tantangan?skill=tidak-ada').expect(200)).body).toEqual([]);
  });
  it('mengembalikan 60 talenta dan level skill valid', async () => {
    const { body } = await request(app).get('/api/talenta').expect(200);
    expect(body).toHaveLength(60);
    expect(body.every((t: { dataContoh: boolean; skill: { level: number }[] }) => t.dataContoh && t.skill.every((s) => [1, 2, 3].includes(s.level)))).toBe(true);
  });
  it('detail tantangan mengembalikan lima kandidat dan semua alasan skor', async () => {
    const { body } = await request(app).get('/api/tantangan/1').expect(200);
    const detail: DetailTantangan = body;
    expect(detail.tantangan.id).toBe(1);
    expect(detail.rekomendasi).toHaveLength(5);
    for (const { hasil } of detail.rekomendasi) {
      expect(hasil.skor).toBeGreaterThanOrEqual(0);
      expect(hasil.skor).toBeLessThanOrEqual(100);
      expect(hasil).toEqual({ skor: expect.any(Number), wajibCocok: expect.any(Array), wajibKurang: expect.any(Array), tambahanCocok: expect.any(Array) });
    }
    expect((await request(app).get('/api/tantangan/1').expect(200)).body).toEqual(body);
  });
  it('detail talenta memberikan lima tantangan terbuka dan saran belajar', async () => {
    const { body } = await request(app).get('/api/talenta/1').expect(200);
    const detail: DetailTalenta = body;
    expect(detail.talenta.id).toBe(1);
    expect(detail.rekomendasi).toHaveLength(5);
    expect(detail.rekomendasi.every((r) => r.tantangan.status === 'terbuka')).toBe(true);
    expect(detail.saranBelajar.length).toBeLessThanOrEqual(3);
    const kurang = new Set(detail.rekomendasi.flatMap((r) => r.hasil.wajibKurang));
    for (const id of detail.saranBelajar) expect(kurang.has(id)).toBe(true);
  });
  it('kedua arah memberi skor identik untuk pasangan yang sama', async () => {
    const a: DetailTantangan = (await request(app).get('/api/tantangan/1')).body;
    const kandidat = a.rekomendasi[0];
    const b: DetailTalenta = (await request(app).get(`/api/talenta/${kandidat.talenta.id}`)).body;
    let dibandingkan = 0;
    // Ambil detail setiap tantangan yang direkomendasikan untuk kandidat tersebut.
    for (const r of b.rekomendasi) {
      const detail: DetailTantangan = (await request(app).get(`/api/tantangan/${r.tantangan.id}`)).body;
      const pasangan = detail.rekomendasi.find((x) => x.talenta.id === b.talenta.id);
      if (pasangan) { expect(pasangan.hasil).toEqual(r.hasil); dibandingkan++; }
    }
    expect(dibandingkan).toBeGreaterThan(0);
  });
  it('contoh manual README bernilai 94 melalui API', async () => {
    await db.query('BEGIN');
    try {
      await db.query('DELETE FROM tantangan_skill WHERE tantangan_id=1');
      await db.query("INSERT INTO tantangan_skill VALUES (1,'react',TRUE),(1,'sql',TRUE),(1,'figma',FALSE)");
      await db.query('DELETE FROM talenta_skill WHERE talenta_id=1');
      await db.query("INSERT INTO talenta_skill VALUES (1,'react',3),(1,'sql',2),(1,'figma',1)");
      const detail: DetailTantangan = (await request(app).get('/api/tantangan/1').expect(200)).body;
      expect(detail.rekomendasi.find((r) => r.talenta.id === 1)?.hasil).toEqual({
        skor: 94, wajibCocok: ['react','sql'], wajibKurang: [], tambahanCocok: ['figma'],
      });
    } finally { await db.query('ROLLBACK'); }
  });
  it('detail tantangan ditutup masih dapat dibaca, tetapi tidak direkomendasikan', async () => {
    await db.query("UPDATE tantangan SET status='ditutup' WHERE id=1");
    try {
      const detail: DetailTantangan = (await request(app).get('/api/tantangan/1').expect(200)).body;
      expect(detail.tantangan.status).toBe('ditutup');
      const talenta: DetailTalenta = (await request(app).get('/api/talenta/1').expect(200)).body;
      expect(talenta.rekomendasi.some((r) => r.tantangan.id === 1)).toBe(false);
    } finally { await db.query("UPDATE tantangan SET status='terbuka' WHERE id=1"); }
  });
  it('ID invalid memberi 400 dan ID yang tidak ada memberi 404', async () => {
    for (const path of ['/api/tantangan', '/api/talenta']) {
      for (const id of ['0', '-1', '1.5', 'abc', '2147483648']) await request(app).get(`${path}/${id}`).expect(400);
      await request(app).get(`${path}/9999`).expect(404);
    }
  });
  it('analitik mengembalikan ringkasan, empat seri grafik, dan nilai numerik', async () => {
    const data: Analitik = (await request(app).get('/api/analitik').expect(200)).body;
    expect(data.ringkasan).toMatchObject({ tantanganTerbuka: 30, jumlahTalenta: 60, jumlahMinat: 40 });
    expect(data.permintaanSkill.length).toBeLessThanOrEqual(10);
    expect(data.permintaanSkill.find((s) => s.skillId === 'python')?.permintaan).toBe(12);
    expect(data.permintaanSkill.some((s) => s.skillId === 'git')).toBe(false);
    expect(data.tantanganPerBidang.map((s) => s.jumlah)).toEqual([6,6,6,6,6]);
    expect(data.funnel[0].jumlah).toBe(30);
    expect(data.funnel[2].jumlah).toBe(20);
    expect(data.ringkasan.persenPunyaKandidat).toBe(Math.round(data.funnel[1].jumlah / 30 * 1000) / 10);
    expect(data.kesenjanganSkill.every((s) => typeof s.ketersediaan === 'number')).toBe(true);
    expect((await db.query('SELECT jumlah_minat FROM v_minat_per_tantangan WHERE tantangan_id=30')).rows[0].jumlah_minat).toBe(0);
  });
  it('analitik mengabaikan tantangan ditutup untuk permintaan, bidang, dan corong', async () => {
    await db.query('BEGIN');
    try {
      await db.query("UPDATE tantangan SET status='ditutup' WHERE id=1");
      const data: Analitik = (await request(app).get('/api/analitik').expect(200)).body;
      expect(data.ringkasan.tantanganTerbuka).toBe(29);
      expect(data.ringkasan.jumlahMinat).toBe(40);
      expect(data.permintaanSkill.find((s) => s.skillId === 'react')?.permintaan).toBe(5);
      expect(data.tantanganPerBidang.find((b) => b.bidang === 'web')?.jumlah).toBe(5);
      expect(data.funnel[2].jumlah).toBe(19);
    } finally { await db.query('ROLLBACK'); }
  });
  it('tanpa talenta, ketersediaan nol dan rasio null tanpa pembagian nol', async () => {
    await db.query('BEGIN');
    try {
      await db.query('DELETE FROM talenta');
      const data: Analitik = (await request(app).get('/api/analitik').expect(200)).body;
      expect(data.ringkasan.jumlahTalenta).toBe(0);
      expect(data.ringkasan.persenPunyaKandidat).toBe(0);
      expect(data.kesenjanganSkill.every((s) => s.ketersediaan === 0 && s.rasio === null)).toBe(true);
      expect(data.funnel[2].jumlah).toBe(0);
    } finally { await db.query('ROLLBACK'); }
  });
  it('database kosong menghasilkan ringkasan nol dan seri kosong', async () => {
    await db.query('BEGIN');
    try {
      await db.query('TRUNCATE minat, talenta_skill, tantangan_skill, talenta, tantangan, organisasi, skill');
      const data: Analitik = (await request(app).get('/api/analitik').expect(200)).body;
      expect(data.ringkasan).toEqual({ tantanganTerbuka: 0, jumlahTalenta: 0, jumlahMinat: 0, persenPunyaKandidat: 0 });
      expect(data.permintaanSkill).toEqual([]);
      expect(data.kesenjanganSkill).toEqual([]);
      expect(data.tantanganPerBidang).toEqual([]);
      expect(data.funnel.map((s) => s.jumlah)).toEqual([0,0,0]);
    } finally { await db.query('ROLLBACK'); }
  });
  it('ambang kandidat mencakup tepat 60 dan diperbarui saat kebutuhan berubah', async () => {
    await db.query('BEGIN');
    try {
      await db.query('DELETE FROM talenta_skill');
      await db.query("INSERT INTO talenta_skill VALUES (1,'react',1)");
      await db.query('DELETE FROM tantangan_skill WHERE tantangan_id=1');
      await db.query("INSERT INTO tantangan_skill VALUES (1,'react',TRUE)");
      const tepat: Analitik = (await request(app).get('/api/analitik').expect(200)).body;
      expect(tepat.funnel[1].jumlah).toBe(1);
      await db.query("INSERT INTO tantangan_skill VALUES (1,'sql',TRUE)");
      const kurang: Analitik = (await request(app).get('/api/analitik').expect(200)).body;
      expect(kurang.funnel[1].jumlah).toBe(0);
    } finally { await db.query('ROLLBACK'); }
  });
  it('membuat tantangan atomik, menormalkan slug, dan langsung memberi rekomendasi', async () => {
    await db.query('BEGIN');
    try {
      const { body } = await request(app).post('/api/tantangan').send({ judul: 'Portal data contoh', deskripsi: 'Bangun portal contoh untuk katalog produk sintetis.', organisasiId: 1, bidang: 'web', durasiBulan: 2, skillWajib: [' React ', 'TypeScript'], skillTambahan: ['git'] }).expect(201);
      const detail: DetailTantangan = (await request(app).get(`/api/tantangan/${body.id}`).expect(200)).body;
      expect(detail.tantangan.dataContoh).toBe(true);
      expect(detail.tantangan.dibuatPengunjung).toBe(true);
      expect(detail.tantangan.skill.map((s) => s.skillId).sort()).toEqual(['git','react','typescript']);
      expect(detail.rekomendasi).toHaveLength(5);
      expect((await request(app).get('/api/analitik')).body.ringkasan.tantanganTerbuka).toBe(31);
    } finally { await db.query('ROLLBACK'); }
  });
  it('skill tidak dikenal tidak meninggalkan tantangan setengah jadi', async () => {
    const before = (await db.query('SELECT count(*)::int AS n FROM tantangan')).rows[0].n;
    await request(app).post('/api/tantangan').send({ judul: 'Portal data contoh', deskripsi: 'Deskripsi tantangan yang cukup panjang.', organisasiId: 1, bidang: 'web', durasiBulan: 2, skillWajib: ['tidak-ada'], skillTambahan: [] }).expect(400);
    expect((await db.query('SELECT count(*)::int AS n FROM tantangan')).rows[0].n).toBe(before);
  });
  it('menolak data form tidak valid dan organisasi yang tidak ada', async () => {
    await request(app).post('/api/tantangan').send({}).expect(400);
    const data = { judul: 'Portal data contoh', deskripsi: 'Deskripsi tantangan yang cukup panjang.', organisasiId: 9999, bidang: 'web', durasiBulan: 2, skillWajib: ['react'], skillTambahan: [] };
    await request(app).post('/api/tantangan').send(data).expect(400);
    await request(app).post('/api/tantangan').send({ ...data, organisasiId: 1, skillTambahan: ['react'] }).expect(400);
  });
  it('minat tersimpan sekali, duplikat mendapat 409 dan analitik diperbarui', async () => {
    await db.query('BEGIN');
    try {
      const data = { tantanganId: 30, talentaId: 60, pesan: '  Data contoh minat.  ' };
      const responses = await Promise.all([request(app).post('/api/minat').send(data), request(app).post('/api/minat').send(data)]);
      expect(responses.map((r) => r.status).sort()).toEqual([201,409]);
      const saved = await db.query('SELECT pesan FROM minat WHERE tantangan_id=30 AND talenta_id=60');
      expect(saved.rows).toEqual([{ pesan: 'Data contoh minat.' }]);
      expect((await request(app).get('/api/analitik')).body.ringkasan.jumlahMinat).toBe(41);
    } finally { await db.query('ROLLBACK'); }
  });
  it('minat menolak talenta invalid, tantangan hilang, dan tantangan ditutup', async () => {
    await request(app).post('/api/minat').send({ tantanganId: 30, talentaId: 9999 }).expect(400);
    await request(app).post('/api/minat').send({ tantanganId: 9999, talentaId: 1 }).expect(404);
    await request(app).post('/api/minat').send({ tantanganId: 1, talentaId: 0 }).expect(400);
    await db.query("UPDATE tantangan SET status='ditutup' WHERE id=30");
    try { await request(app).post('/api/minat').send({ tantanganId: 30, talentaId: 60 }).expect(409); }
    finally { await db.query("UPDATE tantangan SET status='terbuka' WHERE id=30"); }
  });
  it('katalog organisasi tersedia untuk dropdown', async () => {
    const { body } = await request(app).get('/api/organisasi').expect(200);
    expect(body).toHaveLength(12);
    expect(body[0]).toMatchObject({ id: expect.any(Number), nama: expect.any(String), kota: expect.any(String) });
  });
  it('seluruh organisasi seed fiktif dan tidak memuat nama organisasi nyata', async () => {
    const org: { nama: string; kota: string }[] = (await request(app).get('/api/organisasi').expect(200)).body;
    expect(org).toHaveLength(12);
    expect(org.every((o) => o.nama.endsWith('Contoh') && o.kota === 'Kota contoh')).toBe(true);
    const data = (await request(app).get('/api/tantangan').expect(200)).body as (DetailTantangan['tantangan'])[];
    expect(data).toHaveLength(30);
    expect(data.every((t) => t.dibuatPengunjung === false)).toBe(true);
    const teks = JSON.stringify({ org, data });
    for (const nama of NAMA_ORGANISASI_LAMA) expect(teks.toLowerCase()).not.toContain(nama.toLowerCase());
    expect(teks).not.toMatch(/\bJALA\b/);
    const kolom = await db.query("SELECT column_name FROM information_schema.columns WHERE column_name = 'sumber_url'");
    expect(kolom.rows).toHaveLength(0);
  });
  it('pencarian judul dan organisasi tidak peka kapital serta bergabung dengan filter', async () => {
    const judul = await request(app).get('/api/tantangan?q=pipeline%20etl').expect(200);
    expect(judul.body).toHaveLength(1);
    expect(judul.body[0].judul).toBe('Pipeline ETL dan ingest data');
    const org = await request(app).get('/api/tantangan?q=ANALITIKA%20DATA&bidang=data&skill=python').expect(200);
    expect(org.body.length).toBeGreaterThan(0);
    for (const row of org.body) { expect(row.organisasi.nama).toBe('PT Analitika Data Contoh'); expect(row.bidang).toBe('data'); }
  });
  it('pencarian memperlakukan karakter SQL sebagai teks dan membatasi panjang', async () => {
    expect((await request(app).get('/api/tantangan').query({ q: "' OR TRUE --" }).expect(200)).body).toEqual([]);
    await request(app).get('/api/tantangan').query({ q: 'x'.repeat(101) }).expect(400);
  });
  it('endpoint tak dikenal memberi error JSON', async () => {
    expect((await request(app).get('/api/asing').expect(404)).body).toHaveProperty('error');
  });
  it('kegagalan database tidak membocorkan detail ke klien', async () => {
    const gagal = createApp({ query: async () => { throw new Error('rahasia database'); } });
    const { body } = await request(gagal).get('/api/skill').expect(500);
    expect(body).toEqual({ error: 'Data belum dapat dimuat. Silakan coba lagi.' });
  });
});
