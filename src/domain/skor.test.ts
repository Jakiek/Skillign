import { describe, expect, it } from 'vitest';
import { hitungSkor, rekomendasiTalenta, rekomendasiTantangan, saranBelajar } from './skor';
import type { KebutuhanSkill, SkillTalenta, Talenta, Tantangan } from './types';

const wajib: KebutuhanSkill[] = [{ skillId: 'react', wajib: true }, { skillId: 'sql', wajib: true }];
const kebutuhan = [...wajib, { skillId: 'figma', wajib: false }];
const mahir: SkillTalenta[] = [{ skillId: 'react', level: 3 }, { skillId: 'sql', level: 3 }];
const talenta = (id: number, nama: string, skill = mahir): Talenta => ({
  id, nama, skill: skill.map((s) => ({ ...s, nama: s.skillId })), peran: 'mahasiswa', prodi: 'TI',
  kampus: 'Kampus Contoh', bio: '', dataContoh: true, dibuatPada: '2026-01-01T00:00:00Z',
});
const tantangan = (id: number, judul: string): Tantangan => ({
  id, judul, skill: wajib.map((s) => ({ ...s, nama: s.skillId })), deskripsi: 'Data contoh', bidang: 'web',
  durasiBulan: 2, status: 'terbuka', dataContoh: true, dibuatPada: '2026-01-01T00:00:00Z',
  organisasi: { id: 1, nama: 'Organisasi Contoh', kota: 'Yogyakarta', jenis: 'industri' }, jumlahMinat: 0,
});

describe('hitungSkor', () => {
  it('semua wajib mahir tanpa tambahan bernilai 100', () => { expect(hitungSkor(wajib, mahir).skor).toBe(100); });
  it('tanpa wajib cocok, kontribusi tambahan maksimal 20', () => {
    expect(hitungSkor(kebutuhan, [{ skillId: 'figma', level: 1 }])).toEqual({ skor: 20, wajibCocok: [], wajibKurang: ['react', 'sql'], tambahanCocok: ['figma'] });
  });
  it('separuh wajib mahir bernilai 40 bila ada kebutuhan tambahan', () => { expect(hitungSkor(kebutuhan, mahir.slice(0, 1)).skor).toBe(40); });
  it('level dasar menerapkan bobot 0.6', () => { expect(hitungSkor(wajib, mahir.map((s) => ({ ...s, level: 1 }))).skor).toBe(60); });
  it('level menengah menerapkan bobot 0.85', () => { expect(hitungSkor(wajib, mahir.map((s) => ({ ...s, level: 2 }))).skor).toBe(85); });
  it('tanpa tambahan memindahkan bobot ke wajib', () => { expect(hitungSkor(wajib, mahir.slice(0, 1)).skor).toBe(50); });
  it('skill di luar kebutuhan tidak menurunkan skor', () => { expect(hitungSkor(wajib, [...mahir, { skillId: 'docker', level: 3 }])).toEqual(hitungSkor(wajib, mahir)); });
  it('alasan hanya berisi skill wajib yang tepat', () => { expect(hitungSkor(kebutuhan, mahir.slice(0, 1))).toEqual({ skor: 40, wajibCocok: ['react'], wajibKurang: ['sql'], tambahanCocok: [] }); });
  it('membulatkan contoh hitung manual menjadi 94', () => {
    expect(hitungSkor(kebutuhan, [{ skillId: 'react', level: 3 }, { skillId: 'sql', level: 2 }, { skillId: 'figma', level: 1 }]).skor).toBe(94);
  });
  it('tanpa skill talenta bernilai nol', () => { expect(hitungSkor(kebutuhan, []).skor).toBe(0); });
  it('menolak kebutuhan tanpa wajib agar tidak menghasilkan NaN', () => { expect(() => hitungSkor([], [])).toThrow(RangeError); });
  it('duplikat tidak menggandakan kontribusi dan wajib mendahului tambahan', () => {
    expect(hitungSkor([...wajib, ...wajib, { skillId: 'react', wajib: false }], [...mahir, { skillId: 'react', level: 1 }])).toEqual(hitungSkor(wajib, mahir));
  });
});

describe('rekomendasi dan saran belajar', () => {
  it('skor turun lalu nama naik; nama identik memakai ID', () => {
    const input = [talenta(3, 'Bima'), talenta(2, 'Aruna'), talenta(1, 'Aruna'), talenta(4, 'Adit', [])];
    const urutan = [1, 2, 3, 4];
    expect(rekomendasiTalenta(tantangan(1, 'Portal'), input).map((r) => r.talenta.id)).toEqual(urutan);
    expect(rekomendasiTalenta(tantangan(1, 'Portal'), [...input].reverse()).map((r) => r.talenta.id)).toEqual(urutan);
    expect(input.map((t) => t.id)).toEqual([3, 2, 1, 4]);
  });
  it('membatasi hasil ke lima atau batas yang dipilih', () => {
    const input = Array.from({ length: 8 }, (_, i) => talenta(i, `Nama ${i}`));
    expect(rekomendasiTalenta(tantangan(1, 'Portal'), input)).toHaveLength(5);
    expect(rekomendasiTalenta(tantangan(1, 'Portal'), input, 2)).toHaveLength(2);
    expect(rekomendasiTalenta(tantangan(1, 'Portal'), input, 0)).toEqual([]);
  });
  it('tantangan berurutan skor turun lalu judul, dengan ID sebagai pemecah seri terakhir', () => {
    const input = [tantangan(3, 'Zebra'), tantangan(2, 'Analitik'), tantangan(1, 'Analitik')];
    expect(rekomendasiTantangan(talenta(1, 'Aruna'), input).map((r) => r.tantangan.id)).toEqual([1, 2, 3]);
    expect(rekomendasiTantangan(talenta(1, 'Aruna'), [...input].reverse()).map((r) => r.tantangan.id)).toEqual([1, 2, 3]);
  });
  it('tantangan ditutup tidak direkomendasikan', () => {
    expect(rekomendasiTantangan(talenta(1, 'Aruna'), [{ ...tantangan(1, 'Portal'), status: 'ditutup' }])).toEqual([]);
  });
  it('koleksi kosong menghasilkan rekomendasi kosong', () => {
    expect(rekomendasiTalenta(tantangan(1, 'Portal'), [])).toEqual([]);
    expect(rekomendasiTantangan(talenta(1, 'Aruna'), [])).toEqual([]);
  });
  it('saran belajar diurutkan frekuensi turun lalu slug naik, maksimal tiga', () => {
    const hasil = [['sql', 'python', 'react'], ['sql', 'figma'], ['python', 'docker']]
      .map((wajibKurang) => ({ skor: 0, wajibCocok: [], tambahanCocok: [], wajibKurang }));
    expect(saranBelajar(hasil)).toEqual(['python', 'sql', 'docker']);
    expect(saranBelajar(hasil, 1)).toEqual(['python']);
    expect(saranBelajar([])).toEqual([]);
  });
});
