export class ApiError extends Error {
  constructor(public status: number) { super(status === 404 ? 'Data tidak ditemukan.' : status === 400 ? 'Filter atau alamat halaman tidak valid.' : 'Data belum dapat dimuat. Periksa koneksi lalu coba lagi.'); }
}
export async function getApi<T>(path: string, signal: AbortSignal): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/${path}`, { signal }); }
  catch (error) {
    if (signal.aborted) throw error;
    throw new Error('Koneksi ke layanan data terputus. Periksa koneksi lalu coba lagi.');
  }
  if (!response.ok) throw new ApiError(response.status);
  try { return await response.json() as T; }
  catch { throw new Error('Respons layanan data tidak dapat dibaca. Muat ulang halaman atau coba lagi.'); }
}

export class SimpanError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
export async function postApi<T>(path: string, data: unknown): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); }
  catch { throw new SimpanError('Koneksi terputus. Data mungkin sudah tersimpan; periksa halaman sebelum mencoba lagi.'); }
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new SimpanError('Respons penyimpanan tidak dapat dibaca. Periksa daftar sebelum mencoba lagi.'); }
  const payload = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {};
  const fields: Record<string, string[]> = {};
  if (typeof payload.detail === 'object' && payload.detail !== null) {
    for (const [key, messages] of Object.entries(payload.detail)) {
      if (Array.isArray(messages) && messages.every((message) => typeof message === 'string')) fields[key] = messages;
    }
  }
  if (!response.ok) throw new SimpanError(typeof payload.error === 'string' ? payload.error : 'Data belum dapat disimpan. Coba lagi.', fields);
  return body as T;
}
