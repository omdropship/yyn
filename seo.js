/**
 * seo.js — Menyuntikkan tag SEO/sosial (canonical, Open Graph, Twitter Card,
 * JSON-LD) berdasarkan window.APP_CONFIG.BASE_URL dan window.PAGE_META
 * yang didefinisikan di setiap halaman sebelum script ini dimuat.
 *
 * Catatan: untuk keandalan maksimum pada crawler yang tidak menjalankan
 * JavaScript, jalankan build.js (lihat README-PWA.md) agar tag ini juga
 * tertulis statis di HTML. Script ini memastikan tag tetap benar meski
 * build.js belum dijalankan (mis. saat masih memakai BASE_URL default).
 */
(function () {
  "use strict";

  const cfg = window.APP_CONFIG || {};
  const meta = window.PAGE_META || {};
  const BASE_URL = (cfg.BASE_URL || "").replace(/\/$/, "");

  const path = meta.path || "/";
  const url = BASE_URL + path;

  function setLink(rel, href, extra) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
    if (extra) {
      Object.keys(extra).forEach((k) => el.setAttribute(k, extra[k]));
    }
  }

  function setMeta(attr, key, value) {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  // Canonical
  setLink("canonical", url);

  // Open Graph
  setMeta("property", "og:type", meta.type || "website");
  setMeta("property", "og:site_name", cfg.APP_NAME || "ChatTeman");
  setMeta("property", "og:title", meta.title || document.title);
  setMeta("property", "og:description", meta.description || "");
  setMeta("property", "og:url", url);
  setMeta("property", "og:locale", (cfg.LANG || "id-ID").replace("-", "_"));
  if (meta.image) {
    setMeta("property", "og:image", BASE_URL + meta.image);
  }

  // Twitter Card
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", meta.title || document.title);
  setMeta("name", "twitter:description", meta.description || "");
  if (meta.image) {
    setMeta("name", "twitter:image", BASE_URL + meta.image);
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": meta.schemaType || "WebPage",
    name: meta.title || document.title,
    description: meta.description || "",
    url: url,
    inLanguage: cfg.LANG || "id-ID",
    isPartOf: {
      "@type": "WebSite",
      name: cfg.APP_NAME || "ChatTeman",
      url: BASE_URL + "/"
    }
  };

  let ld = document.getElementById("structured-data");
  if (!ld) {
    ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = "structured-data";
    document.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify(jsonLd);
})();
