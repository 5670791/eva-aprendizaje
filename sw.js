// CHAT EVA-JUANMA · service worker (avisos y arranque sin conexión)
// © Juan Manuel Notario — Golden Wash / ATIA-EVA. Patente en trámite.
const CACHE = 'chat-eva-v1';
const BASE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // Supabase siempre en directo
  e.respondWith(fetch(e.request).then(r => {
    const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r;
  }).catch(() => caches.match(e.request)));
});
self.addEventListener('push', e => {
  let d = {titulo: 'EVA', cuerpo: 'Tienes un mensaje nuevo'};
  try { d = e.data.json(); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.titulo || 'EVA', {
    body: d.cuerpo || '', icon: 'icon-192.png', badge: 'icon-192.png', vibrate: [120, 60, 120], tag: 'eva-chat', renotify: true
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
    for (const c of cs) { if ('focus' in c) return c.focus(); }
    return clients.openWindow('./');
  }));
});
