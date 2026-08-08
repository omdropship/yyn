/**
 * main.js — Logika aplikasi ChatTeman (bukan bagian PWA).
 * Semua fitur PWA berada di file terpisah: sw.js, sw-register.js,
 * pwa-install.js, pwa-update.js, seo.js.
 */
(function () {
  "use strict";

  function highlightActiveNav() {
    const links = document.querySelectorAll(".bottom-nav__item");
    const current = window.location.pathname.split("/").pop() || "index.html";

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === current) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", highlightActiveNav);
})();
