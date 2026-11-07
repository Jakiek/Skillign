import { useState } from 'react';
import { DialogMinat } from '../components/DialogMinat';
import { Toast } from '../components/Toast';
import { Link, useParams, useLocation } from 'react-router-dom';
import type { DetailTalenta, DetailTantangan } from '../domain/types';
import { useApi } from '../hooks/useApi';
import { DataContoh, Etat, Kosong, SkillChip } from '../components/Ui';
import { labelBidang } from '../data/labels';
import { LevelSkill } from '../components/Kartu';
import { KartuRekomendasi } from '../components/KartuRekomendasi';

export function HalamanDetailTantangan() {
  const [dialog, setDialog] = useState(false);
  const [sukses, setSukses] = useState(0);
  const location = useLocation();
  const dibuat = (location.state as { sukses?: string } | null)?.sukses;
  const { id } = useParams();
  const api = useApi<DetailTantangan>(`tantangan/${encodeURIComponent(id ?? '')}`);
  const t = api.data?.tantangan;
  const names = Object.fromEntries(t?.skill.map((s) => [s.skillId, s.nama]) ?? []);
  return <>{dibuat && <Toast key={location.key} message={dibuat} />}{sukses > 0 && <Toast key={sukses} message="Minat berhasil dicatat sebagai data contoh." />}{dialog && t && <DialogMinat tantanganId={t.id} onClose={() => setDialog(false)} onSukses={() => { setDialog(false); setSukses((n) => n + 1); api.retry(); }} />}<Link className="mb-6 inline-block text-sm text-brand underline" to="/tantangan">Kembali ke tantangan</Link><Etat {...api}>{t && <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"><article className="card">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="text-sm text-brand">{labelBidang[t.bidang]} · {t.durasiBulan} bulan · {t.status === 'terbuka' ? 'Terbuka' : 'Ditutup'}</span>{t.dataContoh && <DataContoh />}</div>
    <h1 className="text-[32px] font-semibold leading-tight tracking-tight">{t.judul}</h1><p className="mt-3 text-muted">{t.organisasi.nama} · {t.organisasi.kota}</p>
    <h2 className="mb-3 mt-8 text-xl font-semibold">Tentang tantangan</h2><p className="whitespace-pre-wrap text-sm leading-7">{t.deskripsi}</p>
    {[true, false].map((wajib) => <section className="mt-8" key={String(wajib)}><h2 className="mb-3 font-semibold">{wajib ? 'Skill wajib' : 'Skill tambahan'}</h2><div className="flex flex-wrap gap-2">{t.skill.filter((s) => s.wajib === wajib).map((s) => <SkillChip key={s.skillId} variant={wajib ? 'wajib' : 'netral'}>{s.nama}</SkillChip>)}{!t.skill.some((s) => s.wajib === wajib) && <p className="text-sm text-muted">Tidak ada skill tambahan.</p>}</div></section>)}
    <p className="mt-8 border-t border-line pt-5 text-sm text-muted">{t.jumlahMinat} minat tercatat.</p><button type="button" disabled={t.status !== 'terbuka'} onClick={() => setDialog(true)} className="button-primary mt-4 disabled:opacity-50">{t.status === 'terbuka' ? 'Ajukan minat' : 'Tantangan sudah ditutup'}</button>
    </article><section aria-labelledby="kandidat"><h2 id="kandidat" className="text-xl font-semibold">5 kandidat paling cocok</h2><p className="mb-5 mt-2 text-sm leading-6 text-muted">Skor berdasarkan skill dan level. Nilai kecocokan bukan probabilitas keberhasilan.</p><div className="space-y-4">{api.data?.rekomendasi.length ? api.data.rekomendasi.map((r) => <KartuRekomendasi key={r.talenta.id} nama={r.talenta.nama} to={`/talenta/${r.talenta.id}`} hasil={r.hasil} skillNama={names} dataContoh={r.talenta.dataContoh} />) : <Kosong>Belum ada talenta untuk direkomendasikan.</Kosong>}</div></section></div>}</Etat></>;
}
export function HalamanDetailTalenta() {
  const { id } = useParams();
  const api = useApi<DetailTalenta>(`talenta/${encodeURIComponent(id ?? '')}`);
  const t = api.data?.talenta;
  const names = Object.fromEntries([...(t?.skill ?? []), ...(api.data?.rekomendasi.flatMap((r) => r.tantangan.skill) ?? [])].map((s) => [s.skillId, s.nama]));
  return <><Link className="mb-6 inline-block text-sm text-brand underline" to="/talenta">Kembali ke talenta</Link><Etat {...api}>{t && <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"><div><article className="card"><div className="mb-4 flex justify-between gap-2"><span className="text-sm capitalize text-brand">{t.peran}</span>{t.dataContoh && <DataContoh />}</div><h1 className="text-[32px] font-semibold leading-tight tracking-tight">{t.nama}</h1><p className="mt-3 leading-7 text-muted">{t.prodi} · {t.kampus}</p><p className="mt-6 whitespace-pre-wrap text-sm leading-7">{t.bio}</p><h2 className="mb-3 mt-8 text-xl font-semibold">Skill dan level</h2><div className="flex flex-wrap gap-2">{t.skill.map((s) => <SkillChip key={s.skillId}>{s.nama}<LevelSkill level={s.level} /></SkillChip>)}{!t.skill.length && <p className="text-sm text-muted">Belum ada skill yang dicatat.</p>}</div><p className="mt-4 text-xs leading-5 text-muted">Satu titik: dasar · Dua titik: menengah · Tiga titik: mahir</p></article><section className="mt-6 rounded-xl bg-brand-soft p-5"><h2 className="text-xl font-semibold">Saran belajar</h2><p className="mb-4 mt-2 text-sm leading-6 text-muted">Skill wajib yang paling sering belum dimiliki pada rekomendasi teratas.</p><div className="flex flex-wrap gap-2">{api.data?.saranBelajar.length ? api.data.saranBelajar.map((id) => <SkillChip key={id} variant="kurang">{names[id] ?? id}</SkillChip>) : <p className="text-sm">Tidak ada saran tambahan dari rekomendasi saat ini.</p>}</div></section></div><section aria-labelledby="peluang"><h2 id="peluang" className="text-xl font-semibold">5 tantangan paling cocok</h2><p className="mb-5 mt-2 text-sm leading-6 text-muted">Lihat kecocokanmu dan skill yang masih perlu dikembangkan.</p><div className="space-y-4">{api.data?.rekomendasi.length ? api.data.rekomendasi.map((r) => <KartuRekomendasi key={r.tantangan.id} nama={r.tantangan.judul} to={`/tantangan/${r.tantangan.id}`} hasil={r.hasil} skillNama={names} dataContoh={r.tantangan.dataContoh} />) : <Kosong>Belum ada tantangan terbuka untuk direkomendasikan.</Kosong>}</div></section></div>}</Etat></>;
}
