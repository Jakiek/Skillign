import { describe, expect, it } from 'vitest';
import { skemaTantanganBaru, skemaMinat } from './schemas';
const data = { judul: 'Portal data contoh', deskripsi: 'Deskripsi tantangan yang cukup panjang.', organisasiId: 1, bidang: 'web', durasiBulan: 2, skillWajib: ['react'], skillTambahan: [] };
describe('skema form bersama', () => {
  it('trim isian dan normalisasi slug', () => {
    expect(skemaTantanganBaru.parse({ ...data, judul: '  Judul contoh  ', skillWajib: [' REACT '] })).toMatchObject({ judul: 'Judul contoh', skillWajib: ['react'] });
  });
  it.each([
    { judul: 'abcd' }, { judul: 'a'.repeat(101) }, { deskripsi: 'terlalu pendek' }, { deskripsi: 'a'.repeat(1001) },
    { durasiBulan: 0 }, { durasiBulan: 7 }, { durasiBulan: 1.5 }, { organisasiId: 0 }, { bidang: 'asing' },
    { skillWajib: [] }, { skillWajib: ['react', 'REACT'] }, { skillWajib: ['react','sql','python','git','figma','docker'] },
    { skillTambahan: ['react'] }, { skillTambahan: ['git','git'] },
  ])('menolak isian invalid %j', (invalid) => { expect(skemaTantanganBaru.safeParse({ ...data, ...invalid }).success).toBe(false); });
  it('menerima batas panjang dan lima skill', () => {
    expect(skemaTantanganBaru.safeParse({ ...data, judul: 'a'.repeat(100), deskripsi: 'a'.repeat(1000), durasiBulan: 6, skillWajib: ['react','sql','python','git','figma'] }).success).toBe(true);
  });
  it('pesan minat opsional, tetapi tidak lebih dari 1000 karakter', () => {
    expect(skemaMinat.parse({ tantanganId: 1, talentaId: 2 }).pesan).toBe('');
    expect(skemaMinat.safeParse({ tantanganId: 1, talentaId: 2, pesan: 'a'.repeat(1001) }).success).toBe(false);
  });
});
