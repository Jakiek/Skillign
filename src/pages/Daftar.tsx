import { SumberData } from '../components/SumberData';
import { useSearchParams } from 'react-router-dom';
import type { Skill, Talenta, Tantangan } from '../domain/types';
import { useApi } from '../hooks/useApi';
import { Etat, Judul, Kosong } from '../components/Ui';
import { KartuTalenta, KartuTantangan } from '../components/Kartu';
import { FilterSkill } from '../components/FilterSkill';
export function HalamanTantangan() {
  const [params, setParams] = useSearchParams();
  const daftar = useApi<Tantangan[]>(`tantangan?${params.toString()}`);
  const skill = useApi<Skill[]>('skill');
  const selected = (params.get('skill') ?? '').split(',').filter(Boolean);
  const active = [
    ...(params.get('q') ? [{ label: `Pencarian: ${params.get('q')}`, key: 'q', value: '' }] : []),
    ...(params.get('bidang') ? [{ label: `Bidang: ${params.get('bidang')}`, key: 'bidang', value: '' }] : []),
    ...selected.map((id) => ({ label: skill.data?.find((s) => s.id === id)?.nama ?? id, key: 'skill', value: id })),
  ];
  function remove(key: string, value: string) {
    const next = new URLSearchParams(params);
    const remaining = selected.filter((id) => id !== value);
    if (key === 'skill' && remaining.length) next.set(key, remaining.join(',')); else next.delete(key);
    setParams(next);
  }
  return <><Judul title="Opportunities">Cari proyek berdasarkan topik, organisasi, dan skill yang dibutuhkan.</Judul>
    <div className="mb-6"><SumberData /></div><form role="search" className="mb-6 flex flex-wrap gap-3" onSubmit={(e) => { e.preventDefault(); const q = String(new FormData(e.currentTarget).get('q') ?? '').trim(); const next = new URLSearchParams(params); if (q) next.set('q', q); else next.delete('q'); setParams(next); }}><label className="sr-only" htmlFor="cari-tantangan">Cari judul atau organisasi</label><input key={params.get('q') ?? ''} id="cari-tantangan" name="q" type="search" maxLength={100} defaultValue={params.get('q') ?? ''} placeholder="Cari topik atau nama organisasi…" className="min-w-0 flex-1 rounded-xl border border-line bg-card px-4 py-3 text-sm" /><button className="button-primary" type="submit">Cari proyek</button></form><div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]"><aside><Etat {...skill}><FilterSkill skill={skill.data ?? []} /></Etat></aside><section aria-label="Daftar proyek">{active.length > 0 && <div aria-label="Filter aktif" className="mb-5 flex flex-wrap gap-2">{active.map((filter) => <button key={`${filter.key}-${filter.value}`} type="button" aria-label={`Hapus filter ${filter.label}`} onClick={() => remove(filter.key, filter.value)} className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs hover:border-brand"><span>{filter.label}</span><svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="m3 3 6 6 M9 3l-6 6" /></svg></button>)}</div>}<Etat {...daftar}>{daftar.data?.length ? <><p role="status" className="mb-4 text-sm text-muted">{daftar.data.length} proyek tersedia</p><div className="grid gap-4 xl:grid-cols-2">{daftar.data.map((t) => <KartuTantangan key={t.id} item={t} />)}</div></> : <Kosong><h2 className="font-semibold text-ink">Belum ada proyek yang sesuai</h2><p className="mt-2">Kurangi pilihan skill atau reset filter untuk melihat semua proyek.</p><button className="button-secondary mt-4" onClick={() => setParams({})}>Reset filter</button></Kosong>}</Etat></section></div></>;
}
export function HalamanTalenta() {
  const daftar = useApi<Talenta[]>('talenta');
  return <><Judul title="Talents">Jelajahi profil mahasiswa dan dosen, level skill, serta rekomendasi proyek yang sesuai.</Judul><Etat {...daftar}>{daftar.data?.length ? <><p className="mb-4 text-sm text-muted">{daftar.data.length} profil kandidat</p><div className="grid gap-4 md:grid-cols-2">{daftar.data.map((t) => <KartuTalenta key={t.id} item={t} />)}</div></> : <Kosong>Belum ada profil kandidat yang tersedia.</Kosong>}</Etat></>;
}
