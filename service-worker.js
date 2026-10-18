const CACHE_NAME = 'pcts-pea-v4.3-cache';
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
  './contract-eot.js',
  './scurve-export.js',
  './punch-list.js',
  './before-after.js',
  './weather-widget.js',
  './calendar-manager.js',
  './mascot.jpg',
  './manifest.json',
  './assets/manual/ch1_dashboard.png',
  './assets/manual/ch2_gis_map.png',
  './assets/manual/ch3_scurve.png',
  './assets/manual/ch4_signatures.png',
  './assets/manual/ch5_admin.png',
  './assets/manual/ch6_pwa.png'
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
  // ไม่แคชคำขอ Supabase, Local API, ไฟล์ข้อมูล หรือ API ภายนอก เพื่อให้ข้อมูลเป็นปัจจุบันเสมอ
  if (event.request.url.includes('/api/') || event.request.url.includes('/data/') || event.request.url.includes('supabase.co') || event.request.url.includes('googleapis.com')) {
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
