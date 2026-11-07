import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApi, postApi } from './api';

afterEach(() => vi.unstubAllGlobals());
describe('pesan API yang dapat dipahami pengguna', () => {
  it('GET dengan HTML menggantikan error parser dengan pesan pemulihan', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => { throw new SyntaxError('Unexpected token <'); } })));
    await expect(getApi('skill', new AbortController().signal)).rejects.toThrow('Respons layanan data tidak dapat dibaca. Muat ulang halaman atau coba lagi.');
  });
  it('POST dengan respons tidak terbaca tidak menyarankan pengiriman ulang langsung', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => { throw new SyntaxError('Unexpected token <'); } })));
    await expect(postApi('tantangan', {})).rejects.toThrow('Periksa daftar sebelum mencoba lagi.');
  });
  it('detail validasi yang rusak tidak merusak form', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({ error: 'Periksa isian.', detail: { judul: ['Terlalu pendek.'], deskripsi: null } }) })));
    await expect(postApi('tantangan', {})).rejects.toMatchObject({ message: 'Periksa isian.', fields: { judul: ['Terlalu pendek.'] } });
  });
});
