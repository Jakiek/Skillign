-- Jumlah tantangan terbuka yang membutuhkan setiap skill wajib.
CREATE VIEW v_permintaan_skill AS
SELECT ts.skill_id, s.nama, COUNT(*) AS permintaan
FROM tantangan_skill ts
JOIN tantangan t ON t.id = ts.tantangan_id AND t.status = 'terbuka'
JOIN skill s ON s.id = ts.skill_id
WHERE ts.wajib
GROUP BY ts.skill_id, s.nama;

-- Jumlah talenta yang memiliki setiap skill, pada semua level.
CREATE VIEW v_ketersediaan_skill AS
SELECT tk.skill_id, COUNT(*) AS ketersediaan
FROM talenta_skill tk
GROUP BY tk.skill_id;

-- Permintaan dibanding ketersediaan; rasio NULL berarti tidak ada talenta.
CREATE VIEW v_kesenjangan_skill AS
SELECT p.skill_id, p.nama, p.permintaan,
       COALESCE(k.ketersediaan, 0) AS ketersediaan,
       ROUND(p.permintaan::numeric / NULLIF(COALESCE(k.ketersediaan,0),0), 2) AS rasio
FROM v_permintaan_skill p
LEFT JOIN v_ketersediaan_skill k USING (skill_id);

-- Jumlah tantangan terbuka per bidang.
CREATE VIEW v_tantangan_per_bidang AS
SELECT bidang, COUNT(*) AS jumlah
FROM tantangan WHERE status = 'terbuka'
GROUP BY bidang;

-- Jumlah minat per tantangan; tantangan tanpa minat tetap bernilai nol.
CREATE VIEW v_minat_per_tantangan AS
SELECT t.id AS tantangan_id, t.judul, COUNT(m.id) AS jumlah_minat
FROM tantangan t LEFT JOIN minat m ON m.tantangan_id = t.id
GROUP BY t.id, t.judul;

-- Ringkasan program dan jumlah tantangan terbuka yang sudah memiliki minat.
CREATE VIEW v_ringkasan_program AS
SELECT (SELECT COUNT(*)::int FROM tantangan WHERE status = 'terbuka') AS tantangan_terbuka,
       (SELECT COUNT(*)::int FROM talenta) AS jumlah_talenta,
       (SELECT COUNT(*)::int FROM minat) AS jumlah_minat,
       (SELECT COUNT(*)::int FROM v_minat_per_tantangan vm
         JOIN tantangan t ON t.id = vm.tantangan_id
         WHERE t.status = 'terbuka' AND vm.jumlah_minat > 0) AS tantangan_punya_minat;
