import { buatTantangan, ajukanMinat } from './tulis.js';
import { bacaAnalitik } from './analitik.js';
import { rekomendasiTalenta, rekomendasiTantangan, saranBelajar } from '../src/domain/skor.js';
import type { DetailTalenta, DetailTantangan } from '../src/domain/types.js';
import express, { type ErrorRequestHandler } from 'express';
import type { Database } from './database.js';
import { skemaFilterTantangan, skemaId, skemaTantanganBaru, skemaMinat } from '../src/domain/schemas.js';
import { daftarSkill, daftarTalenta, daftarTantangan } from './queries.js';

export function createApp(db: Database) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/organisasi', async (_req, res, next) => {
    try { res.json((await db.query('SELECT id,nama,jenis,kota FROM organisasi ORDER BY nama,id')).rows); }
    catch (error) { next(error); }
  });
  app.post('/api/tantangan', async (req, res, next) => {
    const parsed = skemaTantanganBaru.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Periksa isian tantangan.', detail: parsed.error.flatten().fieldErrors }); return; }
    try { res.status(201).json(await buatTantangan(db, parsed.data)); }
    catch (error) { next(error); }
  });
  app.post('/api/minat', async (req, res, next) => {
    const parsed = skemaMinat.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Periksa isian minat.', detail: parsed.error.flatten().fieldErrors }); return; }
    try {
      const minat = await ajukanMinat(db, parsed.data);
      if (!minat) {
        const ada = await db.query('SELECT id,status FROM tantangan WHERE id=$1', [parsed.data.tantanganId]);
        res.status(ada.rows.length ? 409 : 404).json({ error: !ada.rows.length ? 'Tantangan tidak ditemukan.' : ada.rows[0].status === 'ditutup' ? 'Tantangan sudah ditutup.' : 'Talenta ini sudah mengajukan minat pada tantangan yang sama.' });
        return;
      }
      res.status(201).json(minat);
    } catch (error) { next(error); }
  });
  app.get('/api/analitik', async (_req, res, next) => {
    try { res.json(await bacaAnalitik(db)); } catch (error) { next(error); }
  });
  app.get('/api/skill', async (_req, res, next) => {
    try { res.json(await daftarSkill(db)); } catch (error) { next(error); }
  });
  app.get('/api/tantangan', async (req, res, next) => {
    const filter = skemaFilterTantangan.safeParse(req.query);
    if (!filter.success) {
      res.status(400).json({ error: 'Filter tantangan tidak valid.', detail: filter.error.flatten() });
      return;
    }
    try { res.json(await daftarTantangan(db, filter.data)); } catch (error) { next(error); }
  });
  app.get('/api/talenta', async (_req, res, next) => {
    try { res.json(await daftarTalenta(db)); } catch (error) { next(error); }
  });
  app.get('/api/tantangan/:id', async (req, res, next) => {
    const id = skemaId.safeParse(req.params.id);
    if (!id.success) { res.status(400).json({ error: 'ID tantangan tidak valid.' }); return; }
    try {
      const [tantangan] = await daftarTantangan(db, { id: id.data, termasukDitutup: true });
      if (!tantangan) { res.status(404).json({ error: 'Tantangan tidak ditemukan.' }); return; }
      const talenta = await daftarTalenta(db);
      const detail: DetailTantangan = { tantangan, rekomendasi: rekomendasiTalenta(tantangan, talenta) };
      res.json(detail);
    } catch (error) { next(error); }
  });
  app.get('/api/talenta/:id', async (req, res, next) => {
    const id = skemaId.safeParse(req.params.id);
    if (!id.success) { res.status(400).json({ error: 'ID talenta tidak valid.' }); return; }
    try {
      const [talenta] = await daftarTalenta(db, id.data);
      if (!talenta) { res.status(404).json({ error: 'Talenta tidak ditemukan.' }); return; }
      const tantangan = await daftarTantangan(db);
      const rekomendasi = rekomendasiTantangan(talenta, tantangan);
      const detail: DetailTalenta = { talenta, rekomendasi, saranBelajar: saranBelajar(rekomendasi.map((r) => r.hasil)) };
      res.json(detail);
    } catch (error) { next(error); }
  });
  app.use((_req, res) => { res.status(404).json({ error: 'Endpoint tidak ditemukan.' }); });
  const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    void _next; // Express mengenali error middleware dari empat parameter.
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ error: 'Format JSON tidak valid.' });
      return;
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === '23505') { res.status(409).json({ error: 'Talenta ini sudah mengajukan minat pada tantangan yang sama.' }); return; }
      if (error.code === '23503') { res.status(400).json({ error: 'Organisasi, skill, atau talenta tidak ditemukan. Muat ulang data pilihan.' }); return; }
    }
    if (typeof error === 'object' && error !== null && 'status' in error && error.status === 413) {
      res.status(413).json({ error: 'Isian terlalu besar. Kurangi panjang pesan atau deskripsi.' }); return;
    }
    // Jangan menulis connection string atau detail query ke respons/log publik.
    console.error('Permintaan API gagal.');
    res.status(500).json({ error: 'Data belum dapat dimuat. Silakan coba lagi.' });
  };
  app.use(handleError);
  return app;
}
