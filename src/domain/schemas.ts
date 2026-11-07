import { z } from 'zod';

export const skemaFilterTantangan = z.object({
  bidang: z.enum(['web', 'data', 'iot', 'desain', 'ai']).optional(),
  skill: z.string().max(500).transform((value) =>
    [...new Set(value.split(',').map((id) => id.trim().toLowerCase()).filter(Boolean))],
  ).pipe(z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(40)).optional(),
});

export const skemaId = z.string().regex(/^[1-9][0-9]*$/)
  .transform(Number).pipe(z.number().int().positive().max(2_147_483_647));

const idPositif = z.number().int().positive('Pilih data yang valid.').max(2_147_483_647);
const slugSkill = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Skill tidak valid.');
const daftarSlug = z.array(slugSkill).max(5, 'Maksimal 5 skill.').refine((ids) => new Set(ids).size === ids.length, 'Skill tidak boleh berulang.');
export const skemaTantanganBaru = z.object({
  judul: z.string().trim().min(5, 'Judul minimal 5 karakter.').max(100, 'Judul maksimal 100 karakter.'),
  deskripsi: z.string().trim().min(20, 'Deskripsi minimal 20 karakter.').max(1000, 'Deskripsi maksimal 1000 karakter.'),
  organisasiId: idPositif,
  bidang: z.enum(['web', 'data', 'iot', 'desain', 'ai']),
  durasiBulan: z.number().int().min(1, 'Durasi minimal 1 bulan.').max(6, 'Durasi maksimal 6 bulan.'),
  skillWajib: daftarSlug.refine((ids) => ids.length > 0, 'Pilih minimal satu skill wajib.'),
  skillTambahan: daftarSlug,
}).refine((data) => !data.skillTambahan.some((id) => data.skillWajib.includes(id)), { message: 'Skill tambahan tidak boleh sama dengan skill wajib.', path: ['skillTambahan'] });
export const skemaMinat = z.object({
  tantanganId: idPositif, talentaId: idPositif,
  pesan: z.string().trim().max(1000, 'Pesan maksimal 1000 karakter.').optional().default(''),
});
export type TantanganBaru = z.infer<typeof skemaTantanganBaru>;
export type MinatBaru = z.infer<typeof skemaMinat>;
