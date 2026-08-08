#!/usr/bin/env node
/**
 * build.js — Skrip build lokal (opsional, tanpa dependensi eksternal).
 *
 * Tujuan: mengganti placeholder {{BASE_URL}} pada file yang WAJIB berisi
 * URL absolut (canonical, Open Graph, Twitter Card, JSON-LD, sitemap.xml,
 * robots.txt) dengan nilai BASE_URL yang diambil langsung dari config.js —
 * sehingga domain hanya perlu diubah di SATU tempat: config.js.
 *
 * Cara pakai (di komputer lokal, sebelum upload ke hosting):
 *   1. Edit BASE_URL di config.js
 *   2. Jalankan: node build.js
 *   3. Upload seluruh isi folder /dist ke VPS / GitHub Pages / Cloudflare
 *      Pages / Vercel via File Manager, FTP, atau git push.
 *
 * Catatan: file manifest.json, sw.js, dan seo.js SUDAH memakai path relatif
 * atau membaca BASE_URL secara dinamis di runtime, sehingga TIDAK perlu
 * diproses oleh skrip ini. Jika Node tidak tersedia, situs tetap berjalan
 * normal menggunakan nilai default BASE_URL ("https://example.com") yang
 * sudah tertulis di robots.txt dan sitemap.xml — cukup edit dua file itu
 * secara manual sebagai alternatif.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

const FILES_WITH_TOKEN = [
  "index.html",
  "nearby.html",
  "profil.html",
  "pesan.html",
  "robots.txt",
  "sitemap.xml"
];

const SKIP_COPY = new Set(["dist", "node_modules", ".git", "build.js"]);

function readBaseUrl() {
  const configPath = path.join(ROOT, "config.js");
  const content = fs.readFileSync(configPath, "utf8");
  const match = content.match(/BASE_URL\s*=\s*["'`]([^"'`]+)["'`]/);
  if (!match) {
    throw new Error("Tidak menemukan BASE_URL di config.js");
  }
  return match[1].replace(/\/$/, "");
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (SKIP_COPY.has(path.basename(src))) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function run() {
  const BASE_URL = readBaseUrl();
  console.log(`[build] BASE_URL = ${BASE_URL}`);

  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST, { recursive: true });

  for (const entry of fs.readdirSync(ROOT)) {
    if (SKIP_COPY.has(entry) || entry === "README-PWA.md") continue;
    copyRecursive(path.join(ROOT, entry), path.join(DIST, entry));
  }

  for (const file of FILES_WITH_TOKEN) {
    const filePath = path.join(DIST, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    const replaced = content.split("{{BASE_URL}}").join(BASE_URL);
    fs.writeFileSync(filePath, replaced, "utf8");
    console.log(`[build] Diproses: ${file}`);
  }

  console.log(`[build] Selesai. Upload isi folder "dist/" ke hosting Anda.`);
}

run();
