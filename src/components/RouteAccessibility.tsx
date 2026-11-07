import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteAccessibility() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    const main = document.getElementById('konten');
    if (!main) return;
    const changed = previous.current !== pathname;
    previous.current = pathname;
    if (changed) { main.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }
    const updateTitle = () => {
      const title = main.querySelector('h1')?.textContent;
      document.title = title ? `${title} · Jembatan` : 'Jembatan · Prototipe konsep';
    };
    updateTitle();
    const observer = new MutationObserver(updateTitle);
    observer.observe(main, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
