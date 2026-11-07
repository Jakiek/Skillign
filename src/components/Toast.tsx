import { useEffect, useState } from 'react';
export function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setVisible(false), 3000); return () => clearTimeout(timer); }, []);
  return visible ? <div role="status" className="fixed bottom-5 right-5 z-50 max-w-[calc(100%-2.5rem)] rounded-xl bg-ink p-4 text-sm text-bg">{message}</div> : null;
}
