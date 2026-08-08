/**
 * pwa-update.js — Menampilkan notifikasi ketika versi baru aplikasi
 * tersedia, dan memungkinkan pengguna memuat ulang untuk memperbarui.
 * File terpisah, tidak mengubah main.js.
 */
(function () {
  "use strict";

  if (!("serviceWorker" in navigator)) return;

  let refreshing = false;

  function createBanner() {
    if (document.getElementById("pwa-update-banner")) return;

    const banner = document.createElement("div");
    banner.id = "pwa-update-banner";
    banner.setAttribute("role", "status");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = `
      <p>Versi baru ChatTeman tersedia.</p>
      <div class="pwa-update-actions">
        <button type="button" id="pwa-update-btn" class="pwa-btn pwa-btn-primary">Perbarui</button>
        <button type="button" id="pwa-update-dismiss" class="pwa-btn pwa-btn-ghost" aria-label="Tutup notifikasi pembaruan">Nanti</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("pwa-update-dismiss").addEventListener("click", () => {
      banner.remove();
    });
  }

  function promptUpdate(registration) {
    createBanner();
    const btn = document.getElementById("pwa-update-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const waiting = registration.waiting;
      if (waiting) {
        waiting.postMessage({ type: "SKIP_WAITING" });
      }
    });
  }

  window.addEventListener("chatteman:sw-registered", (e) => {
    const registration = e.detail.registration;

    if (registration.waiting) {
      promptUpdate(registration);
    }

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          promptUpdate(registration);
        }
      });
    });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
})();
