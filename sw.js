// Guarda la app en el móvil para que funcione sin internet.
// Con internet siempre carga la última versión de GitHub.
const CACHE = 'que-cocino-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./'])).catch(() => {}));
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const fuentes = u.hostname.endsWith('fonts.googleapis.com') || u.hostname.endsWith('fonts.gstatic.com');
  if (u.origin !== location.origin && !fuentes) return;
  const pedir = r.mode === 'navigate' ? new Request(r.url, { cache: 'no-cache', credentials: 'same-origin' }) : r;
  e.respondWith(
    fetch(pedir).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(r.mode === 'navigate' ? './' : r, copia));
      }
      return res;
    }).catch(() => caches.match(r.mode === 'navigate' ? './' : r).then(m => m || caches.match('./')))
  );
});
