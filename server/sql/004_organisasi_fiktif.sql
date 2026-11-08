-- Data contoh tidak lagi merujuk sumber eksternal; tandai tantangan buatan pengunjung.
ALTER TABLE organisasi DROP COLUMN IF EXISTS sumber_url;
ALTER TABLE tantangan  DROP COLUMN IF EXISTS sumber_url;
ALTER TABLE tantangan  ADD COLUMN IF NOT EXISTS dibuat_pengunjung BOOLEAN NOT NULL DEFAULT FALSE;
