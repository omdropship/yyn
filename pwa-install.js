/**
 * pwa-install.js — Menangani event beforeinstallprompt dan menampilkan
 * tombol "Instal Aplikasi" hanya jika aplikasi belum terpasang.
 * File terpisah, tidak mengubah main.js.
 */
(function () {
  "use strict";

  let deferredPrompt = null;

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function getInstallButton() {
    return document.getElementById("pwa-install-btn");
  }

  function showButton() {
    const btn = getInstallButton();
    if (btn) btn.hidden = false;
  }

  function hideButton() {
    const btn = getInstallButton();
    if (btn) btn.hidden = true;
  }

  // Jika sudah terpasang (standalone), jangan pernah tampilkan tombol
  if (isStandalone()) {
    hideButton();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (!isStandalone()) {
      showButton();
    }
  });

  document.addEventListener("click", async (event) => {
    const btn = event.target.closest("#pwa-install-btn");
    if (!btn || !deferredPrompt) return;

    hideButton();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.info("[PWA] Hasil pilihan instalasi:", outcome);
    deferredPrompt = null;
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    hideButton();
  });

  // Sembunyikan tombol secara default sampai beforeinstallprompt terpicu
  document.addEventListener("DOMContentLoaded", () => {
    if (!isStandalone()) {
      hideButton();
    }
  });
})();
