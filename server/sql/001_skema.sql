CREATE TABLE skill (
  id        TEXT PRIMARY KEY,            -- slug huruf kecil, mis. 'react', 'sql', 'figma'
  nama      TEXT NOT NULL,               -- tampilan, mis. 'React'
  kategori  TEXT NOT NULL                -- 'web' | 'data' | 'desain' | 'hardware' | 'manajemen'
);

CREATE TABLE organisasi (
  id     SERIAL PRIMARY KEY,
  nama   TEXT NOT NULL,
  jenis  TEXT NOT NULL CHECK (jenis IN ('industri','kampus')),
  kota   TEXT NOT NULL
);

CREATE TABLE tantangan (
  id             SERIAL PRIMARY KEY,
  organisasi_id  INT NOT NULL REFERENCES organisasi(id),
  judul          TEXT NOT NULL,
  deskripsi      TEXT NOT NULL,
  bidang         TEXT NOT NULL,          -- 'web' | 'data' | 'iot' | 'desain' | 'ai'
  durasi_bulan   INT  NOT NULL CHECK (durasi_bulan BETWEEN 1 AND 6),
  status         TEXT NOT NULL DEFAULT 'terbuka' CHECK (status IN ('terbuka','ditutup')),
  data_contoh    BOOLEAN NOT NULL DEFAULT TRUE,
  dibuat_pada    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tantangan_skill (
  tantangan_id  INT  NOT NULL REFERENCES tantangan(id) ON DELETE CASCADE,
  skill_id      TEXT NOT NULL REFERENCES skill(id),
  wajib         BOOLEAN NOT NULL,
  PRIMARY KEY (tantangan_id, skill_id)
);

CREATE TABLE talenta (
  id           SERIAL PRIMARY KEY,
  nama         TEXT NOT NULL,
  peran        TEXT NOT NULL CHECK (peran IN ('mahasiswa','dosen')),
  prodi        TEXT NOT NULL,
  kampus       TEXT NOT NULL,
  bio          TEXT NOT NULL DEFAULT '',
  data_contoh  BOOLEAN NOT NULL DEFAULT TRUE,
  dibuat_pada  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE talenta_skill (
  talenta_id  INT  NOT NULL REFERENCES talenta(id) ON DELETE CASCADE,
  skill_id    TEXT NOT NULL REFERENCES skill(id),
  level       INT  NOT NULL CHECK (level BETWEEN 1 AND 3),   -- 1 dasar, 2 menengah, 3 mahir
  PRIMARY KEY (talenta_id, skill_id)
);

CREATE TABLE minat (
  id            SERIAL PRIMARY KEY,
  tantangan_id  INT NOT NULL REFERENCES tantangan(id) ON DELETE CASCADE,
  talenta_id    INT NOT NULL REFERENCES talenta(id)   ON DELETE CASCADE,
  pesan         TEXT NOT NULL DEFAULT '',
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tantangan_id, talenta_id)
);

CREATE INDEX idx_tantangan_organisasi ON tantangan(organisasi_id);
CREATE INDEX idx_tantangan_skill_skill ON tantangan_skill(skill_id);
CREATE INDEX idx_talenta_skill_skill ON talenta_skill(skill_id);
CREATE INDEX idx_minat_talenta ON minat(talenta_id);
