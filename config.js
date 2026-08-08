/**
 * config.js — Satu-satunya tempat untuk mengatur BASE_URL aplikasi.
 *
 * PENTING:
 * Ubah nilai BASE_URL di bawah ini SATU KALI ketika domain final sudah
 * ditentukan. Semua file JavaScript PWA (sw-register.js, pwa-install.js,
 * pwa-update.js, seo.js, main.js) membaca nilai dari sini melalui
 * `window.APP_CONFIG`, sehingga tidak perlu mengubah URL di banyak file.
 *
 * Untuk file yang TIDAK bisa membaca JavaScript (manifest.json,
 * sitemap.xml, robots.txt), gunakan skrip build.js — lihat README-PWA.md.
 */
(function (global) {
  "use strict";

  const BASE_URL = "https://example.com";

  const APP_CONFIG = Object.freeze({
    BASE_URL,
    APP_NAME: "ChatTeman",
    SHORT_NAME: "ChatTeman",
    THEME_COLOR: "#2563eb",
    BACKGROUND_COLOR: "#ffffff",
    LANG: "id-ID",
    SW_VERSION: "1.0.0",
    SW_PATH: "/sw.js",
    MANIFEST_PATH: "/manifest.json"
  });

  global.APP_CONFIG = APP_CONFIG;

  // Dukungan ES Module (opsional, jika suatu saat file di-load dengan type="module")
  if (typeof module !== "undefined" && module.exports) {
    module.exports = APP_CONFIG;
  }
})(typeof window !== "undefined" ? window : globalThis);
