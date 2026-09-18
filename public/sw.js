// LearnX Student Mastery Service Worker - Offline & Unstable Connection Resilience
const CACHE_NAME = "learnx-mastery-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg"
];

// API endpoints to cache for offline access
const CACHEABLE_API_PATHS = [
  "/api/courses",
  "/api/analytics/student-data",
  "/api/certificates",
  "/api/auth/me"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[LearnX SW] Precache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for Cache API (handled by localStorage sync queue)
  if (request.method !== "GET") {
    return;
  }

  // 1. Navigation requests: Network-first with /index.html offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match("/index.html");
          if (fallback) return fallback;
          return new Response(
            `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#020617;color:#fff;text-align:center;padding:40px;"><h2>LearnX Offline</h2><p>Your cached courses and study data remain accessible.</p><button onclick="window.location.reload()" style="background:#4f46e5;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">Reload</button></body></html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // 2. Cacheable API endpoints (courses, analytics, certificates)
  const isCacheableApi = CACHEABLE_API_PATHS.some((p) => url.pathname.startsWith(p));
  if (isCacheableApi) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          return new Response(
            JSON.stringify({ offline: true, message: "Operating in offline mode with local storage cache." }),
            { headers: { "Content-Type": "application/json" } }
          );
        })
    );
    return;
  }

  // 3. Static assets (JS, CSS, images, fonts): Stale-While-Revalidate
  const isStatic =
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.includes("/assets/");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with Cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
