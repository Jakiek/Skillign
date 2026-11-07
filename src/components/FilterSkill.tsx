import { useId, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Skill } from '../domain/types';
import { labelBidang } from '../data/labels';
export function FilterSkill({ skill }: { skill: Skill[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const [params, setParams] = useSearchParams();
  const selected = params.get('skill')?.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) ?? [];
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }
  return <div className="rounded-xl border border-line bg-card p-5">
    <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)} className="w-full text-left font-semibold md:hidden">Filter tantangan</button>
    <div id={panelId} className={`${open ? 'block' : 'hidden'} pt-4 md:block md:pt-0`}><div className="mb-5 flex items-center justify-between gap-2"><h2 className="font-semibold">Filter</h2><button className="text-sm text-brand underline" onClick={() => setParams({})}>Reset filter</button></div>
      <label className="block text-sm font-semibold" htmlFor="bidang">Bidang</label>
      <select id="bidang" className="mt-2 w-full rounded-lg border border-line bg-card p-2 text-sm" value={params.get('bidang') ?? ''} onChange={(e) => update('bidang', e.target.value)}><option value="">Semua bidang</option>{Object.entries(labelBidang).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
      <fieldset className="mt-6"><legend className="text-sm font-semibold">Skill yang dibutuhkan</legend><p className="mb-3 mt-2 text-xs leading-5 text-muted">Menampilkan tantangan yang memuat semua skill pilihanmu.</p><div className="flex flex-wrap gap-2">{skill.map((s) => <label key={s.id} className={`relative cursor-pointer rounded-full border px-2.5 py-1.5 text-xs ${selected.includes(s.id) ? 'border-brand bg-brand-soft text-brand' : 'border-line'}`}><input type="checkbox" className="peer sr-only" checked={selected.includes(s.id)} onChange={() => update('skill', (selected.includes(s.id) ? selected.filter((id) => id !== s.id) : [...selected, s.id]).join(','))} /><span className="peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand">{s.nama}</span></label>)}</div></fieldset>
    </div></div>;
}
