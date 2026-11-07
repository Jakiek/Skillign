import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Talenta } from '../domain/types';
import { skemaMinat } from '../domain/schemas';
import { useApi } from '../hooks/useApi';
import { useSimpan } from '../hooks/useSimpan';
import { Etat } from './Ui';

export function DialogMinat({ tantanganId, onClose, onSukses }: { tantanganId: number; onClose: () => void; onSukses: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const talenta = useApi<Talenta[]>('talenta');
  const mutation = useSimpan('minat');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const node = dialog.current!;
    const sebelumnya = document.activeElement;
    node.showModal();
    return () => { node.close(); if (sebelumnya instanceof HTMLElement) sebelumnya.focus(); };
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = skemaMinat.safeParse({ tantanganId, talentaId: Number(f.get('talentaId')), pesan: f.get('pesan') });
    if (!parsed.success) { setErrors(parsed.error.flatten().fieldErrors); (e.currentTarget.elements.namedItem('talentaId') as HTMLElement | null)?.focus(); return; }
    setErrors({});
    if (await mutation.simpan<{ id: number }>(parsed.data)) onSukses();
  }
  return <dialog ref={dialog} aria-labelledby="judul-minat" aria-describedby="aturan-minat" onCancel={(e) => { e.preventDefault(); if (!mutation.pending) onClose(); }} className="overscroll-contain m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl bg-card p-6 text-ink backdrop:bg-ink/50">
    <h2 id="judul-minat" className="text-2xl font-semibold">Ajukan minat</h2><p id="aturan-minat" className="my-4 text-sm leading-6 text-muted">Pilih profil Data contoh. Setiap talenta hanya dapat mengajukan minat sekali per tantangan.</p>
    <Etat {...talenta}><form onSubmit={submit} autoComplete="off" noValidate><fieldset disabled={mutation.pending} className="space-y-5"><div><label className="form-label" htmlFor="talentaId">Talenta</label><select className="form-input" id="talentaId" name="talentaId" required aria-invalid={!!errors.talentaId} aria-describedby={errors.talentaId ? 'talentaId-error' : undefined}><option value="">Pilih talenta</option>{talenta.data?.map((t) => <option key={t.id} value={t.id}>{t.nama} · {t.peran}</option>)}</select>{errors.talentaId && <p aria-live="polite" id="talentaId-error" className="mt-2 text-sm text-[#87480E]">Pilih satu talenta.</p>}</div><div><label className="form-label" htmlFor="pesan">Pesan (opsional)</label><textarea className="form-input" id="pesan" name="pesan" maxLength={1000} rows={4} aria-invalid={!!errors.pesan} aria-describedby={errors.pesan ? 'pesan-error' : undefined} />{errors.pesan && <p id="pesan-error" className="mt-2 text-sm text-[#87480E]">{errors.pesan[0]}</p>}</div></fieldset>{mutation.error && <p role="alert" className="mt-4 text-sm text-[#87480E]">{mutation.error}</p>}<div className="mt-6 flex flex-wrap gap-3"><button type="submit" disabled={mutation.pending || !talenta.data?.length} className="button-primary disabled:opacity-50">{mutation.pending ? 'Mengirim…' : 'Kirim minat'}</button><button type="button" disabled={mutation.pending} onClick={onClose} className="button-secondary disabled:opacity-50">Batal</button></div></form></Etat>
    {talenta.error && <button type="button" className="button-secondary mt-4" onClick={onClose}>Tutup</button>}
  </dialog>;
}
