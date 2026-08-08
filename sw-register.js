/**
 * sw-register.js — Mendaftarkan sw.js dan menghubungkan proses update
 * ke pwa-update.js. File terpisah agar tidak menyentuh main.js.
 */
(function () {
  "use strict";

  if (!("serviceWorker" in navigator)) return;

  const swPath = (window.APP_CONFIG && window.APP_CONFIG.SW_PATH) || "/sw.js";

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(swPath) // scope default = direktori tempat sw.js berada (portabel untuk sub-path deployment)
      .then((registration) => {
        // Beri tahu pwa-update.js bahwa registration siap dipantau
        window.dispatchEvent(
          new CustomEvent("chatteman:sw-registered", { detail: { registration } })
        );
      })
      .catch((err) => {
        console.warn("[PWA] Registrasi Service Worker gagal:", err);
      });
  });
})();
