# 📖 PANDUAN ADMIN — PESAN SAYUR

Panduan lengkap mengelola toko online **Pesan Sayur** melalui Google Sheets.  
Semua data produk, harga, foto, pembayaran, dan promo dikontrol dari spreadsheet.

---

## 📋 DAFTAR ISI

1. [Akses & Struktur Spreadsheet](#-akses--struktur-spreadsheet)
2. [Mengelola Produk](#-mengelola-produk)
3. [Variasi Produk (Ukuran, Warna, Berat)](#-variasi-produk)
4. [Mengelola Kategori](#-mengelola-kategori)
5. [Mengelola Pembayaran (Transfer/QRIS/COD)](#-mengelola-pembayaran)
6. [Mengelola Slider Promo](#-mengelola-slider-promo)
7. [Mengelola Kupon Diskon](#-mengelola-kupon-diskon)
8. [Info Toko & Pengiriman](#-info-toko--pengiriman)
9. [Melihat Pesanan Masuk](#-melihat-pesanan-masuk)
10. [Update Website (Deploy)](#-update-website-deploy)
11. [Upload Foto (Google Drive)](#-upload-foto-google-drive)
12. [FAQ & Troubleshooting](#-faq--troubleshooting)

---

## 🔗 Akses & Struktur Spreadsheet

**URL Spreadsheet:**  
`https://docs.google.com/spreadsheets/d/1HHVN9Fn6wHb0xGbHsHAqFrqAxklNinJjpKyvqZTAYQg`

### Tab (Sheet) yang Tersedia

| Tab | Fungsi | Perlu Deploy Ulang? |
|-----|--------|:-------------------:|
| `products` | Semua data produk & harga | ✅ Ya |
| `categories` | Kategori produk | ✅ Ya |
| `stores` | Info toko (alamat, ongkir, WA) | ✅ Ya |
| `payment_methods` | Rekening bank, QRIS, COD | ✅ Ya |
| `sliders` | Banner promo di homepage | ✅ Ya |
| `coupons` | Kupon diskon | ❌ Tidak (langsung aktif) |
| `orders` | Pesanan masuk (otomatis) | ❌ Tidak (otomatis terisi) |

> **Penting:** Untuk tab yang bertanda ✅, setelah mengubah data, klik tombol **🛒 Pesan Sayur → 🔄 Update Website** agar perubahan muncul di web.

---

## 🥬 Mengelola Produk

### Tab: `products`

#### Daftar Kolom

| Kolom | Wajib? | Isi | Contoh |
|-------|:------:|-----|--------|
| `id` | ✅ | ID unik (angka, tidak boleh sama) | `1`, `2`, `9` |
| `kategori_id` | ✅ | ID dari tab `categories` | `1` = Sayuran |
| `nama` | ✅ | Nama produk | `Bayam Hijau Ikat Segar` |
| `slug` | ✅ | Nama untuk URL (huruf kecil, pakai `-`, tanpa spasi) | `bayam-hijau-ikat-segar` |
| `deskripsi` | ✅ | Deskripsi lengkap produk | *(teks bebas)* |
| `harga` | ✅ | Harga normal (**angka saja, tanpa Rp**) | `5500` |
| `harga_diskon` |  | Harga promo (kosongkan jika tidak promo) | `3500` atau *kosong* |
| `foto_utama` | ✅ | URL foto utama (harus URL publik) | `https://...` |
| `foto_galeri` |  | URL foto tambahan, pisah koma | `https://url1, https://url2` |
| `stok` | ✅ | Jumlah stok tersedia | `100` |
| `satuan` | ✅ | Satuan jual | `ikat`, `kg`, `pack`, `bonggol`, `bungkus` |
| `aktif` | ✅ | Tampilkan di web? | `TRUE` atau `FALSE` |
| `unggulan` |  | Tampilkan di homepage "Produk Unggulan"? | `TRUE` atau `FALSE` |
| `urutan` |  | Urutan tampil (angka kecil = duluan) | `1`, `2`, `3` |
| `min_qty` |  | Minimal pembelian | `1` |
| `variasi_json` |  | Variasi produk (format JSON, lihat panduan bawah) | *(lihat bagian variasi)* |
| `seo_title` |  | Judul untuk Google Search | `Bayam Hijau - Pesan Sayur` |
| `seo_desc` |  | Deskripsi untuk Google Search | *(teks pendek)* |
| `kategori_nama` |  | Nama kategori (untuk display) | `Sayuran` |

### Cara Tambah Produk Baru

1. Buka tab `products`
2. Scroll ke baris kosong paling bawah
3. Isi semua kolom **wajib (✅)** di atas
4. Pastikan:
   - `id` **unik** (tidak sama dengan produk lain)
   - `slug` **unik**, huruf kecil, pakai `-` sebagai pemisah kata, tanpa spasi
   - `aktif` = `TRUE`
   - `foto_utama` berisi URL gambar yang bisa diakses publik
5. Klik **🛒 Pesan Sayur → 🔄 Update Website**

### Cara Update Harga

1. Cari produk berdasarkan nama
2. Ubah kolom `harga` → isi **angka saja** (tanpa "Rp", tanpa titik)
   - ✅ Benar: `5500`
   - ❌ Salah: `Rp 5.500` atau `5.500`
3. Untuk **harga promo**: isi kolom `harga_diskon` dengan harga promo
4. Untuk **hapus promo**: kosongkan kolom `harga_diskon`
5. Klik **🔄 Update Website**

### Cara Nonaktifkan/Hapus Produk

- **Nonaktifkan** (masih ada di sheet tapi tidak tampil di web): ubah `aktif` = `FALSE`
- **Hapus permanen**: hapus seluruh baris produk di spreadsheet
- Lalu klik **🔄 Update Website**

---

## 🎨 Variasi Produk

Variasi memungkinkan pembeli memilih opsi seperti ukuran, berat, atau warna.  
Isi di kolom **`variasi_json`** menggunakan format JSON.

### Aturan Penting
- ⚠️ JSON harus dalam **1 baris** (jangan enter/newline di dalam cell)
- ⚠️ Gunakan **tanda kutip ganda `"`** (bukan kutip tunggal)
- ⚠️ `tambahan` = **tambahan harga** dari harga dasar (dalam angka Rupiah)

### Contoh 1: Variasi Ukuran/Berat
```
[{"nama":"Ukuran","opsi":[{"label":"500gr","tambahan":0},{"label":"1kg","tambahan":5000}]}]
```
Hasil di website:
- Pilihan: **500gr** (harga normal) | **1kg** (+Rp5.000)

### Contoh 2: Variasi Warna
```
[{"nama":"Warna","opsi":[{"label":"Merah","tambahan":0},{"label":"Hijau","tambahan":0},{"label":"Kuning","tambahan":0}]}]
```
Hasil: 3 pilihan warna, semua harga sama

### Contoh 3: Variasi Berat dengan Harga Berbeda
```
[{"nama":"Berat","opsi":[{"label":"250gr","tambahan":0},{"label":"500gr","tambahan":8000},{"label":"1kg","tambahan":20000}]}]
```

### Contoh 4: Dua Jenis Variasi Sekaligus
```
[{"nama":"Ukuran","opsi":[{"label":"S","tambahan":0},{"label":"L","tambahan":3000}]},{"nama":"Warna","opsi":[{"label":"Merah","tambahan":0},{"label":"Hijau","tambahan":0}]}]
```
Hasil: pembeli harus pilih ukuran DAN warna

### Jika Tidak Ada Variasi
Kosongkan kolom `variasi_json` — pembeli langsung beli tanpa pilihan.

---

## 📂 Mengelola Kategori

### Tab: `categories`

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `id` | ID unik | `1` |
| `nama` | Nama kategori | `Sayuran Segar` |
| `slug` | URL slug (huruf kecil, pakai `-`) | `sayuran-segar` |
| `icon_url` | Nama ikon Material | `nutrition` |
| `urutan` | Urutan tampil | `1` |
| `aktif` | Tampilkan? | `TRUE` |

### Ikon yang Tersedia

| Ikon | Nama | Cocok untuk |
|------|------|-------------|
| 🥬 | `nutrition` | Sayuran |
| 🍊 | `emoji_nature` | Buah-buahan |
| 🍽️ | `set_meal` | Lauk Pauk |
| 🍲 | `soup_kitchen` | Bumbu Dapur |
| ☕ | `local_cafe` | Minuman |
| 🍪 | `cookie` | Snack |
| 📦 | `inventory_2` | Lainnya |

> Cari ikon lain di: [fonts.google.com/icons](https://fonts.google.com/icons)

### Menambah Kategori Baru
1. Tambah baris baru di tab `categories`
2. Isi `id` (unik), `nama`, `slug`, `icon_url`
3. Pastikan `aktif` = `TRUE`
4. Produk baru yang mau masuk kategori ini: isi `kategori_id` di tab `products` dengan `id` kategori baru
5. Klik **🔄 Update Website**

---

## 💳 Mengelola Pembayaran

### Tab: `payment_methods`

Kolom yang tersedia:

| Kolom | Isi |
|-------|-----|
| `tipe` | `transfer`, `qris`, atau `cod` |
| `provider` | Nama bank/provider |
| `no_rekening` | Nomor rekening (untuk transfer) |
| `atas_nama` | Nama pemilik rekening |
| `logo_url` | URL logo bank (opsional) |
| `instruksi` | Instruksi singkat |
| `qris_url` | **URL foto QR Code** (khusus QRIS) |
| `aktif` | `TRUE` atau `FALSE` |

### Contoh Pengisian

#### Transfer Bank (1 baris per bank):

| tipe | provider | no_rekening | atas_nama | logo_url | instruksi | qris_url | aktif |
|------|----------|-------------|-----------|----------|-----------|----------|-------|
| transfer | BSI | 7012345678 | Ahmad Ibrahim | | Transfer ke BSI | | TRUE |
| transfer | Mandiri | 1234567890 | Ahmad Ibrahim | | Transfer ke Mandiri | | TRUE |
| transfer | JAGO | 9876543210 | Ahmad Ibrahim | | Transfer ke JAGO | | TRUE |

#### QRIS:

| tipe | provider | no_rekening | atas_nama | logo_url | instruksi | qris_url | aktif |
|------|----------|-------------|-----------|----------|-----------|----------|-------|
| qris | QRIS | | Pesan Sayur | | Scan QR Code | `https://url-foto-qris-kamu` | TRUE |

**Cara upload foto QRIS:**
1. Screenshot QR Code statis dari aplikasi bank
2. Upload ke Google Drive → klik kanan → **Bagikan** → **Siapa saja yang memiliki link**
3. Copy URL → ubah format (lihat [bagian Upload Foto](#-upload-foto-google-drive))
4. Paste di kolom `qris_url`

#### COD:

| tipe | provider | instruksi | aktif |
|------|----------|-----------|-------|
| cod | COD | Bayar tunai saat pesanan tiba | TRUE |

### Apa yang Muncul di Website

- **Transfer Bank dipilih** → muncul daftar semua bank + no rekening + tombol **Salin**
- **QRIS dipilih** → daftar bank tertutup, muncul **foto QR Code**
- **COD dipilih** → muncul info: "💵 Gunakan uang pas agar memudahkan kurir"

### Mengubah/Menambah Bank
- Tambah baris baru dengan `tipe` = `transfer`
- Isi provider, no_rekening, atas_nama
- Klik **🔄 Update Website**

### Menghapus Bank
- Hapus baris bank tersebut dari spreadsheet
- Klik **🔄 Update Website**

---

## 🖼️ Mengelola Slider Promo

### Tab: `sliders`

Slider promo tampil di bagian atas homepage sebagai carousel.

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `id` | ID unik | `1` |
| `gambar_url` | URL gambar banner | `https://...` |
| `judul` | Judul promo | `Belanja Segar Setiap Hari` |
| `deskripsi` | Deskripsi singkat | `Gratis ongkir min Rp100rb` |
| `tipe_link` | Jenis link | `kategori` atau `url` |
| `link_tujuan` | URL tujuan saat diklik | `/kategori/sayuran-segar` |
| `urutan` | Urutan tampil | `1` |
| `aktif` | Tampilkan? | `TRUE` |

**Tips:**
- Ukuran gambar banner optimal: **1200 x 400 pixel** (rasio 3:1)
- `link_tujuan` bisa ke halaman internal (`/kategori/...`) atau URL eksternal
- Set `aktif` = `FALSE` untuk menyembunyikan slider tanpa menghapus

---

## 🎫 Mengelola Kupon Diskon

### Tab: `coupons`

> 💡 **Kupon langsung aktif tanpa deploy!** Validasi kupon dilakukan secara real-time dari GAS.

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `kode` | Kode kupon (HURUF BESAR) | `HEMAT10` |
| `tipe` | Jenis diskon | `persen`, `nominal`, atau `gratis_ongkir` |
| `nilai` | Nilai diskon | `10` (10%) atau `5000` (Rp5.000) |
| `min_order` | Minimum belanja untuk pakai kupon | `50000` |
| `max_diskon` | Batas maks diskon (khusus tipe `persen`) | `15000` |
| `batas_pakai` | Maks total penggunaan (0 = unlimited) | `100` |
| `sudah_dipakai` | Counter otomatis (jangan diubah manual) | `0` |
| `berlaku_dari` | Tanggal mulai (format: `YYYY-MM-DD`) | `2026-01-01` |
| `berlaku_sampai` | Tanggal berakhir | `2026-12-31` |
| `aktif` | Aktif? | `TRUE` |

### Tipe Kupon

| Tipe | Cara Kerja | Contoh |
|------|-----------|--------|
| `persen` | Diskon X% dari subtotal (maks `max_diskon`) | `nilai`=10, `max_diskon`=15000 → diskon 10% maks Rp15.000 |
| `nominal` | Potongan langsung Rp X | `nilai`=5000 → potongan Rp5.000 |
| `gratis_ongkir` | Ongkir jadi Rp0 | `nilai`=0, `min_order`=75000 |

### Contoh Membuat Kupon Baru

Ingin buat kupon: **PROMO20** — diskon 20%, maks Rp25.000, min belanja Rp100.000, berlaku sampai akhir bulan:

| kode | tipe | nilai | min_order | max_diskon | batas_pakai | sudah_dipakai | berlaku_dari | berlaku_sampai | aktif |
|------|------|-------|-----------|------------|-------------|---------------|-------------|----------------|-------|
| PROMO20 | persen | 20 | 100000 | 25000 | 50 | 0 | 2026-02-01 | 2026-02-28 | TRUE |

---

## 🏪 Info Toko & Pengiriman

### Tab: `stores`

| Kolom | Isi | Catatan |
|-------|-----|---------|
| `nama` | Nama toko | |
| `alamat` | Alamat lengkap | |
| `lat` | Latitude GPS | Dapatkan dari Google Maps |
| `lng` | Longitude GPS | Dapatkan dari Google Maps |
| `telepon` | Nomor telepon | Format: `081219199323` |
| `whatsapp` | Nomor WA | Format: `6281219199323` (pakai 62, bukan 0) |
| `jam_buka` | Jam operasional | `06:00 - 20:00` |
| `tarif_per_km` | Ongkir per km (Rp) | `3000` = Rp3.000/km |
| `min_order` | Minimum order (Rp) | `25000` |
| `max_jarak_km` | Jarak maks pengiriman (km) | `10` |
| `gratis_ongkir_diatas` | Gratis ongkir jika belanja ≥ (Rp) | `100000` |

### Cara Mendapatkan Koordinat GPS
1. Buka [Google Maps](https://maps.google.com)
2. Klik kanan di lokasi toko
3. Klik angka koordinat yang muncul (otomatis ter-copy)
4. Format: `-6.175, 106.827` → isi `lat` = `-6.175`, `lng` = `106.827`

---

## 📦 Melihat Pesanan Masuk

### Tab: `orders`

Tab ini **otomatis terisi** saat pelanggan checkout. **Jangan ubah headers.**

| Kolom | Isi |
|-------|-----|
| `id_order` | ID pesanan (format: ORD-xxxx) |
| `tanggal` | Waktu order |
| `nama` | Nama pelanggan |
| `telepon` | HP pelanggan |
| `alamat` | Alamat pengiriman |
| `items_json` | Detail item (format JSON) |
| `subtotal` | Total harga barang |
| `ongkir` | Ongkos kirim |
| `total` | Total bayar |
| `jadwal` | Jadwal pengiriman |
| `metode_bayar` | Metode pembayaran |
| `status` | Status (default: pending) |
| `catatan` | Catatan dari pelanggan |
| `diskon` | Jumlah diskon |
| `kupon` | Kode kupon yang dipakai |
| `link_maps` | Link Google Maps pelanggan |

**Tips:**
- Urutkan berdasarkan kolom `tanggal` untuk melihat pesanan terbaru
- Gunakan filter untuk cari pesanan berdasarkan nama/telepon
- Kolom `status` bisa diubah manual untuk tracking (misal: `pending` → `diproses` → `dikirim` → `selesai`)

---

## 🔄 Update Website (Deploy)

### Mana yang Perlu Deploy, Mana yang Tidak?

| Perubahan | Perlu Deploy? | Cara |
|-----------|:------------:|------|
| Ubah harga produk | ✅ Ya | Klik 🔄 Update Website |
| Tambah produk baru | ✅ Ya | Klik 🔄 Update Website |
| Ubah foto produk | ✅ Ya | Klik 🔄 Update Website |
| Ubah info bank/QRIS | ✅ Ya | Klik 🔄 Update Website |
| Ubah slider promo | ✅ Ya | Klik 🔄 Update Website |
| Tambah/edit kupon | ❌ Tidak | Langsung aktif |
| Lihat pesanan | ❌ Tidak | Otomatis terisi |

### Cara Update Website

1. Setelah selesai mengubah data di spreadsheet
2. Klik menu **🛒 Pesan Sayur** di toolbar
3. Klik **🔄 Update Website**
4. Klik **Ya** pada konfirmasi
5. Tunggu ~1-2 menit
6. Website sudah ter-update! ✅

> **Catatan:** Jika menu **🛒 Pesan Sayur** tidak muncul, reload halaman spreadsheet (F5).

---

## 📸 Upload Foto (Google Drive)

### Langkah Upload

1. Buka [drive.google.com](https://drive.google.com)
2. Upload gambar (drag & drop atau klik **+ Baru**)
3. Klik kanan file → **Bagikan** → **Ubah ke siapa saja yang memiliki link**
4. Copy link yang muncul

### Konversi URL

URL Google Drive **tidak bisa langsung dipakai** sebagai gambar. Harus dikonversi:

**URL asli:**
```
https://drive.google.com/file/d/ABC123xyz/view?usp=sharing
```

**Ubah menjadi:**
```
https://lh3.googleusercontent.com/d/ABC123xyz
```

> Ganti `ABC123xyz` dengan File ID dari URL asli (bagian antara `/d/` dan `/view`)

### Tips Foto Produk
- **Ukuran ideal:** 800 x 800 pixel (kotak)
- **Format:** JPG atau PNG
- **Background:** putih polos lebih baik
- **Ukuran file:** di bawah 1 MB agar web cepat

### Tips Foto QRIS
- Screenshot dari aplikasi bank (pastikan QR Code terlihat jelas)
- Crop hanya bagian QR Code-nya saja
- Upload ke Google Drive → konversi URL → paste di kolom `qris_url`

### Tips Foto Slider/Banner
- **Ukuran ideal:** 1200 x 400 pixel (rasio 3:1)
- Gunakan desain menarik dengan teks promo

---

## ❓ FAQ & Troubleshooting

### Produk tidak muncul di website?
1. Cek kolom `aktif` harus `TRUE`
2. Cek kolom `stok` > 0
3. Sudah klik **🔄 Update Website**?
4. Tunggu 1-2 menit setelah update

### Foto tidak muncul?
1. Pastikan foto di Google Drive di-share **"Siapa saja yang memiliki link"**
2. Pastikan URL sudah dikonversi ke format `https://lh3.googleusercontent.com/d/FILE_ID`
3. Coba buka URL foto di browser — jika tidak muncul, link belum benar

### Kupon tidak bisa dipakai pelanggan?
Cek semua syarat:
- `aktif` = `TRUE`
- Tanggal sekarang antara `berlaku_dari` dan `berlaku_sampai`
- `sudah_dipakai` < `batas_pakai`
- Subtotal pelanggan ≥ `min_order`

### Menu "🛒 Pesan Sayur" tidak muncul?
1. Reload halaman spreadsheet (F5 atau Ctrl+R)
2. Jika masih tidak muncul: buka **Ekstensi → Apps Script** → jalankan fungsi `onOpen` manual

### Website error setelah update?
1. Buka [Vercel Dashboard](https://vercel.com) → project **pesan-sayur**
2. Cek tab **Deployments** → lihat status terakhir
3. Jika error, klik deployment yang error → baca error log
4. Biasanya karena data di spreadsheet ada yang tidak valid (misal URL foto kosong di produk aktif)

### Bagaimana cara ganti nomor WA toko?
1. Ubah kolom `whatsapp` di tab `stores` (format: `628xxxxx`)
2. Klik **🔄 Update Website**

---

## 📝 Checklist Sebelum Go-Live

- [ ] Semua produk sudah ada foto (URL valid)
- [ ] Harga sudah benar (angka tanpa Rp)
- [ ] Kategori produk sudah sesuai
- [ ] No rekening bank sudah benar (BSI, Mandiri, JAGO)
- [ ] Foto QRIS sudah diupload
- [ ] Alamat & koordinat toko sudah benar
- [ ] Nomor WA toko sudah benar (format 628xxx)
- [ ] Kupon promo sudah dibuat (jika ada)
- [ ] Slider banner promo sudah disiapkan
- [ ] Sudah test checkout dari HP
