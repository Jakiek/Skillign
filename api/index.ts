import type { Request, Response } from 'express';
import { createApp } from '../server/app';
import { getPool } from '../server/db';

let app: ReturnType<typeof createApp> | undefined;

// Lazy initialization menjaga kegagalan konfigurasi tetap berupa JSON.
export default function handler(req: Request, res: Response) {
  try { app ??= createApp(getPool()); return app(req, res); }
  catch { res.status(503).json({ error: 'Layanan data belum tersedia.' }); }
}
