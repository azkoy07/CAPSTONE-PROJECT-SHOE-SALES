👟 Shoe Sales — E-Commerce Sepatu dengan AI Agent

Aplikasi e-commerce penjualan sepatu berbasis web yang dibangun dengan HTML, Tailwind CSS, dan Vanilla JavaScript murni. Dilengkapi Asisten Shoe Sales, yaitu AI Agent di sisi pembeli yang merekomendasikan produk, mengecek stok, menambah ke keranjang, dan memandu checkout. Tidak memerlukan framework, server, atau instalasi apa pun: cukup buka index.html di browser.

📌 Ringkasan Project
Aspek	Keterangan
Tujuan	Membantu toko sepatu skala kecil berjualan online dan mengelola stok serta pesanan dalam satu sistem
Masalah yang diselesaikan	Pencatatan pesanan manual, stok tidak sinkron, dan pertanyaan pembeli yang berulang (stok, ukuran, ongkir, status pesanan)
Pengguna utama	Pembeli sepatu (dilayani AI Agent) dan penjual/admin toko (dashboard manual)
AI Agent	Asisten belanja berbasis aturan yang membaca data aplikasi dan menjalankan aksi dengan konfirmasi pengguna
Pengembangan	Dibangun dan disempurnakan dengan IBM Bob melalui prompt berlapis
📁 Struktur File
CapstoneProject/
├── index.html    → Struktur HTML semantik (halaman, modal, chat widget)
├── style.css     → Styling kustom tambahan di luar Tailwind CSS
├── script.js     → Seluruh logika aplikasi (state, render, event, AI Agent)
└── README.md     → Dokumentasi ini
🧱 Teknologi
Teknologi	Versi / Sumber	Fungsi
HTML5	Semantik	Struktur halaman
Tailwind CSS	CDN (v3 JIT)	Styling utility-first
Vanilla JavaScript	ES2020+	Logika aplikasi dan AI Agent
localStorage	Browser API	Penyimpanan data lokal
IBM Bob	AI coding assistant	Pembuatan dan penyempurnaan kode lewat prompt

Tidak ada framework, library pihak ketiga, maupun server. AI Agent berjalan sepenuhnya di browser dan tidak memakai API key.

✨ Fitur Lengkap
🛍️ Sisi Pembeli (Storefront)
Fitur	Keterangan
Katalog produk	Grid responsif, badge stok, harga Rupiah
Foto produk	Upload foto asli atau fallback emoji berwarna
Pencarian real-time	Debounce 300ms, cari nama dan merek
Filter kategori	Semua / Sneakers / Running / Formal / Casual / Sandal
Urutkan	Terbaru / Termurah / Termahal / A–Z
Detail produk	Modal: deskripsi, pilih ukuran EU 36–45, atur jumlah
Keranjang belanja	Drawer samping: ubah qty, hapus, subtotal, ongkir otomatis
Beli Sekarang	Checkout langsung tanpa masuk keranjang
Ongkos kirim	Gratis jika subtotal ≥ Rp 1.000.000, selain itu Rp 20.000
Checkout	Validasi: nama, telepon, alamat, pengiriman, pembayaran
Metode pembayaran	Transfer Bank / E-Wallet / COD
Pesanan Saya	Riwayat pesanan dengan filter status dan detail lengkap
Asisten Shoe Sales (AI Agent)	Chat widget untuk bantuan belanja (lihat bagian AI Agent)
Notifikasi toast	Feedback aksi: tambah keranjang, checkout berhasil, dll.
Aksesibilitas	ARIA, focus ring, keyboard navigation, reduced motion
🏪 Sisi Penjual (Dashboard Admin)
Fitur	Keterangan
Tab Produk	Lihat, tambah, edit, hapus produk dengan validasi
Upload foto produk	Klik atau drag & drop, preview langsung, maks. 2 MB
Tab Pesanan	Lihat semua pesanan, filter Semua/Diproses/Selesai
Kelola pesanan	Tandai Selesai, kembalikan ke Diproses, edit data pembeli, hapus
Tab Penjualan	Pendapatan, rata-rata order, produk terlaris, metode pembayaran, tabel transaksi
Ringkasan dashboard	4 kartu metrik yang bisa diklik untuk navigasi langsung

Sisi penjual sengaja tidak memiliki AI Agent. Aksi seperti mengubah stok, harga, dan status pesanan berisiko tinggi tanpa autentikasi sungguhan, sehingga tetap dikelola manual.

🤖 AI Agent: Asisten Shoe Sales

Asisten Shoe Sales adalah chat widget (tombol bulat oranye di kanan bawah) yang hanya muncul pada mode Pembeli. Agent membaca data nyata aplikasi (produk, stok, keranjang, pesanan) dan dapat menjalankan aksi atas nama pengguna.

Kemampuan Agent
Kemampuan	Keterangan
Sapaan dan bantuan	Memperkenalkan diri dan menampilkan opsi cepat (quick reply)
Rekomendasi produk	Berdasarkan kategori, merek, anggaran, dan ketersediaan stok
Cek stok dan harga	Dijawab dari data produk yang nyata
Panduan ukuran	Menyarankan ukuran EU dan memilih ukuran melalui tombol
Tambah ke keranjang	Pilih ukuran, lalu tombol Tambah ke Keranjang; ditolak jika stok habis
Beli Sekarang	Langsung ke checkout tanpa memengaruhi keranjang utama
Checkout terpandu	Menanyakan data satu per satu, menampilkan ringkasan, lalu meminta konfirmasi
Info ongkir dan pembayaran	Menjelaskan aturan ongkir dan metode pembayaran
Cek status pesanan	Berdasarkan nomor pesanan (SS-XXXXXXX)
FAQ dan fallback	Menjawab pertanyaan umum, dan meminta klarifikasi jika tidak paham
Aturan Interaksi Pengguna dan Agent
Menjawab hanya dari data aplikasi; tidak mengarang produk, harga, stok, atau status pesanan.
Pertanyaan di luar topik toko sepatu ditolak dengan sopan dan diarahkan kembali ke belanja.
Aksi yang mengubah data (tambah ke keranjang, buat pesanan) membutuhkan pilihan atau konfirmasi eksplisit dari pengguna.
Status pesanan hanya menampilkan nomor, status, item, dan total. Data pribadi pembeli tidak ditampilkan.
Agent tidak menghapus pesanan, mengubah status pesanan, atau mengakses data admin.
Mengingat konteks percakapan singkat (produk yang sedang dibahas, ukuran, anggaran).
Tombol Hapus di header chat membersihkan riwayat percakapan.
Alur Interaksi Contoh
Pengguna : "Cari sepatu lari di bawah 2 juta"
Agent    : Menampilkan produk Running yang sesuai anggaran dan stoknya tersedia
Pengguna : Memilih produk → memilih ukuran EU 45
Agent    : Menampilkan kartu produk dengan aksi
           [🛒 Tambah ke Keranjang] [⚡ Beli Sekarang]
Pengguna : Klik "Tambah ke Keranjang"
Agent    : "✅ Air Max 90 Classic EU 45 berhasil ditambahkan ke keranjang!"
           (badge keranjang di header bertambah)
Arsitektur Prompt (Prompt Layering)

Kode dibuat dan disempurnakan dengan IBM Bob memakai prompt tujuh layer:

Layer	Tujuan
1. Role	Menetapkan Bob sebagai Senior Frontend Engineer
2. Konteks Project	Menjelaskan struktur file, key localStorage, dan fitur yang ada agar tidak merusak kode lama
3. Task dan Batasan	Menambah agent hanya di sisi pembeli, tanpa framework dan API key
4. Kemampuan Agent	Daftar intent yang harus didukung
5. Aturan Interaksi dan Keamanan	Jawab dari data, tolak di luar topik, konfirmasi sebelum aksi
6. Arsitektur Kode dan UI	Logika agent terpisah dengan fungsi pusat getAgentReply(userText), tema biru-putih-oranye
7. Standar Kode dan Output	Aksesibilitas, escape XSS, komentar, dan skenario uji coba

Fungsi pusat getAgentReply(userText) dirancang agar bagian berbasis aturan mudah diganti dengan panggilan LLM API di masa depan.

🚀 Cara Menjalankan
Prasyarat
Browser modern (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
Tidak perlu Node.js, Python, atau software tambahan
Langkah-langkah
1. Download / clone folder CapstoneProject ke komputer Anda.
2. Pastikan ketiga file (index.html, style.css, script.js) berada
   dalam SATU folder yang sama.
3. Buka index.html dengan cara:
   - Klik dua kali pada file index.html, ATAU
   - Klik kanan → "Open with" → pilih browser, ATAU
   - Gunakan Live Server di VS Code (http://127.0.0.1:5500/index.html)
4. Aplikasi langsung berjalan. Koneksi internet hanya dibutuhkan
   saat Tailwind CSS dimuat dari CDN.

⚠️ Untuk berjalan tanpa internet sama sekali, unduh Tailwind CSS dan ganti baris CDN di index.html dengan file lokal.

🔄 Alur Penggunaan
Alur Pembeli
1. Buka storefront → cari, filter, dan urutkan produk
2. Klik card produk → modal detail (foto, deskripsi, harga, stok)
3. Pilih ukuran EU dan jumlah, lalu:
   ├─ "Keranjang"     → masuk drawer keranjang → Checkout
   └─ "Beli Sekarang" → langsung checkout (keranjang tidak terpengaruh)
4. Checkout → isi data, pilih pengiriman dan pembayaran → Konfirmasi
   └─ Muncul nomor pesanan SS-XXXXXXX, stok berkurang otomatis
5. "Pesanan Saya" → lihat riwayat dan status pesanan
Alur Pembeli dengan AI Agent
1. Klik tombol chat oranye di kanan bawah
2. Tanyakan kebutuhan (rekomendasi, stok, ukuran, ongkir) atau pilih quick reply
3. Pilih produk dan ukuran dari kartu di chat
4. Pilih aksi: "Tambah ke Keranjang" atau "Beli Sekarang"
5. Selesaikan checkout (lewat chat atau form biasa)
6. Tanyakan status pesanan dengan nomor SS-XXXXXXX
Alur Penjual (Admin)
1. Klik chip "Penjual" di header → dashboard admin terbuka
2. Tab Produk    → tambah, ubah, hapus produk (dengan foto)
3. Tab Pesanan   → filter status, tandai Selesai/Diproses, edit, hapus
4. Tab Penjualan → pendapatan, produk terlaris, metode pembayaran, tabel transaksi
5. Klik chip "Pembeli" untuk kembali ke toko
💾 Penyimpanan Data

Semua data disimpan di localStorage browser:

Key	Isi
ss_products	Array produk (termasuk foto base64 jika ada)
ss_cart	Array item keranjang aktif
ss_orders	Array riwayat pesanan

Riwayat chat agent juga dapat disimpan di localStorage. Periksa nama key-nya di script.js dan tambahkan ke tabel ini jika ada. Untuk reset ke data awal: DevTools → Application → Local Storage → hapus key di atas, lalu refresh halaman.

🗂️ Arsitektur script.js

Kode dibagi per bagian komentar:

Seed data & konstanta        → 8 produk awal, konfigurasi
State aplikasi               → produk, keranjang, pesanan
Helpers                      → readLS/writeLS, formatRp, escHtml, debounce, toast, modal
Operasi produk               → filter, sort, CRUD, persist
Operasi keranjang            → add, update qty, remove, totals
Operasi pesanan              → createOrder, updateStatus, updateBuyer, delete
Render storefront            → grid produk, filter, cart drawer, badge
Pesanan Saya                 → render list dan filter
Modal detail produk          → size picker, qty stepper, aksi beli
Checkout                     → form, validasi, createOrder, konfirmasi
Render admin                 → ringkasan, daftar produk, daftar pesanan, data penjualan
Form produk & modal admin    → tambah/edit produk, edit pesanan
Cart drawer & switch view    → storefront ↔ pesanan saya ↔ admin
AI Agent                     → intent, ekstraksi entitas, respons, state percakapan, UI chat
Event listeners              → semua handler dengan event delegation
🔒 Keamanan
Teks dari pengguna (termasuk pesan chat) di-escape dengan escHtml() sebelum ditampilkan, untuk mencegah XSS.
Semua akses localStorage dibungkus try/catch.
Foto diproses lokal (FileReader → base64) dan tidak dikirim ke server.
AI Agent tidak menyimpan API key dan tidak mengirim data keluar browser.
📱 Responsivitas
Breakpoint	Grid Produk
Mobile (< 640px)	2 kolom
Tablet (≥ 640px)	2 kolom
Desktop (≥ 1024px)	3 kolom
Wide (≥ 1280px)	4 kolom

Panel chat agent hampir layar penuh di mobile dan berukuran tetap di desktop.

📦 Data Produk Awal (Seed)
#	Nama	Merek	Kategori	Harga	Stok
1	Air Max 90 Classic	Nike	Sneakers	Rp 1.450.000	15
2	UltraBoost 22	Adidas	Running	Rp 1.890.000	8
3	Oxford Brogue Premier	Clarks	Formal	Rp 980.000	3
4	Classic Canvas Low	Converse	Casual	Rp 620.000	20
5	Gel-Nimbus 25	ASICS	Running	Rp 2.100.000	0 (Habis)
6	Mayari Slide	Birkenstock	Sandal	Rp 750.000	12
7	Chuck 70 High Top	Converse	Casual	Rp 880.000	2
8	Pegasus 40	Nike	Running	Rp 1.650.000	18
🧪 Skenario Uji Coba
Pembelian manual
Buka index.html → klik Air Max 90 Classic → pilih EU 42, jumlah 2 → Keranjang.
Buka keranjang → ubah qty → Checkout → isi form → Konfirmasi Pesanan.
Catat nomor pesanan → buka Pesanan Saya.
Pengujian AI Agent
Rekomendasi: ketik "sepatu lari di bawah 2 juta" → agent menampilkan produk Running yang stoknya tersedia.
Stok habis: tanyakan Gel-Nimbus 25 → agent menyatakan stok habis dan tidak mengizinkan ditambahkan.
Tambah ke keranjang: pilih produk → pilih ukuran → Tambah ke Keranjang → badge keranjang bertambah dan drawer menampilkan item.
Beli Sekarang: pilih Beli Sekarang → checkout terbuka, keranjang utama tidak berubah.
Cek pesanan: kirim nomor pesanan valid (tampil status) dan tidak valid (agent menyatakan tidak ditemukan).
Di luar topik: tanyakan hal tak terkait sepatu → agent menolak dengan sopan.
Fallback: kirim kalimat tak dikenali dua kali berturut-turut → agent meminta klarifikasi dan menawarkan opsi.
Mode Penjual: pindah ke mode Penjual → chat widget tidak tampil.
Proses pesanan di admin
Klik Penjual → tab Pesanan → Selesai pada pesanan uji.
Buka tab Penjualan → pastikan pendapatan dan produk terlaris terupdate.
🚧 Keterbatasan
Simulasi frontend: tidak ada autentikasi sungguhan, data bisa dilihat dan diubah dari DevTools.
AI Agent berbasis aturan dan kata kunci, belum memakai LLM, sehingga pemahaman bahasa bebas terbatas.
Foto produk disimpan sebagai base64 di localStorage; banyak foto besar dapat memenuhi kuota.
Pembayaran dan pengiriman hanya simulasi, belum terhubung ke layanan nyata.
🔭 Rencana Pengembangan

Prioritas:

Backend, database, dan autentikasi (Node.js + PostgreSQL/MongoDB).
Payment gateway (Midtrans/Xendit) dan API ongkir (RajaOngkir) beserta pelacakan resi.
Integrasi LLM lewat backend agar agent memahami bahasa bebas dan memanggil tool sendiri (API key tidak boleh ada di browser).

Fitur lanjutan:

Akun pembeli dan admin, wishlist, ulasan dan rating, stok per ukuran, kode promo.
Status pesanan rinci (Dibayar, Dikemas, Dikirim, Selesai, Dibatalkan) dan notifikasi email/WhatsApp.
Ekspor laporan PDF/Excel dan PWA.

Pengembangan AI Agent:

Rekomendasi personal berdasarkan riwayat belanja dan pencarian berbahasa alami.
Panduan ukuran berdasarkan panjang kaki dan deskripsi produk otomatis.
Asisten penjual (laporan, peringatan stok, ubah status pesanan) setelah autentikasi tersedia, dengan pratinjau perubahan, konfirmasi, dan log aktivitas.

Dibuat sebagai Capstone Project: Frontend E-Commerce dengan AI Agent menggunakan HTML, Tailwind CSS, Vanilla JavaScript, dan IBM Bob.
