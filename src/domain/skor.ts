import type { HasilSkor, KebutuhanSkill, SkillId, SkillTalenta, Talenta, Tantangan } from './types.js';

const bobotLevel = { 1: 0.6, 2: 0.85, 3: 1 } as const;
const urutTeks = (a: string, b: string) => a.localeCompare(b, 'id');

export function hitungSkor(kebutuhan: readonly KebutuhanSkill[], skill: readonly SkillTalenta[]): HasilSkor {
  const wajib = new Set(kebutuhan.filter((s) => s.wajib).map((s) => s.skillId));
  const tambahan = new Set(kebutuhan.filter((s) => !s.wajib && !wajib.has(s.skillId)).map((s) => s.skillId));
  if (!wajib.size) throw new RangeError('Tantangan harus memiliki minimal satu skill wajib.');

  const dimiliki = new Map<SkillId, SkillTalenta['level']>();
  for (const s of skill) {
    // Data database sudah unik; deduplikasi tetap menjaga sifat himpunan fungsi ini.
    dimiliki.set(s.skillId, Math.max(dimiliki.get(s.skillId) ?? 1, s.level) as SkillTalenta['level']);
  }
  const wajibCocok = [...wajib].filter((id) => dimiliki.has(id)).sort(urutTeks);
  const wajibKurang = [...wajib].filter((id) => !dimiliki.has(id)).sort(urutTeks);
  const tambahanCocok = [...tambahan].filter((id) => dimiliki.has(id)).sort(urutTeks);
  const cakupanWajib = wajibCocok.reduce((total, id) => total + bobotLevel[dimiliki.get(id)!], 0) / wajib.size;
  const skor = Math.round(100 * (tambahan.size
    ? 0.8 * cakupanWajib + 0.2 * tambahanCocok.length / tambahan.size
    : cakupanWajib));
  return { skor, wajibCocok, wajibKurang, tambahanCocok };
}

function batas(n: number) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('Batas hasil harus bilangan bulat nonnegatif.');
  return n;
}

export function rekomendasiTalenta(tantangan: Pick<Tantangan, 'skill'>, semuaTalenta: readonly Talenta[], n = 5) {
  return semuaTalenta.map((talenta) => ({ talenta, hasil: hitungSkor(tantangan.skill, talenta.skill) }))
    .sort((a, b) => b.hasil.skor - a.hasil.skor || urutTeks(a.talenta.nama, b.talenta.nama) || a.talenta.id - b.talenta.id)
    .slice(0, batas(n));
}

export function rekomendasiTantangan(talenta: Pick<Talenta, 'skill'>, semuaTantangan: readonly Tantangan[], n = 5) {
  return semuaTantangan.filter((t) => t.status === 'terbuka')
    .map((tantangan) => ({ tantangan, hasil: hitungSkor(tantangan.skill, talenta.skill) }))
    .sort((a, b) => b.hasil.skor - a.hasil.skor || urutTeks(a.tantangan.judul, b.tantangan.judul) || a.tantangan.id - b.tantangan.id)
    .slice(0, batas(n));
}

export function saranBelajar(hasilTeratas: readonly HasilSkor[], n = 3): SkillId[] {
  const frekuensi = new Map<SkillId, number>();
  for (const hasil of hasilTeratas) {
    for (const id of new Set(hasil.wajibKurang)) frekuensi.set(id, (frekuensi.get(id) ?? 0) + 1);
  }
  return [...frekuensi].sort(([a, fa], [b, fb]) => fb - fa || urutTeks(a, b)).slice(0, batas(n)).map(([id]) => id);
}
