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
  return <><Judul title="Tantangan">Temukan masalah untuk dikerjakan bersama. Pilih bidang dan skill untuk mempersempit peluang.</Judul>
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]"><aside><Etat {...skill}><FilterSkill skill={skill.data ?? []} /></Etat></aside><section aria-label="Daftar tantangan"><Etat {...daftar}>{daftar.data?.length ? <><p role="status" className="mb-4 text-sm text-muted">{daftar.data.length} tantangan terbuka</p><div className="space-y-4">{daftar.data.map((t) => <KartuTantangan key={t.id} item={t} />)}</div></> : <Kosong><h2 className="font-semibold text-ink">Belum ada tantangan yang sesuai</h2><p className="mt-2">Kurangi pilihan skill atau reset filter untuk melihat semua tantangan.</p><button className="button-secondary mt-4" onClick={() => setParams({})}>Reset filter</button></Kosong>}</Etat></section></div></>;
}
export function HalamanTalenta() {
  const daftar = useApi<Talenta[]>('talenta');
  return <><Judul title="Talenta">Kenali skill mahasiswa dan dosen untuk menemukan rekan yang sesuai dengan tantanganmu.</Judul><Etat {...daftar}>{daftar.data?.length ? <><p className="mb-4 text-sm text-muted">{daftar.data.length} profil talenta</p><div className="grid gap-4 md:grid-cols-2">{daftar.data.map((t) => <KartuTalenta key={t.id} item={t} />)}</div></> : <Kosong>Belum ada profil talenta yang tersedia.</Kosong>}</Etat></>;
}
