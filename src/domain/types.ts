export type SkillId = string;
export type Bidang = 'web' | 'data' | 'iot' | 'desain' | 'ai';
export interface Skill { id: SkillId; nama: string; kategori: string }
export interface KebutuhanSkill { skillId: SkillId; wajib: boolean }
export interface SkillTalenta { skillId: SkillId; level: 1 | 2 | 3 }
export interface Tantangan {
  sumberUrl?: string | null;
  id: number; judul: string; deskripsi: string; bidang: Bidang;
  durasiBulan: number; status: 'terbuka' | 'ditutup'; dataContoh: boolean;
  dibuatPada: string; organisasi: { id: number; nama: string; kota: string; jenis: string; sumberUrl?: string | null };
  skill: (KebutuhanSkill & { nama: string })[]; jumlahMinat: number;
}
export interface Talenta {
  id: number; nama: string; peran: 'mahasiswa' | 'dosen'; prodi: string;
  kampus: string; bio: string; dataContoh: boolean; dibuatPada: string;
  skill: (SkillTalenta & { nama: string })[];
}
export interface HasilSkor {
  skor: number; wajibCocok: SkillId[]; wajibKurang: SkillId[]; tambahanCocok: SkillId[];
}

export interface DetailTantangan {
  tantangan: Tantangan;
  rekomendasi: { talenta: Talenta; hasil: HasilSkor }[];
}
export interface DetailTalenta {
  talenta: Talenta;
  rekomendasi: { tantangan: Tantangan; hasil: HasilSkor }[];
  saranBelajar: SkillId[];
}

export interface Analitik {
  ringkasan: { tantanganTerbuka: number; jumlahTalenta: number; jumlahMinat: number; persenPunyaKandidat: number };
  permintaanSkill: { skillId: string; nama: string; permintaan: number }[];
  kesenjanganSkill: { skillId: string; nama: string; permintaan: number; ketersediaan: number; rasio: number | null }[];
  tantanganPerBidang: { bidang: Bidang; nama: string; jumlah: number }[];
  funnel: { tahap: string; jumlah: number }[];
}
export interface Organisasi { id: number; nama: string; jenis: 'industri' | 'kampus'; kota: string }
