# 👟 Shoe Sales — Sistem E-Commerce Sepatu

Aplikasi e-commerce penjualan sepatu berbasis web yang dibangun dengan **HTML**, **Tailwind CSS**, dan **Vanilla JavaScript** murni. Tidak memerlukan framework, server, atau instalasi apapun — cukup buka file `index.html` langsung di browser.

---

## 📁 Struktur File

```
CapstoneProject/
├── index.html    → Struktur HTML semantik (semua halaman & modal)
├── style.css     → Styling kustom tambahan di luar Tailwind CSS
├── script.js     → Seluruh logika aplikasi (state, render, event)
└── README.md     → Dokumentasi ini
```

---

## 🧱 Teknologi

| Teknologi | Versi / Sumber | Fungsi |
|---|---|---|
| HTML5 | Semantik | Struktur halaman |
| Tailwind CSS | CDN (v3 JIT) | Styling utility-first |
| Vanilla JavaScript | ES2020+ | Logika aplikasi |
| localStorage | Browser API | Penyimpanan data lokal |

> **Tidak ada framework, tidak ada library pihak ketiga, tidak ada server.**

---

## ✨ Fitur Lengkap

### 🛍️ Sisi Pembeli (Storefront)

| Fitur | Keterangan |
|---|---|
| Katalog produk | Grid responsif 2-4 kolom, badge stok, harga Rupiah |
| Foto produk | Upload foto asli atau fallback emoji berwarna |
| Pencarian real-time | Debounce 300ms, cari nama & merek |
| Filter kategori | Semua / Sneakers / Running / Formal / Casual / Sandal |
| Urutkan | Terbaru / Termurah / Termahal / A–Z |
| Detail produk | Modal: deskripsi, pilih ukuran EU 36–45, atur jumlah |
| **Keranjang belanja** | Drawer samping: ubah qty, hapus, subtotal, ongkir otomatis |
| **Beli Sekarang** | Checkout langsung tanpa masuk keranjang |
| Ongkos kirim | Gratis jika subtotal ≥ Rp 1.000.000, selain itu Rp 20.000 |
| Checkout | Form validasi: nama, telepon, alamat, pengiriman, pembayaran |
| Metode pembayaran | Transfer Bank / E-Wallet / COD |
| **Pesanan Saya** | Riwayat pesanan dengan filter status & detail lengkap |
| Notifikasi toast | Feedback aksi: tambah keranjang, checkout berhasil, dll. |
| Aksesibilitas | ARIA, focus ring, keyboard navigation, reduced motion |

### 🏪 Sisi Penjual (Dashboard Admin)

| Fitur | Keterangan |
|---|---|
| **Tab Produk** | Lihat, tambah, edit, hapus produk dengan validasi |
| Upload foto produk | Klik atau drag & drop, preview langsung, maks. 2 MB |
| **Tab Pesanan** | Lihat semua pesanan, filter Semua/Diproses/Selesai |
| Kelola pesanan | Tandai Selesai, kembalikan ke Diproses, edit data pembeli, hapus |
| **Tab Penjualan** | Data penjualan lengkap (lihat detail di bawah) |
| Ringkasan dashboard | 4 kartu metrik, semua bisa diklik untuk navigasi langsung |

### 📊 Tab Penjualan (Admin)

- **4 metrik utama**: Total Pendapatan, Rata-rata Nilai Pesanan, Pesanan Diproses, Total Semua Pesanan  
- **Produk Terlaris**: peringkat dengan mini bar chart CSS, unit terjual, nilai pendapatan  
- **Metode Pembayaran**: breakdown persentase dengan progress bar  
- **Tabel Rincian**: semua pesanan selesai dengan total di baris footer  

---

## 🚀 Cara Menjalankan

### Prasyarat
- Browser modern (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Tidak diperlukan Node.js, Python, atau software tambahan apapun

### Langkah-langkah

```
1. Download / clone folder CapstoneProject ke komputer Anda.
2. Pastikan ketiga file (index.html, style.css, script.js) berada
   dalam SATU folder yang sama.
3. Buka file index.html dengan cara:
   - Klik dua kali pada file index.html, ATAU
   - Klik kanan → "Open with" → pilih browser, ATAU
   - Seret file index.html ke dalam jendela browser
4. Aplikasi langsung berjalan — tidak perlu koneksi internet
   setelah Tailwind CSS dimuat pertama kali.
```

> ⚠️ **Catatan:** Jika ingin menjalankan tanpa koneksi internet sama sekali,
> unduh Tailwind CSS terlebih dahulu dan ganti baris CDN di `index.html` dengan
> file lokal. Atau gunakan Live Server di VS Code untuk pengembangan.

---

## 🔄 Alur Penggunaan Lengkap

### Alur Pembeli

```
1. BUKA HALAMAN
   └─ Storefront tampil dengan 8 produk seed data
   └─ Header: chip "Pembeli" aktif (biru), sub-nav: Beranda | Pesanan Saya

2. CARI & FILTER PRODUK
   └─ Ketik di kolom pencarian → hasil real-time
   └─ Klik filter kategori (Sneakers, Running, dll.)
   └─ Pilih urutan (Terbaru, Termurah, dll.)

3. LIHAT DETAIL PRODUK
   └─ Klik card produk → modal detail terbuka
   └─ Lihat foto, deskripsi, harga, stok

4a. TAMBAH KE KERANJANG
    └─ Pilih ukuran EU → atur jumlah → klik "🛒 Keranjang"
    └─ Toast "Berhasil ditambahkan"
    └─ Badge angka di ikon keranjang bertambah
    └─ Klik ikon keranjang → drawer muncul dari kanan
    └─ Ubah qty (+/−), hapus item, lihat total & ongkir
    └─ Klik "Checkout →"

4b. BELI SEKARANG (tanpa masuk keranjang)
    └─ Pilih ukuran EU → atur jumlah → klik "Beli Sekarang"
    └─ Langsung terbuka modal checkout
    └─ Keranjang utama TIDAK terpengaruh

5. CHECKOUT
   └─ Isi Nama Penerima, Nomor Telepon, Alamat
   └─ Pilih Metode Pengiriman (JNE, J&T, SiCepat, dll.)
   └─ Pilih Metode Pembayaran (Transfer Bank / E-Wallet / COD)
   └─ Klik "Konfirmasi Pesanan"
   └─ ✅ Modal sukses muncul dengan nomor pesanan (SS-XXXXXXX)
   └─ Stok produk berkurang otomatis
   └─ Keranjang dikosongkan (mode keranjang) atau tetap (mode Beli Sekarang)

6. LIHAT PESANAN SAYA
   └─ Klik "Lihat Pesanan Saya" di modal sukses, ATAU
   └─ Klik tab "📋 Pesanan Saya" di sub-nav header
   └─ Filter: Semua / Diproses / Selesai
   └─ Setiap kartu menampilkan: nomor, tanggal, status, item,
      metode kirim, pembayaran, alamat, total
```

### Alur Penjual (Admin)

```
1. MASUK MODE PENJUAL
   └─ Klik chip "🏠 Penjual" di header
   └─ Dashboard admin terbuka
   └─ Sub-nav pembeli & keranjang hilang dari header

2. DASHBOARD RINGKASAN
   └─ 4 kartu metrik: klik masing-masing untuk navigasi langsung
      ├─ 📦 Total Produk → tab Produk
      ├─ 🛒 Total Pesanan → tab Pesanan (semua)
      ├─ ⏳ Sedang Diproses → tab Pesanan (filter diproses)
      └─ 💰 Pendapatan → tab Penjualan ← klik langsung ke data penjualan

3. TAB PRODUK (📦)
   └─ Lihat daftar semua produk dengan foto, stok, harga
   └─ Klik "+ Tambah Produk" → form tambah
      ├─ Isi nama, merek, kategori, harga, stok, deskripsi
      ├─ Upload foto: klik zona / drag & drop file PNG/JPG/WebP
      └─ Klik "Simpan"
   └─ Klik ✏️ pada produk → form edit (foto lama tampil otomatis)
   └─ Klik 🗑 pada produk → konfirmasi hapus

4. TAB PESANAN (🛒)
   └─ Filter: Semua / Diproses / Selesai
   └─ Setiap kartu pesanan menampilkan:
      nomor, pembeli, tanggal, metode bayar, item, total, status
   └─ Klik "✅ Selesai" → pesanan berubah status Selesai
      (pendapatan di tab Penjualan bertambah)
   └─ Klik "↩ Diproses" → kembalikan status
   └─ Klik "✏️ Detail/Edit" → edit nama/telepon/alamat/pembayaran
   └─ Klik "🗑 Hapus" → konfirmasi hapus pesanan

5. TAB PENJUALAN (📊)
   └─ Metrik: pendapatan, rata-rata order, pesanan diproses, total order
   └─ Produk terlaris dengan bar chart & unit terjual
   └─ Breakdown metode pembayaran dengan progress bar
   └─ Tabel rincian semua transaksi selesai + total footer

6. KEMBALI KE TOKO
   └─ Klik chip "👤 Pembeli" di header
   └─ Storefront kembali tampil
```

---

## 💾 Penyimpanan Data

Semua data disimpan di **localStorage** browser dengan key berikut:

| Key | Isi |
|---|---|
| `ss_products` | Array produk (termasuk foto base64 jika ada) |
| `ss_cart` | Array item keranjang belanja aktif |
| `ss_orders` | Array semua riwayat pesanan |

> Data bertahan selama browser tidak membersihkan localStorage.  
> Untuk **reset ke data awal**, buka DevTools → Application → Local Storage → hapus ketiga key di atas, lalu refresh halaman.

---

## 🗂️ Arsitektur `script.js`

File JavaScript dibagi 16 bagian komentar yang jelas:

```
Bagian  1  — Seed data (8 produk awal) & konstanta
Bagian  2  — State aplikasi: produk, keranjang, pesanan
Bagian  3  — Helpers: readLS/writeLS, formatRp, escHtml, debounce, toast, modal
Bagian  4  — Operasi produk: filter, sort, CRUD, persist
Bagian  5  — Operasi keranjang: add, update qty, remove, totals
Bagian  6  — Operasi pesanan: createOrder, updateStatus, updateBuyer, delete
Bagian  7  — Render Storefront: grid produk, filter, cart drawer, badge
Bagian  8  — Halaman Pesanan Saya (pembeli): render list & filter
Bagian  9  — Modal detail produk: size picker, qty stepper, 2 tombol aksi
Bagian 10  — Checkout: form, validasi, createOrder, konfirmasi
Bagian 11  — Render admin: summary, product list, order list
Bagian 11b — Data Penjualan: metrik, produk terlaris, tabel transaksi
Bagian 12  — Form produk admin: tambah/edit dengan upload foto
Bagian 13  — Modal edit pesanan admin
Bagian 14  — Cart drawer: open/close
Bagian 15  — Switch View: storefront ↔ my-orders ↔ admin + upload foto init
Bagian 16  — Event Listeners: semua handler dengan event delegation
```

---

## 🔒 Keamanan

- Semua teks dari input pengguna di-escape dengan `escHtml()` sebelum ditampilkan ke DOM — mencegah **XSS**
- Semua akses localStorage dibungkus `try/catch` — mencegah crash jika storage penuh atau diblokir
- Foto yang di-upload hanya diproses secara lokal (FileReader → base64) — tidak dikirim ke server manapun

---

## 📱 Responsivitas

| Breakpoint | Layout Grid Produk |
|---|---|
| Mobile (< 640px) | 2 kolom |
| Tablet (≥ 640px) | 2 kolom |
| Desktop (≥ 1024px) | 3 kolom |
| Wide (≥ 1280px) | 4 kolom |

---

## 📦 Data Produk Awal (Seed)

8 produk default yang muncul saat pertama kali dibuka:

| # | Nama | Merek | Kategori | Harga | Stok |
|---|---|---|---|---|---|
| 1 | Air Max 90 Classic | Nike | Sneakers | Rp 1.450.000 | 15 |
| 2 | UltraBoost 22 | Adidas | Running | Rp 1.890.000 | 8 |
| 3 | Oxford Brogue Premier | Clarks | Formal | Rp 980.000 | 3 |
| 4 | Classic Canvas Low | Converse | Casual | Rp 620.000 | 20 |
| 5 | Gel-Nimbus 25 | ASICS | Running | Rp 2.100.000 | **0 (Habis)** |
| 6 | Mayari Slide | Birkenstock | Sandal | Rp 750.000 | 12 |
| 7 | Chuck 70 High Top | Converse | Casual | Rp 880.000 | 2 |
| 8 | Pegasus 40 | Nike | Running | Rp 1.650.000 | 18 |

---

## 🧪 Skenario Uji Coba

### Skenario 1: Pembelian via Keranjang
1. Buka `index.html`
2. Filter kategori **Sneakers** → klik **Air Max 90**
3. Pilih ukuran **EU 42** → jumlah **2** → klik **🛒 Keranjang**
4. Klik ikon keranjang di header
5. Ubah qty menjadi 3 → lihat subtotal berubah
6. Klik **Checkout →** → isi form → **Konfirmasi Pesanan**
7. Catat nomor pesanan → klik **Lihat Pesanan Saya**

### Skenario 2: Beli Sekarang
1. Klik card **Pegasus 40**
2. Pilih ukuran → klik **Beli Sekarang**
3. Isi form checkout → konfirmasi
4. Cek keranjang → **tetap kosong / tidak berubah**

### Skenario 3: Proses Pesanan di Admin
1. Klik chip **🏠 Penjual**
2. Lihat kartu **⏳ Sedang Diproses** → klik → masuk tab Pesanan
3. Klik **✅ Selesai** pada pesanan dari skenario 1
4. Klik kartu **💰 Pendapatan** → masuk tab Penjualan
5. Verifikasi pendapatan & produk terlaris sudah terupdate

### Skenario 4: Tambah Produk dengan Foto
1. Masuk mode Penjual → tab **📦 Produk**
2. Klik **+ Tambah Produk**
3. Isi semua field
4. Upload foto dengan klik zona atau drag & drop gambar
5. Klik **Simpan** → produk muncul di katalog dengan foto asli

---

## 📝 Catatan Pengembangan

- Foto produk disimpan sebagai **base64** di localStorage. Untuk banyak produk dengan foto ukuran besar, pertimbangkan kompresi gambar sebelum upload atau gunakan backend storage.
- Sistem ini adalah **simulasi frontend** — tidak ada autentikasi sungguhan, data bisa dilihat/diubah dari DevTools.
- Untuk production, backend (Node.js, Django, dll.) dan database (PostgreSQL, MongoDB, dll.) perlu ditambahkan.

---

*Dibuat sebagai Capstone Project — Frontend E-Commerce dengan HTML, Tailwind CSS & Vanilla JavaScript*
