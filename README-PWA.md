# ChatTeman — PWA Setup

Proyek ini sudah diubah menjadi Progressive Web App (PWA) modern tanpa
mengubah nama file, struktur, tampilan UI, atau logika JavaScript yang
sudah ada di `index.html`, `nearby.html`, `profil.html`, `pesan.html`,
dan `main.js`. Semua fitur PWA ditambahkan lewat file baru.

## 1. Cara mengganti domain (BASE_URL)

Buka **`config.js`** dan ubah satu baris ini:

```js
const BASE_URL = "https://example.com";
```

- Semua skrip runtime (`seo.js`, `sw-register.js`, `pwa-install.js`,
  `pwa-update.js`) otomatis membaca nilai ini lewat `window.APP_CONFIG`.
- `manifest.json` / `site.webmanifest` **tidak perlu diubah** karena
  sudah memakai path relatif (`./index.html`, `icons/...`, dst.) sesuai
  standar Web App Manifest — ini juga membuatnya otomatis kompatibel
  dengan deployment di sub-folder (mis. GitHub Pages project site).
- `robots.txt`, `sitemap.xml`, dan tag `canonical` / `og:url` /
  `twitter:*` / JSON-LD di keempat halaman HTML memakai placeholder
  `{{BASE_URL}}` karena tag tersebut *wajib* berisi URL absolut menurut
  standar SEO/Open Graph.

### Mengisi placeholder `{{BASE_URL}}` (pilih salah satu)

**Opsi A — Otomatis dengan Node.js (disarankan):**

```bash
node build.js
```

Skrip ini membaca `BASE_URL` dari `config.js`, lalu membuat folder
`dist/` berisi salinan seluruh proyek dengan semua `{{BASE_URL}}`
sudah terisi. Upload isi folder `dist/` ke hosting Anda.

**Opsi B — Manual (jika tidak ada akses Node.js/CLI, sesuai kondisi
shared hosting tanpa SSH):**

Gunakan fitur "Find & Replace" pada text editor lokal Anda untuk
mengganti semua `{{BASE_URL}}` menjadi domain asli sebelum upload lewat
File Manager. Hanya ada 6 file yang mengandung placeholder ini:
`index.html`, `nearby.html`, `profil.html`, `pesan.html`, `robots.txt`,
`sitemap.xml`.

## 2. Struktur file yang ditambahkan

```
config.js            → satu-satunya sumber BASE_URL
seo.js                → suntik canonical/OG/Twitter/JSON-LD dari config.js (runtime)
sw.js                 → service worker (cache, offline, auto-update)
sw-register.js        → registrasi service worker
pwa-install.js        → tombol Instal (beforeinstallprompt)
pwa-update.js         → notifikasi versi baru tersedia
offline.html          → halaman fallback saat offline
manifest.json / site.webmanifest
robots.txt / sitemap.xml
browserconfig.xml
favicon.ico, favicon-16x16.png, favicon-32x32.png
apple-touch-icon.png, mstile-150x150.png, safari-pinned-tab.svg
/icons/               → 16–1024px + maskable + adaptive icon (Android)
/screenshots/         → placeholder screenshot manifest (Home/Nearby/Profil/Pesan)
style.css             → gaya dasar UI + komponen tombol Instal/Update/halaman offline
build.js              → skrip build opsional (lihat di atas)
.htaccess / _headers / vercel.json / nginx.conf.example → header keamanan per platform hosting
```

`main.js` **tidak diubah secara logika** — hanya berisi highlight navigasi
bawah seperti sebelumnya. Semua kode PWA berada di file terpisah.

## 3. Ikon

Ikon dibuat otomatis dalam semua ukuran yang diminta (16 s.d. 1024px),
termasuk versi *maskable* (192 & 512) dan *adaptive icon* Android
(`icons/adaptive-icon-foreground.png` + `icons/adaptive-icon-background.png`).
Ganti file-file di `/icons/` dengan logo asli ChatTeman kapan saja tanpa
perlu mengubah `manifest.json` selama nama file tetap sama.

## 4. Screenshot manifest

`/screenshots/home.png`, `nearby.png`, `profil.png`, `pesan.png` adalah
**placeholder** (540×960, form_factor "narrow") agar manifest lolos
validasi PWABuilder. Ganti dengan tangkapan layar asli aplikasi sebelum
submit ke Google Play Store — PWABuilder mensyaratkan screenshot nyata
untuk listing yang meyakinkan (bukan wajib untuk lolos validasi teknis).

## 5. Header keamanan (X-Content-Type-Options, Permissions-Policy)

Dua header ini **tidak bisa** diset lewat tag `<meta>` HTML — harus lewat
header HTTP dari server. File konfigurasi sudah disediakan untuk:

- **Apache** → `.htaccess` (aktif otomatis jika `mod_headers` diizinkan)
- **Nginx** → `nginx.conf.example` (salin ke blok `server {}` Anda)
- **Cloudflare Pages** → `_headers` (otomatis terbaca)
- **Vercel** → `vercel.json` (otomatis terbaca)
- **GitHub Pages** → tidak mendukung header kustom; CSP & Referrer-Policy
  tetap aktif lewat `<meta>` di setiap halaman, X-Content-Type-Options
  dan Permissions-Policy akan dilewati pada platform ini (batasan GitHub
  Pages, bukan batasan proyek ini).

## 6. Menjalankan Lighthouse / PWABuilder

1. Jalankan `node build.js` (atau isi manual `{{BASE_URL}}`).
2. Upload folder `dist/` (atau proyek yang sudah di-replace) ke hosting.
3. Buka [PWABuilder.com](https://www.pwabuilder.com) dan masukkan URL
   situs Anda untuk generate paket Android (Google Play / TWA).
4. Jalankan Lighthouse (Chrome DevTools → Lighthouse) untuk audit
   Performance/Accessibility/Best Practices/SEO/PWA.

## 7. Auto Update

`sw.js` tidak langsung `skipWaiting()` — begitu versi baru terdeteksi,
`pwa-update.js` menampilkan banner "Versi baru ChatTeman tersedia" dengan
tombol **Perbarui**. Setelah diklik, halaman otomatis reload dengan versi
terbaru. Untuk merilis update, cukup naikkan `SW_VERSION` di `sw.js`.

## 8. Install App

Tombol `#pwa-install-btn` (sudah ada di setiap halaman, tersembunyi
secara default) otomatis muncul saat browser memicu `beforeinstallprompt`,
dan otomatis disembunyikan permanen jika aplikasi sudah terpasang
(`display-mode: standalone` terdeteksi).
