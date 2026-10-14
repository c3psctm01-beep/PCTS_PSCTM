const CACHE_NAME = 'pcts-pea-v3.3-cache';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './watermark.js',
  './signature-pad.js',
  './gis-map.js',
  './realtime-sync.js',
  './pwa-setup.js',
  './mascot.jpg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // ไม่แคชคำขอ Supabase หรือ API ภายนอก
  if (event.request.url.includes('supabase.co') || event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // อัปเดตแคชเมื่อได้ response ที่ถูกต้อง
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback จากแคชเมื่อออฟไลน์
        return caches.match(event.request);
      })
  );
});
