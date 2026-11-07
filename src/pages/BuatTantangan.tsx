import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Organisasi, Skill } from '../domain/types';
import { skemaTantanganBaru } from '../domain/schemas';
import { useApi } from '../hooks/useApi';
import { useSimpan } from '../hooks/useSimpan';
import { Etat, Judul } from '../components/Ui';
import { labelBidang } from '../data/labels';
export function BuatTantangan() {
  const organisasi = useApi<Organisasi[]>('organisasi');
  const skill = useApi<Skill[]>('skill');
  const mutation = useSimpan('tantangan');
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [wajib, setWajib] = useState<string[]>([]);
  const [tambahan, setTambahan] = useState<string[]>([]);
  const fieldError = (name: string) => (errors[name] ?? mutation.fields[name])?.[0];
  const pesan = (name: string) => fieldError(name) ? <p aria-live="polite" id={`${name}-error`} className="mt-2 text-sm text-warning">{fieldError(name)}</p> : null;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const parsed = skemaTantanganBaru.safeParse({ judul: f.get('judul'), deskripsi: f.get('deskripsi'), organisasiId: Number(f.get('organisasiId')), bidang: f.get('bidang'), durasiBulan: Number(f.get('durasiBulan')), skillWajib: wajib, skillTambahan: tambahan });
    if (!parsed.success) { const fields = parsed.error.flatten().fieldErrors;
      setErrors(fields);
      const first = form.elements.namedItem(Object.keys(fields)[0]);
      if (first instanceof HTMLElement) first.focus();
      else if (first instanceof RadioNodeList) (first[0] as HTMLElement | undefined)?.focus();
      return; }
    setErrors({});
    const saved = await mutation.simpan<{ id: number }>(parsed.data);
    if (saved) navigate(`/tantangan/${saved.id}`, { state: { sukses: 'Proyek berhasil disimpan sebagai Data contoh.' } });
  }
  return <div className="mx-auto max-w-[720px]"><Judul title="New opportunity">Tentukan tujuan proyek dan skill yang dibutuhkan. Proyek ini akan disimpan sebagai Data contoh.</Judul><Etat loading={organisasi.loading || skill.loading} error={organisasi.error ?? skill.error} retry={() => { organisasi.retry(); skill.retry(); }}><form autoComplete="off" noValidate onSubmit={submit} className="card space-y-6"><fieldset disabled={mutation.pending} className="space-y-6">
    {([{ name: 'judul', label: 'Judul', max: 100 }, { name: 'deskripsi', label: 'Deskripsi', max: 1000 }] as const).map((f) => <div key={f.name}><label className="form-label" htmlFor={f.name}>{f.label}</label>{f.name === 'deskripsi' ? <textarea id={f.name} name={f.name} rows={5} maxLength={f.max} required aria-invalid={!!fieldError(f.name)} aria-describedby={fieldError(f.name) ? `${f.name}-error` : undefined} className="form-input" /> : <input id={f.name} name={f.name} maxLength={f.max} required aria-invalid={!!fieldError(f.name)} aria-describedby={fieldError(f.name) ? `${f.name}-error` : undefined} className="form-input" />}{pesan(f.name)}</div>)}
    <div><label className="form-label" htmlFor="organisasiId">Organisasi contoh</label><select id="organisasiId" name="organisasiId" className="form-input" required aria-invalid={!!fieldError('organisasiId')} aria-describedby={fieldError('organisasiId') ? 'organisasiId-error' : undefined}><option value="">Pilih organisasi</option>{organisasi.data?.map((o) => <option key={o.id} value={o.id}>{o.nama} · {o.kota}</option>)}</select>{pesan('organisasiId')}</div>
    <div className="grid gap-6 sm:grid-cols-2"><div><label className="form-label" htmlFor="bidang">Bidang</label><select className="form-input" id="bidang" name="bidang" aria-invalid={!!fieldError('bidang')} aria-describedby={fieldError('bidang') ? 'bidang-error' : undefined}>{Object.entries(labelBidang).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>{pesan('bidang')}</div><div><label className="form-label" htmlFor="durasiBulan">Durasi (bulan)</label><input type="number" required inputMode="numeric" min={1} max={6} defaultValue={1} id="durasiBulan" name="durasiBulan" className="form-input" aria-invalid={!!fieldError('durasiBulan')} aria-describedby={fieldError('durasiBulan') ? 'durasiBulan-error' : undefined} />{pesan('durasiBulan')}</div></div>
    {([{ title: 'Skill wajib (1–5)', name: 'skillWajib', selected: wajib, set: setWajib, other: tambahan }, { title: 'Skill tambahan (0–5)', name: 'skillTambahan', selected: tambahan, set: setTambahan, other: wajib }] as const).map((g) => <fieldset key={g.name} aria-describedby={`${g.name}-error`}><legend className="form-label">{g.title}</legend><div className="mt-3 flex flex-wrap gap-2">{skill.data?.map((s) => <label key={s.id} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${g.selected.includes(s.id) ? 'border-brand bg-brand-soft' : 'border-line'} ${g.other.includes(s.id) ? 'opacity-50' : ''}`}><input type="checkbox" name={g.name} aria-invalid={!!fieldError(g.name)} checked={g.selected.includes(s.id)} disabled={g.other.includes(s.id) || (!g.selected.includes(s.id) && g.selected.length >= 5)} onChange={() => g.set(g.selected.includes(s.id) ? g.selected.filter((id) => id !== s.id) : [...g.selected, s.id])} />{s.nama}</label>)}</div>{pesan(g.name)}</fieldset>)}
    </fieldset>{mutation.error && <p role="alert" className="text-sm text-warning">{mutation.error}</p>}<button disabled={mutation.pending} className="button-primary disabled:opacity-50" type="submit">{mutation.pending ? 'Menyimpan…' : 'Simpan proyek'}</button></form></Etat></div>;
}
