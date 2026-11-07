import { useRef, useState } from 'react';
import { postApi, SimpanError } from '../data/api';
export function useSimpan(path: string) {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string[]>>({});
  async function simpan<T>(data: unknown): Promise<T | undefined> {
    if (lock.current) return;
    lock.current = true; setPending(true); setError(''); setFields({});
    try { return await postApi<T>(path, data); }
    catch (error) {
      setError(error instanceof Error ? error.message : 'Data belum dapat disimpan.');
      if (error instanceof SimpanError) setFields(error.fields);
    } finally { lock.current = false; setPending(false); }
  }
  return { simpan, pending, error, fields };
}
