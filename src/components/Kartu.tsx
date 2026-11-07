import { Link } from 'react-router-dom';
import type { Talenta, Tantangan } from '../domain/types';
import { DataContoh, SkillChip } from './Ui';
import { labelBidang } from '../data/labels';
export function LevelSkill({ level }: { level: 1 | 2 | 3 }) {
  const label = ['Dasar', 'Menengah', 'Mahir'][level - 1];
  return <span title={label} aria-label={`Level ${label}`} className="ml-1 tracking-wide text-brand">{'●'.repeat(level)}{'○'.repeat(3 - level)}</span>;
}
export function KartuTantangan({ item }: { item: Tantangan }) {
  return <article className="card hover:shadow-sm">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold text-brand">{labelBidang[item.bidang]} · {item.durasiBulan} bulan</span>{item.dataContoh && <DataContoh />}</div>
    <h2 className="text-lg font-semibold leading-7"><Link className="hover:text-brand hover:underline" to={`/tantangan/${item.id}`}>{item.judul}</Link></h2>
    <p className="mt-1 text-sm text-muted">{item.organisasi.nama} · {item.organisasi.kota}</p>
    <div className="my-4 flex flex-wrap gap-2">{item.skill.slice(0, 5).map((s) => <SkillChip key={s.skillId} variant={s.wajib ? 'wajib' : 'netral'}>{s.nama}</SkillChip>)}{item.skill.length > 5 && <SkillChip>+{item.skill.length - 5}</SkillChip>}</div>
    <p className="text-xs text-muted">{item.jumlahMinat} minat tercatat</p>
  </article>;
}
export function KartuTalenta({ item }: { item: Talenta }) {
  return <article className="card hover:shadow-sm"><div className="mb-3 flex justify-between gap-2"><span className="text-xs capitalize text-brand">{item.peran}</span>{item.dataContoh && <DataContoh />}</div>
    <h2 className="text-lg font-semibold"><Link className="hover:text-brand hover:underline" to={`/talenta/${item.id}`}>{item.nama}</Link></h2>
    <p className="mt-1 text-sm leading-6 text-muted">{item.prodi} · {item.kampus}</p>
    <div className="mt-4 flex flex-wrap gap-2">{item.skill.slice(0, 5).map((s) => <SkillChip key={s.skillId}>{s.nama}<LevelSkill level={s.level} /></SkillChip>)}{item.skill.length > 5 && <SkillChip>+{item.skill.length - 5}</SkillChip>}</div>
  </article>;
}
