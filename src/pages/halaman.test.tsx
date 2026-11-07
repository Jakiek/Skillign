// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { App } from '../App';
import type { Analitik, DetailTalenta, DetailTantangan, Talenta, Tantangan } from '../domain/types';

const skill = [{ id: 'react', nama: 'React', kategori: 'web' }, { id: 'sql', nama: 'SQL', kategori: 'data' }];
const tantangan: Tantangan = { id: 1, judul: 'Portal pemesanan bahan', deskripsi: 'Bangun prototipe pemesanan menggunakan data sintetis.', bidang: 'web', durasiBulan: 3, status: 'terbuka', dataContoh: true, dibuatPada: '2026-01-01', organisasi: { id: 1, nama: 'Reka Contoh', kota: 'Yogyakarta', jenis: 'industri' }, jumlahMinat: 2, skill: [{ skillId: 'react', nama: 'React', wajib: true }, { skillId: 'sql', nama: 'SQL', wajib: true }] };
const talenta: Talenta = { id: 1, nama: 'Aruna Contoh', peran: 'mahasiswa', prodi: 'TI', kampus: 'Kampus Contoh', bio: 'Profil fiktif', dataContoh: true, dibuatPada: '2026-01-01', skill: [{ skillId: 'react', nama: 'React', level: 3 }] };
const hasil = { skor: 40, wajibCocok: ['react'], wajibKurang: ['sql'], tambahanCocok: [] };
const detailTantangan: DetailTantangan = { tantangan, rekomendasi: [{ talenta, hasil }] };
const detailTalenta: DetailTalenta = { talenta, rekomendasi: [{ tantangan, hasil }], saranBelajar: ['sql'] };
const analitik: Analitik = {
  ringkasan: { tantanganTerbuka: 30, jumlahTalenta: 60, jumlahMinat: 40, persenPunyaKandidat: 60 },
  permintaanSkill: [{ skillId: 'react', nama: 'React', permintaan: 6 }],
  kesenjanganSkill: [{ skillId: 'react', nama: 'React', permintaan: 6, ketersediaan: 0, rasio: null }],
  tantanganPerBidang: [{ bidang: 'web', nama: 'Web', jumlah: 6 }],
  funnel: [{ tahap: 'Proyek terbuka', jumlah: 30 }, { tahap: 'Punya kandidat ≥60', jumlah: 18 }, { tahap: 'Punya minat', jumlah: 20 }],
};
function mockApi() {
  return vi.stubGlobal('fetch', vi.fn(async (input: string) => {
    const url = new URL(input, 'http://localhost');
    let data: unknown;
    if (url.pathname === '/api/organisasi') data = [{ id: 1, nama: 'Reka Contoh', kota: 'Yogyakarta', jenis: 'industri' }];
    else if (url.pathname === '/api/analitik') data = analitik;
    else if (url.pathname === '/api/skill') data = skill;
    else if (url.pathname === '/api/tantangan') data = url.searchParams.get('skill')?.includes('sql') ? [] : [tantangan];
    else if (url.pathname === '/api/talenta') data = [talenta];
    else if (url.pathname === '/api/tantangan/1') data = detailTantangan;
    else if (url.pathname === '/api/talenta/1') data = detailTalenta;
    else return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => data };
  }));
}
function Location() { const location = useLocation(); return <output aria-label="URL saat ini">{location.pathname}{location.search}</output>; }
function mount(path: string) { return render(<MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /><Location /></MemoryRouter>); }
beforeEach(() => {
  // Vitest/Node 25 expose uninitialized native storage; provide a browser Storage fixture.
  const entries = new Map<string, string>();
  const storage: Storage = {
    get length() { return entries.size; },
    clear: () => entries.clear(),
    key: (index) => [...entries.keys()][index] ?? null,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, String(value)); },
    removeItem: (key) => { entries.delete(key); },
  };
  Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
  vi.stubGlobal('scrollTo', vi.fn());
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

// jsdom belum menyediakan dialog native; simulasi hanya membuka/menutup, bukan focus trap browser.
Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', ''); } });
Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open'); } });

describe('halaman Skillign', () => {
  it('tema gelap bisa diaktifkan dan pilihannya disimpan', async () => {
    mockApi(); const user = userEvent.setup(); mount('/talenta');
    const toggle = screen.getByRole('button', { name: 'Tampilan gelap' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await user.click(toggle);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('skillign-theme')).toBe('dark');
    await user.click(toggle);
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('chip filter bisa dihapus satu per satu tanpa menghilangkan filter lain', async () => {
    mockApi(); const user = userEvent.setup(); mount('/tantangan?bidang=web&skill=react,sql');
    await user.click(await screen.findByRole('button', { name: 'Hapus filter React' }));
    expect(screen.getByLabelText('URL saat ini').textContent).toBe('/tantangan?bidang=web&skill=sql');
    expect(screen.getByRole('button', { name: 'Hapus filter SQL' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hapus filter Bidang: web' })).toBeTruthy();
  });
  it('pencarian beranda membuka daftar dengan query yang diketik', async () => {
    mockApi(); const user = userEvent.setup(); mount('/');
    await user.type(screen.getByRole('searchbox', { name: 'Cari judul atau organisasi' }), 'JALA');
    await user.click(screen.getByRole('button', { name: 'Cari proyek' }));
    await screen.findByRole('heading', { name: 'Opportunities', level: 1 });
    expect(screen.getByLabelText('URL saat ini').textContent).toBe('/tantangan?q=JALA');
  });
  it('pencarian menyimpan q dalam URL, menjaga filter, dan reset membersihkan isian', async () => {
    mockApi(); const user = userEvent.setup(); mount('/tantangan?bidang=web');
    await screen.findByRole('link', { name: 'Portal pemesanan bahan' });
    const input = screen.getByRole('searchbox', { name: 'Cari judul atau organisasi' });
    await user.type(input, '  Portal  ');
    await user.click(screen.getByRole('button', { name: 'Cari proyek' }));
    await waitFor(() => expect(screen.getByLabelText('URL saat ini').textContent).toBe('/tantangan?bidang=web&q=Portal'));
    await user.click(screen.getByRole('button', { name: 'Filter proyek' }));
    await user.click(screen.getByRole('checkbox', { name: 'React' }));
    await waitFor(() => expect(screen.getByLabelText('URL saat ini').textContent).toContain('q=Portal&skill=react'));
    await user.click(screen.getByRole('button', { name: 'Reset filter' }));
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
  });
  it('hanya navigasi Buat tantangan yang aktif saat form dibuka', async () => {
    mockApi(); mount('/tantangan/baru');
    await screen.findByLabelText('Judul');
    const nav = screen.getByRole('navigation', { name: 'Navigasi utama' });
    expect(within(nav).getByRole('link', { name: 'New opportunity' }).getAttribute('aria-current')).toBe('page');
    expect(within(nav).getByRole('link', { name: 'Opportunities' }).hasAttribute('aria-current')).toBe(false);
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });
  it('navigasi memperbarui judul dokumen dan fokus konten, filter mempertahankan fokus', async () => {
    mockApi(); const user = userEvent.setup(); mount('/talenta');
    await screen.findByRole('link', { name: 'Aruna Contoh' });
    await user.click(screen.getByRole('link', { name: 'Opportunities' }));
    await screen.findByRole('link', { name: 'Portal pemesanan bahan' });
    expect(document.activeElement).toBe(screen.getByRole('main'));
    await waitFor(() => expect(document.title).toBe('Opportunities · Skillign'));
    await user.click(screen.getByRole('button', { name: 'Filter proyek' }));
    const input = screen.getByRole('checkbox', { name: 'React' });
    await user.click(input);
    await waitFor(() => expect(screen.getByLabelText('URL saat ini').textContent).toContain('skill=react'));
    expect(document.activeElement).toBe(input);
  });
  it('form memvalidasi lalu menyimpan dan membuka detail rekomendasi', async () => {
    mockApi(); const impl = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) => init?.method === 'POST' ? Promise.resolve({ ok: true, json: async () => ({ id: 1 }) } as Response) : impl(input, init));
    const user = userEvent.setup(); mount('/tantangan/baru');
    await screen.findByLabelText('Judul');
    await user.click(screen.getByRole('button', { name: 'Simpan proyek' }));
    expect(screen.getByText('Judul minimal 5 karakter.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Judul'));
    expect(screen.getByLabelText('Judul').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Pilih minimal satu skill wajib.')).toBeTruthy();
    await user.type(screen.getByLabelText('Judul'), 'Portal contoh baru');
    await user.type(screen.getByLabelText('Deskripsi'), 'Bangun katalog produk dengan data contoh sintetis.');
    await user.selectOptions(screen.getByLabelText('Organisasi contoh'), '1');
    await user.click(screen.getAllByRole('checkbox', { name: 'React' })[0]);
    expect((screen.getAllByRole('checkbox', { name: 'React' })[1] as HTMLInputElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Simpan proyek' }));
    await screen.findByRole('heading', { name: 'Portal pemesanan bahan' });
    expect(screen.getByText('Proyek berhasil disimpan sebagai Data contoh.')).toBeTruthy();
    const call = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ organisasiId: 1, skillWajib: ['react'], skillTambahan: [] });
  });
  it('dialog minat menampilkan konflik tanpa menutup atau menghapus pilihan', async () => {
    mockApi(); const impl = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) => init?.method === 'POST' ? Promise.resolve({ ok: false, status: 409, json: async () => ({ error: 'Talenta ini sudah mengajukan minat pada tantangan yang sama.' }) } as Response) : impl(input, init));
    const user = userEvent.setup(); mount('/tantangan/1');
    const trigger = await screen.findByRole('button', { name: 'Ajukan minat' });
    await user.click(trigger);
    await screen.findByLabelText('Kandidat', { selector: 'select' });
    await user.selectOptions(screen.getByLabelText('Kandidat', { selector: 'select' }), '1');
    await user.click(screen.getByRole('button', { name: 'Kirim minat' }));
    expect((await screen.findByRole('alert')).textContent).toContain('sudah mengajukan minat');
    expect((screen.getByLabelText('Kandidat', { selector: 'select' }) as HTMLSelectElement).value).toBe('1');
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it('pengajuan minat sukses menutup dialog, memuat ulang detail dan memberi status', async () => {
    mockApi(); const impl = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) => init?.method === 'POST' ? Promise.resolve({ ok: true, json: async () => ({ id: 41 }) } as Response) : impl(input, init));
    const user = userEvent.setup(); mount('/tantangan/1');
    await user.click(await screen.findByRole('button', { name: 'Ajukan minat' }));
    await screen.findByLabelText('Kandidat', { selector: 'select' });
    await user.click(screen.getByRole('button', { name: 'Kirim minat' }));
    expect(screen.getByText('Pilih satu kandidat.')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('Kandidat', { selector: 'select' }), '1');
    await user.click(screen.getByRole('button', { name: 'Kirim minat' }));
    await screen.findByText('Minat berhasil dicatat sebagai data contoh.');
    expect(screen.queryByRole('dialog')).toBeNull();
    await screen.findByRole('heading', { name: 'Portal pemesanan bahan' });
    expect(vi.mocked(fetch).mock.calls.filter(([path]) => path === '/api/tantangan/1').length).toBeGreaterThan(1);
  });
  it('analitik menampilkan empat grafik, ringkasan dan tabel data aksesibel', async () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    mockApi(); const user = userEvent.setup(); mount('/analitik');
    await screen.findByRole('heading', { name: 'Kesenjangan skill' });
    expect(screen.getByText('60%')).toBeTruthy();
    for (const title of ['10 skill paling dicari', 'Kesenjangan skill', 'Proyek per bidang', 'Corong kolaborasi']) {
      await user.click(screen.getByText(`Lihat tabel data: ${title}`));
    }
    expect(screen.getAllByRole('table')).toHaveLength(4);
    expect(screen.getByText('Tanpa talenta')).toBeTruthy();
    expect(screen.getByText(/Dua kelompok terakhir dihitung mandiri/)).toBeTruthy();
  });
  it('beranda mengambil ringkasan API dan membuka analitik', async () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    mockApi(); const user = userEvent.setup(); mount('/');
    await screen.findByText('60%');
    expect(screen.getByText('30')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Buka analitik' }));
    await screen.findByRole('heading', { name: 'Insights' });
  });
  it('filter mengikuti URL, dapat diubah, dan reset mengembalikan daftar', async () => {
    mockApi(); const user = userEvent.setup(); mount('/tantangan?skill=react&bidang=web');
    await screen.findByRole('link', { name: 'Portal pemesanan bahan' });
    await user.click(screen.getByRole('button', { name: 'Filter proyek' }));
    expect((screen.getByRole('checkbox', { name: 'React' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Bidang') as HTMLSelectElement).value).toBe('web');
    await user.click(screen.getByRole('checkbox', { name: 'SQL' }));
    await screen.findByRole('heading', { name: 'Belum ada proyek yang sesuai' });
    expect(screen.getByLabelText('URL saat ini').textContent).toContain('skill=react%2Csql');
    await user.click(screen.getAllByRole('button', { name: 'Reset filter' })[0]);
    await screen.findByRole('link', { name: 'Portal pemesanan bahan' });
    expect(screen.getByLabelText('URL saat ini').textContent).toBe('/tantangan');
  });
  it('filter mobile membuka dan menutup panel dengan status aksesibel', async () => {
    mockApi(); const user = userEvent.setup(); mount('/tantangan');
    const button = await screen.findByRole('button', { name: 'Filter proyek' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    await user.click(button); expect(button.getAttribute('aria-expanded')).toBe('true');
    await user.click(button); expect(button.getAttribute('aria-expanded')).toBe('false');
  });
  it('detail menunjukkan skor, alasan, label data contoh, dan navigasi dua arah', async () => {
    mockApi(); const user = userEvent.setup(); mount('/tantangan/1');
    await screen.findByRole('heading', { name: 'Portal pemesanan bahan' });
    const rekomendasi = screen.getByRole('region', { name: '5 kandidat paling sesuai' });
    expect(within(rekomendasi).getByText('40')).toBeTruthy();
    expect(within(rekomendasi).getByText('Wajib belum dimiliki')).toBeTruthy();
    expect(within(rekomendasi).getByText('SQL')).toBeTruthy();
    expect(within(rekomendasi).getByText('Data contoh')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Aruna Contoh' }));
    await screen.findByRole('heading', { name: 'Aruna Contoh' });
    expect(screen.getByRole('heading', { name: 'Skill untuk dikembangkan' })).toBeTruthy();
    expect(screen.getByLabelText('Level Mahir')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Portal pemesanan bahan' }));
    await screen.findByRole('heading', { name: 'Portal pemesanan bahan' });
  });
  it('kegagalan jaringan dapat dicoba ulang', async () => {
    mockApi(); const impl = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Koneksi terputus'));
    const user = userEvent.setup(); mount('/talenta');
    await screen.findByRole('alert');
    vi.mocked(fetch).mockImplementation(impl);
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    await screen.findByRole('link', { name: 'Aruna Contoh' });
  });
  it('404 detail memberi pesan manusiawi dan tautan kembali', async () => {
    mockApi(); mount('/tantangan/9999');
    expect((await screen.findByRole('alert')).textContent).toContain('Data tidak ditemukan.');
    expect(screen.getByRole('link', { name: 'Kembali ke proyek' }).getAttribute('href')).toBe('/tantangan');
  });
  it('memuat memakai skeleton, lalu menampilkan konten', async () => {
    let selesai: (value: unknown) => void = () => {};
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { selesai = (value) => resolve(value as Response); })));
    mount('/talenta');
    expect(screen.getByRole('status', { name: 'Memuat data' })).toBeTruthy();
    selesai({ ok: true, json: async () => [talenta] });
    await screen.findByRole('link', { name: 'Aruna Contoh' });
  });
  it('respons lama tidak menimpa halaman setelah navigasi', async () => {
    mockApi(); const impl = vi.mocked(fetch).getMockImplementation()!;
    let selesai: (value: unknown) => void = () => {};
    vi.mocked(fetch).mockImplementation((input, init) => input === '/api/talenta' ? new Promise((resolve) => { selesai = (value) => resolve(value as Response); }) as ReturnType<typeof fetch> : impl(input, init));
    const user = userEvent.setup(); mount('/talenta');
    await user.click(screen.getByRole('link', { name: 'Opportunities' }));
    await screen.findByRole('link', { name: 'Portal pemesanan bahan' });
    selesai({ ok: true, json: async () => [talenta] });
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Aruna Contoh' })).toBeNull());
  });
});
