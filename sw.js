/**
 * sw.js — Service Worker ChatTeman PWA (Vanilla JavaScript)
 *
 * Fitur:
 * - Precache file penting (App Shell)
 * - Cache Versioning + Cache Cleanup otomatis
 * - Network First untuk navigasi/HTML
 * - Cache First untuk aset statis (CSS/JS/gambar/font)
 * - Dynamic Cache untuk request lain yang berhasil (runtime caching)
 * - Offline Fallback ke offline.html
 * - Auto Update (skipWaiting dikendalikan oleh pesan dari pwa-update.js)
 */
"use strict";

const SW_VERSION = "1.0.0";
const CACHE_PREFIX = "chatteman";
const PRECACHE = `${CACHE_PREFIX}-precache-v${SW_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v${SW_VERSION}`;
const CACHE_ALLOWLIST = [PRECACHE, RUNTIME_CACHE];

// SCOPE_URL memastikan semua path precache relatif terhadap lokasi sw.js,
// sehingga tetap benar meski di-deploy di sub-path (mis. GitHub Pages project site).
const SCOPE_URL = new URL(self.registration ? self.registration.scope : "./", self.location.href);
const OFFLINE_URL = new URL("offline.html", SCOPE_URL).pathname;

// App Shell — file penting yang di-precache (relatif terhadap scope)
const PRECACHE_RELATIVE = [
  "",
  "index.html",
  "nearby.html",
  "profil.html",
  "pesan.html",
  "offline.html",
  "style.css",
  "main.js",
  "config.js",
  "seo.js",
  "pwa-install.js",
  "pwa-update.js",
  "sw-register.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png"
];
const PRECACHE_ASSETS = PRECACHE_RELATIVE.map((p) => new URL(p, SCOPE_URL).pathname || "/");

// ---------- INSTALL ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // addAll akan gagal total jika salah satu 404; gunakan pendekatan toleran
      await Promise.all(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn("[SW] Gagal precache:", url, err);
          }
        })
      );
    })()
  );
  // Tidak otomatis skipWaiting — biar pwa-update.js yang memberi notifikasi
  // ke pengguna terlebih dahulu (Auto Update terkontrol).
});

// ---------- ACTIVATE ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Cache Cleanup — hapus cache versi lama
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && !CACHE_ALLOWLIST.includes(key))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// ---------- MESSAGE (Auto Update trigger dari client) ----------
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ---------- HELPERS ----------
function isHTMLRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html")
  );
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(css|js|png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf)$/.test(url.pathname);
}

// Network First — untuk dokumen HTML/navigasi
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const precache = await caches.open(PRECACHE);
    const offline = await precache.match(OFFLINE_URL);
    return offline || Response.error();
  }
}

// Cache First — untuk aset statis
async function cacheFirst(request) {
  const precache = await caches.open(PRECACHE);
  const precached = await precache.match(request);
  if (precached) return precached;

  const runtime = await caches.open(RUNTIME_CACHE);
  const cached = await runtime.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      runtime.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return cached || Response.error();
  }
}

// ---------- FETCH ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // biarkan request cross-origin lewat apa adanya

  if (isHTMLRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Dynamic cache default untuk request lain (mis. API GET)
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        const cached = await cache.match(request);
        return cached || Response.error();
      }
    })()
  );
});
