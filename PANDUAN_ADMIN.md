# 📖 PANDUAN ADMIN — MATJAR SAYUR (v2.0)

Panduan lengkap mengelola toko online **Matjar Sayur** melalui Google Sheets.
Semua data produk, harga, foto, pembayaran, promo, pesanan, stok, dan laporan dikontrol dari spreadsheet.

> **Versi:** 2.0 — Update 21 Februari 2026
> **Fitur baru:** Manajemen Stok, Jadwal & Persiapan, Export & Laporan, Pelanggan & Promo, Otomasi & Trigger, Keuangan, Manajemen Order, Arsip Bulanan

---

## 📋 DAFTAR ISI

1. [Akses & Struktur Spreadsheet](#-akses--struktur-spreadsheet)
2. [Mengelola Produk](#-mengelola-produk)
3. [Variasi Produk](#-variasi-produk)
4. [Mengelola Kategori](#-mengelola-kategori)
5. [Mengelola Pembayaran](#-mengelola-pembayaran)
6. [Mengelola Slider Promo](#-mengelola-slider-promo)
7. [Mengelola Kupon Diskon](#-mengelola-kupon-diskon)
8. [Info Toko & Pengiriman](#-info-toko--pengiriman)
9. [Pesanan Masuk & Layout Kolom](#-pesanan-masuk--layout-kolom)
10. [WA Follow-up per Baris](#-wa-follow-up-per-baris)
11. [Bulk WA Operations](#-bulk-wa-operations)
12. [Manajemen Stok](#-manajemen-stok)
13. [Jadwal & Persiapan](#-jadwal--persiapan)
14. [Export & Laporan](#-export--laporan)
15. [Pelanggan & Promo](#-pelanggan--promo)
16. [Keuangan](#-keuangan)
17. [Manajemen Order](#-manajemen-order)
18. [Arsip Bulanan](#-arsip-bulanan)
19. [Otomasi & Trigger](#-otomasi--trigger)
20. [Update Website (Deploy)](#-update-website-deploy)
21. [Upload Foto (Google Drive)](#-upload-foto-google-drive)
22. [FAQ & Troubleshooting](#-faq--troubleshooting)
23. [Penanganan Error & Mitigasi](#-penanganan-error--mitigasi)
24. [Checklist Sebelum Go-Live](#-checklist-sebelum-go-live)

---

## 🔗 Akses & Struktur Spreadsheet

**URL Spreadsheet:**
`https://docs.google.com/spreadsheets/d/1HHVN9Fn6wHb0xGbHsHAqFrqAxklNinJjpKyvqZTAYQg`

**URL Website:**
`https://matjarsayur.com`

**URL GAS (API):**
`https://script.google.com/macros/s/AKfycby9w4L_2JbjSaUAcSl7MVgvOKfTuHfzWDsKdVzFljEEZPusbiU94X1c7JfYQiJTRK99Fg/exec`

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

> **Penting:** Untuk tab yang bertanda ✅, setelah mengubah data, klik **🛒 Matjar Sayur → 🔄 Update Website** agar perubahan muncul di web.

### Menu Utama di Google Sheets

Setelah buka Spreadsheet, menu **🛒 Matjar Sayur** muncul di toolbar atas. Berisi:

| Sub-Menu | Item | Fungsi |
|----------|------|--------|
| *(langsung)* | 🔄 Update Website | Push data ke GitHub → rebuild Vercel |
| 📱 WA per Baris | 5 template | Kirim WA ke 1 pelanggan (pilih baris dulu) |
| 📦 Bulk WA | 4 operasi | Kirim WA ke banyak pelanggan sekaligus |
| 📅 Persiapan | 4 item | Jadwal, persiapan barang, packing, kurir |
| 📦 Stok | 3 item | Cek stok, alert menipis, restock |
| 📊 Laporan | 6 item | Dashboard, terlaris, pelanggan, keuangan |
| 🔧 Order | 2 item | Cari order, cancel & refund |
| 📢 Promo | 1 item | Broadcast WA ke pelanggan |
| *(langsung)* | Refresh WA Links, Arsip, Triggers, Headers | Utilitas |

> Jika menu tidak muncul, tekan **F5** untuk refresh halaman.

---

## 🥬 Mengelola Produk

### Tab: `products`

| Kolom | Wajib? | Isi | Contoh |
|-------|:------:|-----|--------|
| `id` | ✅ | ID unik (angka, tidak boleh sama) | `1`, `2`, `9` |
| `kategori_id` | ✅ | ID dari tab `categories` | `1` = Sayuran |
| `nama` | ✅ | Nama produk | `Bayam Hijau Ikat Segar` |
| `slug` | ✅ | URL-friendly (huruf kecil, pakai `-`) | `bayam-hijau-ikat-segar` |
| `deskripsi` | ✅ | Deskripsi lengkap | *(teks bebas)* |
| `harga` | ✅ | Harga normal (**angka saja**) | `5500` |
| `harga_diskon` | | Harga promo (kosongkan jika tidak promo) | `3500` atau *kosong* |
| `foto_utama` | ✅ | URL foto publik | `https://...` |
| `foto_galeri` | | URL foto tambahan, pisah koma | `https://url1, https://url2` |
| `stok` | ✅ | Jumlah stok tersedia | `100` |
| `satuan` | ✅ | Satuan jual | `ikat`, `kg`, `pack` |
| `aktif` | ✅ | Tampilkan di web? | `TRUE` / `FALSE` |
| `unggulan` | | Tampil di homepage? | `TRUE` / `FALSE` |
| `urutan` | | Urutan tampil (kecil = duluan) | `1`, `2`, `3` |
| `min_qty` | | Minimal pembelian | `1` |
| `variasi_json` | | Variasi (format JSON) | *(lihat bagian variasi)* |
| `seo_title` | | Judul Google Search | `Bayam - Matjar Sayur` |
| `seo_desc` | | Deskripsi Google Search | *(teks pendek)* |
| `kategori_nama` | | Nama kategori (display) | `Sayuran` |

### Cara Tambah Produk Baru
1. Buka tab `products`
2. Scroll ke baris kosong paling bawah
3. Isi semua kolom wajib (✅)
4. Pastikan: `id` unik, `slug` unik huruf kecil pakai `-`, `aktif` = `TRUE`, `foto_utama` URL valid
5. Klik **🛒 Matjar Sayur → 🔄 Update Website**

### Cara Update Harga
1. Cari produk → ubah kolom `harga` → **angka saja** (tanpa "Rp", tanpa titik)
   - ✅ Benar: `5500` | ❌ Salah: `Rp 5.500`
2. Untuk promo: isi `harga_diskon` | Hapus promo: kosongkan `harga_diskon`
3. Klik **🔄 Update Website**

### Cara Nonaktifkan/Hapus Produk
- **Nonaktifkan** (tetap di sheet, tidak tampil): ubah `aktif` = `FALSE`
- **Hapus permanen**: hapus seluruh baris → klik **🔄 Update Website**

> ⚠️ **Stok otomatis berkurang** saat ada order masuk. Jika stok = 0, produk tetap tampil tapi tidak bisa dipesan.

---

## 🎨 Variasi Produk

Isi di kolom **`variasi_json`** menggunakan format JSON.

### Aturan Penting
- ⚠️ JSON harus dalam **1 baris** (jangan enter di dalam cell)
- ⚠️ Gunakan **tanda kutip ganda `"`** (bukan kutip tunggal)
- ⚠️ `tambahan` = **tambahan harga** dari harga dasar (Rupiah)

### Contoh
| Jenis | JSON | Hasil |
|-------|------|-------|
| Ukuran | `[{"nama":"Ukuran","opsi":[{"label":"500gr","tambahan":0},{"label":"1kg","tambahan":5000}]}]` | 500gr (normal) / 1kg (+Rp5.000) |
| Warna | `[{"nama":"Warna","opsi":[{"label":"Merah","tambahan":0},{"label":"Hijau","tambahan":0}]}]` | 3 warna, harga sama |
| 2 Variasi | `[{"nama":"Ukuran","opsi":[{"label":"S","tambahan":0},{"label":"L","tambahan":3000}]},{"nama":"Warna","opsi":[{"label":"Merah","tambahan":0},{"label":"Hijau","tambahan":0}]}]` | Pilih ukuran DAN warna |

Jika tidak ada variasi: **kosongkan** kolom `variasi_json`.

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

### Ikon Tersedia
| Ikon | Nama | Cocok untuk |
|------|------|-------------|
| 🥬 | `nutrition` | Sayuran |
| 🍊 | `emoji_nature` | Buah |
| 🍽️ | `set_meal` | Lauk Pauk |
| 🍲 | `soup_kitchen` | Bumbu |
| ☕ | `local_cafe` | Minuman |
| 🍪 | `cookie` | Snack |

> Cari ikon lain di: [fonts.google.com/icons](https://fonts.google.com/icons)

---

## 💳 Mengelola Pembayaran

### Tab: `payment_methods`

| Kolom | Isi |
|-------|-----|
| `tipe` | `transfer`, `qris`, atau `cod` |
| `provider` | Nama bank/provider |
| `no_rekening` | Nomor rekening (untuk transfer) |
| `atas_nama` | Nama pemilik rekening |
| `logo_url` | URL logo bank (opsional) |
| `instruksi` | Instruksi singkat |
| `qris_url` | URL foto QR Code (khusus QRIS) |
| `aktif` | `TRUE` atau `FALSE` |

### Contoh Pengisian

**Transfer Bank (1 baris per bank):**
| tipe | provider | no_rekening | atas_nama | instruksi | aktif |
|------|----------|-------------|-----------|-----------|-------|
| transfer | BSI | 7012345678 | Jeffri | Transfer ke BSI | TRUE |
| transfer | JAGO | 9876543210 | Jeffri | Transfer ke JAGO | TRUE |

**QRIS:**
| tipe | provider | atas_nama | qris_url | aktif |
|------|----------|-----------|----------|-------|
| qris | QRIS | Matjar Sayur | `https://url-foto-qris` | TRUE |

**COD:**
| tipe | provider | instruksi | aktif |
|------|----------|-----------|-------|
| cod | COD | Bayar tunai saat pesanan tiba | TRUE |

---

## 🖼️ Mengelola Slider Promo

### Tab: `sliders`

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

> Ukuran gambar optimal: **1200 x 400 pixel** (rasio 3:1)

---

## 🎫 Mengelola Kupon Diskon

### Tab: `coupons`

> 💡 **Kupon langsung aktif tanpa deploy!** Validasi real-time dari GAS.

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `kode` | Kode kupon (HURUF BESAR) | `HEMAT10` |
| `tipe` | `persen`, `nominal`, atau `gratis_ongkir` | `persen` |
| `nilai` | Nilai diskon | `10` (10%) atau `5000` (Rp5.000) |
| `min_order` | Minimum belanja | `50000` |
| `max_diskon` | Batas maks (khusus persen) | `15000` |
| `batas_pakai` | Maks total penggunaan (0 = unlimited) | `100` |
| `sudah_dipakai` | Counter otomatis (**jangan diubah**) | `0` |
| `berlaku_dari` | Tanggal mulai (`YYYY-MM-DD`) | `2026-01-01` |
| `berlaku_sampai` | Tanggal berakhir | `2026-12-31` |
| `aktif` | Aktif? | `TRUE` |

### Tipe Kupon
| Tipe | Cara Kerja |
|------|-----------|
| `persen` | Diskon X% (maks `max_diskon`) |
| `nominal` | Potongan langsung Rp X |
| `gratis_ongkir` | Ongkir jadi Rp0 |

---

## 🏪 Info Toko & Pengiriman

### Tab: `stores`

| Kolom | Isi | Catatan |
|-------|-----|---------|
| `nama` | Nama toko | |
| `alamat` | Alamat lengkap | |
| `lat` / `lng` | Koordinat GPS | Dari Google Maps |
| `telepon` | Nomor telepon | `081219199323` |
| `whatsapp` | Nomor WA | `6281219199323` (pakai 62) |
| `jam_buka` | Jam operasional | `06:00 - 20:00` |
| `tarif_per_km` | Ongkir per km (Rp) | `3000` |
| `min_order` | Minimum order (Rp) | `10000` |
| `max_jarak_km` | Jarak maks (km) | `10` |
| `gratis_ongkir_diatas` | Gratis ongkir jika ≥ (Rp) | `100000` |

### Cara Mendapatkan Koordinat GPS
1. Buka Google Maps → klik kanan di lokasi toko
2. Klik angka koordinat (otomatis ter-copy)
3. Format: `-4.383, 104.337` → `lat` = `-4.383`, `lng` = `104.337`

---

## 📦 Pesanan Masuk & Layout Kolom

### Tab: `orders`

Tab ini **otomatis terisi** saat pelanggan checkout. **Jangan ubah headers.**

### Layout Kolom Orders

| Kolom | Posisi | Isi |
|-------|--------|-----|
| A: `id_order` | 1 | ID pesanan (ORD-xxxx) |
| B: `tanggal` | 2 | Waktu order (ISO) |
| C: `nama` | 3 | Nama pelanggan |
| D: `telepon` | 4 | HP pelanggan |
| E: `alamat` | 5 | Alamat pengiriman |
| F: `items_json` | 6 | Detail item (JSON) |
| G: `subtotal` | 7 | Total harga barang |
| H: `ongkir` | 8 | Ongkos kirim |
| I: `total` | 9 | Total bayar |
| J: `jadwal` | 10 | Jadwal pengiriman |
| K: `metode_bayar` | 11 | Metode bayar |
| L: `status` | 12 | Status order |
| M: `catatan` | 13 | Catatan pelanggan |
| N: *(spacer)* | 14 | *(kosong)* |
| **O-S: WA Links** | **15-19** | **Link WA clickable (auto-generated)** |
| T: `diskon` | 20 | Jumlah diskon |
| U: `kupon` | 21 | Kode kupon |
| V: `link_maps` | 22 | Link Google Maps |

### Kolom WA Auto-Generated (O-S)

Saat order masuk, kolom O-S **otomatis terisi** dengan link WA clickable:

| Kolom | Label | Fungsi |
|-------|-------|--------|
| O (15) | ✅ Konfirmasi | Klik → buka WA konfirmasi pesanan |
| P (16) | 💳 Reminder | Klik → buka WA reminder bayar (atau "✅ COD" jika COD) |
| Q (17) | 🚚 Dikirim | Klik → buka WA notif dikirim |
| R (18) | 🎉 Selesai | Klik → buka WA pesanan selesai |
| S (19) | 🖨️ Struk | Klik → buka halaman struk kurir |

> **Cara pakai:** Klik link di kolom O-S → otomatis buka WhatsApp dengan pesan siap kirim.

### Alur Status Order

```
pending → confirmed → shipped → completed
                                    ↗
pending → cancelled (auto/manual)
```

| Status | Artinya | Cara Berubah |
|--------|---------|-------------|
| `pending` | Menunggu konfirmasi/bayar | Otomatis saat order masuk |
| `confirmed` | Sudah dikonfirmasi | Klik WA Konfirmasi atau Bulk Konfirmasi |
| `shipped` | Sedang diantar | Klik WA Dikirim atau Bulk Dikirim |
| `completed` | Selesai diterima | Klik WA Selesai atau Bulk Selesai |
| `cancelled` | Dibatalkan | Manual atau auto-cancel (>24 jam) |

---

## 📱 WA Follow-up per Baris

### Cara Pakai
1. Buka tab **orders**
2. **Klik 1 baris** order yang ingin di-follow-up
3. Klik menu **🛒 Matjar Sayur → 📱 WA per Baris**
4. Pilih template

### Template Tersedia

| Template | Fungsi | Status Berubah ke |
|----------|--------|:-----------------:|
| ✅ Konfirmasi Pesanan | Kirim pesan konfirmasi + detail order + link struk | `confirmed` |
| 💳 Reminder Pembayaran | Kirim reminder bayar + info rekening (skip COD) | *(tidak berubah)* |
| 🚚 Pesanan Dikirim | Notif pesanan sedang diantar + estimasi tiba | `shipped` |
| 🎉 Pesanan Selesai | Ucapan terima kasih + ajakan belanja lagi | `completed` |
| 💬 Pesan Custom | Tulis pesan sendiri → kirim via WA | *(tidak berubah)* |

### Yang Terjadi Saat Klik Template
1. System membaca data order dari baris yang dipilih
2. Generate pesan WA otomatis berisi: nama, ID order, items, total, jadwal
3. Muncul popup dengan tombol **📱 Buka WhatsApp**
4. Status order otomatis ter-update (jika template mengubah status)

### Kemungkinan Error
| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Buka tab orders dulu" | Kamu tidak di tab orders | Pindah ke tab `orders` |
| "Pilih baris data pesanan" | Klik di header (baris 1) | Klik baris 2 ke bawah |
| "Pesanan COD, tidak perlu reminder" | Reminder dipanggil untuk order COD | Normal, tidak perlu reminder |

---

## 📦 Bulk WA Operations

Kirim WA ke **banyak pelanggan sekaligus**. Menu: **🛒 Matjar Sayur → 📦 Bulk WA**

| Menu | Target | Status Berubah |
|------|--------|:--------------:|
| ✅ Bulk Konfirmasi | Semua order `pending` → kirim konfirmasi | → `confirmed` |
| 💳 Bulk Reminder | Semua order `pending` non-COD → reminder bayar | *(tidak berubah)* |
| 🚚 Bulk Dikirim | Semua order `confirmed` → notif dikirim | → `shipped` |
| 🎉 Bulk Selesai | Semua order `shipped` → notif selesai | → `completed` |

### Cara Pakai
1. Klik menu Bulk yang diinginkan
2. Muncul popup konfirmasi berisi daftar pelanggan
3. Klik **Ya**
4. Muncul popup dengan tombol WA untuk **setiap pelanggan**
5. Klik satu per satu untuk buka WA masing-masing

> ⚠️ Kamu harus klik setiap tombol WA satu per satu. Tidak bisa kirim otomatis (keterbatasan WA Web API).

---

## 📦 Manajemen Stok

Menu: **🛒 Matjar Sayur → 📦 Stok**

### Fitur Stok

| Menu | Fungsi |
|------|--------|
| 📊 Cek Sisa Stok | Popup daftar semua produk + sisa stok |
| ⚠️ Stok Menipis | Alert produk dengan stok rendah |
| 🔄 Restock Cepat | Form HTML untuk tambah stok beberapa produk sekaligus |

### Auto-Kurangi Stok
- Saat order masuk (`doPost`), stok **otomatis berkurang** sesuai qty yang dipesan
- Tidak perlu kurangi manual
- Jika error saat kurangi stok, order tetap masuk (stok dikurangi best-effort)

### Auto-Kembalikan Stok
- Saat order di-cancel (`cancelOrder`), stok **otomatis dikembalikan**

### Alert Stok Menipis (Otomatis)
- Jika trigger sudah di-setup, alert stok menipis berjalan otomatis **setiap jam 06:00**
- Muncul peringatan untuk produk yang stoknya di bawah ambang batas

### Restock Cepat
1. Klik **🔄 Restock Cepat**
2. Muncul form HTML berisi semua produk
3. Isi jumlah restock untuk setiap produk
4. Klik **Submit** → stok langsung bertambah di sheet `products`

---

## 📅 Jadwal & Persiapan

Menu: **🛒 Matjar Sayur → 📅 Persiapan**

| Menu | Fungsi | Output |
|------|--------|--------|
| 📊 Pesanan per Jadwal | Kelompokan pesanan berdasarkan jadwal kirim | Popup dashboard |
| 📋 Export Persiapan Barang | Daftar total barang yang harus disiapkan | Sheet baru / popup |
| 📦 Export Packing per Pembeli | Daftar packing per pembeli | Sheet baru / popup |
| 🚚 Daftar Pengiriman (Kurir) | Daftar alamat + item untuk kurir | Sheet baru / popup |

### Alur Kerja Harian
1. **Pagi:** Cek **Pesanan per Jadwal** → lihat ada berapa pesanan hari ini
2. **Siapkan:** **Export Persiapan Barang** → total sayur/buah yang perlu disiapkan
3. **Packing:** **Export Packing per Pembeli** → packing per orang
4. **Kirim:** **Daftar Pengiriman** → kasih ke kurir

### Reminder Persiapan Besok (Otomatis)
- Berjalan otomatis **jam 20:00** setiap malam
- Mengingatkan admin untuk menyiapkan barang pesanan besok

---

## 📊 Export & Laporan

Menu: **🛒 Matjar Sayur → 📊 Laporan**

| Menu | Fungsi |
|------|--------|
| 📈 Dashboard Hari Ini | Ringkasan: jumlah order, revenue, status breakdown |
| 🏆 Produk Terlaris | Top 10 produk berdasarkan qty terjual |
| 👥 Top Pelanggan | Pelanggan paling sering/banyak belanja |
| 💰 Rekap Keuangan | Rekap pendapatan, ongkir, diskon |
| 📋 Barang Terjual Hari Ini | Export daftar barang yang terjual hari ini |
| 📅 Laporan per Periode | Laporan range tanggal tertentu (termasuk arsip) |

### Dashboard Hari Ini
Menampilkan popup visual berisi:
- Total order hari ini
- Revenue hari ini
- Breakdown per status (pending/confirmed/shipped/completed)
- Rata-rata per order
- Total all-time

### Laporan Harian Otomatis
- Berjalan otomatis **jam 23:00** setiap malam (jika trigger di-setup)
- Merangkum aktivitas hari ini

---

## 👥 Pelanggan & Promo

Menu: **🛒 Matjar Sayur → 📊 Laporan** dan **📢 Promo**

### Top Pelanggan
- Menampilkan daftar pelanggan berdasarkan total belanja
- Berguna untuk program loyalty atau promo khusus

### Broadcast WA
1. Klik **📢 Promo → 📱 Broadcast WA**
2. Tulis pesan promo
3. System mengumpulkan nomor WA pelanggan dari history order
4. Muncul link WA untuk setiap pelanggan
5. Klik satu per satu untuk kirim

> ⚠️ Broadcast menggunakan data telepon dari order. Pastikan nomor pelanggan lengkap.

---

## 💰 Keuangan

Menu: **🛒 Matjar Sayur → 📊 Laporan → 💰 Rekap Keuangan**

Menampilkan:
- Total pendapatan (subtotal semua order)
- Total ongkir terkumpul
- Total diskon yang diberikan
- Pendapatan bersih

---

## 🔧 Manajemen Order

Menu: **🛒 Matjar Sayur → 🔧 Order**

### Cari Order
1. Klik **🔍 Cari Order**
2. Masukkan ID order atau nama pelanggan
3. System mencari di sheet `orders` **dan** sheet arsip
4. Menampilkan detail order yang ditemukan

### Cancel & Refund
1. Pilih baris order di tab `orders`
2. Klik **❌ Cancel & Refund**
3. Konfirmasi pembatalan
4. Yang terjadi:
   - Status berubah ke `cancelled`
   - **Stok otomatis dikembalikan** ke sheet `products`

> ⚠️ Cancel tidak bisa di-undo. Pastikan sebelum membatalkan.

---

## 📂 Arsip Bulanan

Menu: **🛒 Matjar Sayur → 📂 Arsip Bulanan**

### Apa itu Arsip?
- Memindahkan order lama dari sheet `orders` ke sheet arsip terpisah (contoh: `arsip_2026-01`)
- Mencegah sheet `orders` terlalu besar dan lambat
- Order yang di-arsip masih bisa dicari via **Cari Order**

### Cara Kerja
1. Klik **📂 Arsip Bulanan**
2. System memfilter order yang sudah `completed` atau `cancelled`
3. Pindahkan ke sheet arsip → hapus dari sheet `orders`

### Auto-Arsip (Otomatis)
- Jika trigger di-setup, arsip berjalan otomatis **jam 01:00** setiap malam
- Hanya mengarsip order yang sudah selesai

---

## ⚙️ Otomasi & Trigger

Menu: **🛒 Matjar Sayur → ⚙️ Setup Triggers**

### Cara Setup
1. Klik **⚙️ Setup Triggers** dari menu (atau jalankan `setupAllTriggers` dari Apps Script Editor)
2. Muncul konfirmasi 6 trigger berhasil dipasang

### Daftar Trigger yang Dipasang

| Trigger | Jadwal | Apa yang Dilakukan |
|---------|--------|-------------------|
| ⏰ Auto Cancel | Setiap 1 jam | Cancel order `pending` > 24 jam |
| ⏰ Auto Reminder | Setiap 3 jam | Reminder bayar order `pending` non-COD > 3 jam |
| 🌙 Persiapan Besok | Jam 20:00 | Reminder admin siapkan barang besok |
| 🌙 Laporan Harian | Jam 23:00 | Kirim laporan ringkasan hari ini |
| 🌅 Alert Stok | Jam 06:00 | Alert produk stok menipis |
| 🌙 Auto Arsip | Jam 01:00 | Arsip order lama otomatis |

### Penting
- Trigger hanya perlu di-setup **1x**. Setelah itu jalan otomatis selamanya.
- Jika update Code.gs di Apps Script, jalankan **Setup Triggers** ulang.
- Untuk melihat/menghapus trigger: Apps Script Editor → **Triggers** (ikon jam) di sidebar kiri.

---

## 🔄 Update Website (Deploy)

### Mana yang Perlu Deploy?

| Perubahan | Perlu Deploy? |
|-----------|:------------:|
| Ubah harga/foto/nama produk | ✅ Ya |
| Tambah/hapus produk | ✅ Ya |
| Ubah info bank/QRIS | ✅ Ya |
| Ubah slider promo | ✅ Ya |
| Ubah info toko | ✅ Ya |
| Tambah/edit kupon | ❌ Tidak |
| Lihat/kelola pesanan | ❌ Tidak |
| Semua fitur menu (WA, Laporan, dll) | ❌ Tidak |

### Cara Update Website
1. Selesai ubah data di spreadsheet
2. Klik **🛒 Matjar Sayur → 🔄 Update Website**
3. Klik **Ya** → tunggu ~1-2 menit
4. Website ter-update! ✅

### Apa yang Terjadi di Balik Layar
1. Data dari semua sheet (products, categories, stores, payments, sliders, coupons) dikumpulkan
2. Dikonversi ke file JSON
3. Di-push ke GitHub repository (`marisabisnis/matjar-sayur`) dalam 1 commit
4. Vercel mendeteksi commit baru → auto-rebuild website

---

## 📸 Upload Foto (Google Drive)

### Langkah Upload
1. Buka [drive.google.com](https://drive.google.com)
2. Upload gambar
3. Klik kanan → **Bagikan** → **Siapa saja yang memiliki link**
4. Copy link

### Konversi URL
URL Google Drive harus dikonversi:

**URL asli:**
```
https://drive.google.com/file/d/ABC123xyz/view?usp=sharing
```
**Ubah menjadi:**
```
https://lh3.googleusercontent.com/d/ABC123xyz
```

> Ganti `ABC123xyz` dengan File ID (bagian antara `/d/` dan `/view`)

### Tips Foto
| Jenis | Ukuran Ideal | Format |
|-------|-------------|--------|
| Produk | 800 x 800 px (kotak) | JPG/PNG < 1MB |
| QRIS | Crop QR Code saja | PNG |
| Slider/Banner | 1200 x 400 px (3:1) | JPG/PNG |

---

## ❓ FAQ & Troubleshooting

### Produk tidak muncul di website?
1. Cek `aktif` = `TRUE`
2. Cek `stok` > 0
3. Sudah klik **🔄 Update Website**?
4. Tunggu 1-2 menit cache Vercel

### Foto tidak muncul?
1. Pastikan foto di Google Drive di-share **"Siapa saja yang memiliki link"**
2. URL sudah dikonversi ke format `https://lh3.googleusercontent.com/d/FILE_ID`
3. Test buka URL foto di browser

### Kupon tidak bisa dipakai pelanggan?
Cek semua syarat:
- `aktif` = `TRUE`
- Tanggal sekarang antara `berlaku_dari` dan `berlaku_sampai`
- `sudah_dipakai` < `batas_pakai`
- Subtotal pelanggan ≥ `min_order`

### Menu "🛒 Matjar Sayur" tidak muncul?
1. Refresh halaman (F5)
2. Masih tidak muncul: **Ekstensi → Apps Script** → jalankan `onOpen` manual

### Link WA di kolom O-S tidak muncul/rusak?
1. Klik **🔃 Refresh WA Links** dari menu
2. System akan regenerate semua link untuk semua order

### Order masuk tapi stok tidak berkurang?
- Kemungkinan error saat `kurangiStok`. Cek di Apps Script Editor → **Executions** (sidebar)
- Stok bisa dikurangi manual di tab `products`

### Bagaimana cara ganti nomor WA toko?
1. Ubah kolom `whatsapp` di tab `stores` (format: `628xxxxx`)
2. Klik **🔄 Update Website**

---

## 🛡️ Penanganan Error & Mitigasi

### Error Umum & Solusi

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "GitHub Token belum diatur" | Token belum diisi di Code.gs | Isi `GITHUB_TOKEN` di Apps Script |
| "Gagal ambil branch ref" | Token expired atau salah | Buat token baru di github.com/settings/tokens |
| "Sheet X tidak ditemukan" | Tab sheet hilang/terhapus | Buat tab baru → jalankan `setupHeaders` |
| Menu tidak muncul | Script belum ter-load | Refresh (F5) atau jalankan `onOpen` manual |
| "Pilih baris data pesanan" | Klik di header | Klik baris 2 ke bawah (data, bukan header) |
| Order gagal masuk | Error di `doPost` | Cek Apps Script → Executions untuk detail error |
| Trigger tidak jalan | Trigger belum di-setup / expired | Jalankan `setupAllTriggers` ulang |
| Website error 500 | Data spreadsheet ada yang invalid | Cek Vercel Dashboard → deployment logs |

### Mitigasi & Pencegahan

**1. Data Produk**
- Selalu isi semua kolom wajib sebelum enable `aktif` = TRUE
- Jangan gunakan karakter khusus di `slug` (hanya huruf kecil, angka, dan `-`)
- Pastikan `kategori_id` sesuai dengan ID di tab `categories`
- Jangan duplicate `id` — setiap produk harus ID unik

**2. Foto**
- Selalu test URL foto di browser sebelum paste ke spreadsheet
- Jangan hapus foto di Google Drive yang masih dipakai produk aktif
- Backup foto penting di folder Drive terpisah

**3. Order & Stok**
- Jangan ubah header baris 1 di tab `orders` — akan merusak system
- Jangan hapus order secara manual — gunakan menu **Cancel & Refund**
- Monitor stok secara berkala atau andalkan alert otomatis jam 06:00
- Jika stok menunjukkan angka negatif, koreksi manual di tab `products`

**4. GitHub & Deploy**
- Jika deploy gagal berulang kali: cek token di github.com/settings/tokens
- Token GitHub expire setelah 30/60/90 hari (tergantung setting saat buat)
- Buat token baru jika expired → update di Code.gs Apps Script
- Jangan ubah `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` kecuali pindah repo

**5. Trigger & Otomasi**
- Trigger otomatis punya quota: Google free account = 6 jam total execution/hari
- Jika trigger error, cek di Apps Script → **Executions** → lihat error log
- Auto-cancel hanya berlaku untuk order `pending` > 24 jam
- Auto-reminder hanya untuk non-COD pending > 3 jam

**6. Backup & Recovery**
- Data tersimpan di Google Sheets — otomatis ada version history
- Untuk restore data: Sheets → **File → Version history → See version history**
- Order yang sudah di-arsip tersimpan di sheet `arsip_YYYY-MM` — jangan hapus sheet arsip
- Code.gs tersimpan di file lokal `gas/Code.gs` sebagai backup

### Skenario Darurat

| Skenario | Langkah |
|----------|---------|
| **Website down** | 1. Cek Vercel Dashboard status<br>2. Jika build error: cek data spreadsheet valid<br>3. Klik **🔄 Update Website** ulang |
| **Order tidak masuk** | 1. Cek Apps Script → Executions<br>2. Pastikan deployment masih aktif<br>3. Test endpoint: buka URL GAS + `?action=products` di browser |
| **Semua data hilang** | 1. Sheets → File → Version history → restore versi sebelumnya<br>2. Data order di sheet arsip masih aman |
| **Token GitHub expired** | 1. Buat token baru di github.com/settings/tokens<br>2. Update di Apps Script Editor → Code.gs → `GITHUB_TOKEN`<br>3. Save + Deploy new version |
| **Trigger berhenti** | 1. Apps Script Editor → Triggers → cek status<br>2. Hapus trigger error → jalankan `setupAllTriggers` ulang |
| **Stok kacau/negatif** | 1. Koreksi manual di tab `products` kolom `stok`<br>2. Jika perlu reset: hitung ulang dari order history |

---

## 📝 Checklist Sebelum Go-Live

- [ ] Semua produk sudah ada foto (URL valid, bisa diakses)
- [ ] Harga sudah benar (angka tanpa Rp)
- [ ] Kategori produk sudah sesuai
- [ ] No rekening bank sudah benar
- [ ] Foto QRIS sudah diupload (jika pakai QRIS)
- [ ] Alamat & koordinat toko sudah benar
- [ ] Nomor WA toko sudah benar (format 628xxx)
- [ ] Kupon promo sudah dibuat (jika ada)
- [ ] Slider banner promo sudah disiapkan
- [ ] `GITHUB_TOKEN` sudah diisi di Code.gs
- [ ] Deploy versi terbaru sudah dilakukan
- [ ] `setupAllTriggers` sudah dijalankan
- [ ] Test checkout dari HP berhasil
- [ ] Test klik link WA di kolom O-S berhasil
- [ ] Test menu Dashboard Hari Ini berfungsi

---

## 📞 Kontak & Link Penting

| Item | Link |
|------|------|
| Spreadsheet | [Buka Sheets](https://docs.google.com/spreadsheets/d/1HHVN9Fn6wHb0xGbHsHAqFrqAxklNinJjpKyvqZTAYQg) |
| Website | [matjarsayur.com](https://matjarsayur.com) |
| Apps Script | [Buka Editor](https://script.google.com) |
| GitHub Repo | [marisabisnis/matjar-sayur](https://github.com/marisabisnis/matjar-sayur) |
| Vercel Dashboard | [vercel.com](https://vercel.com) |
| GitHub Token | [github.com/settings/tokens](https://github.com/settings/tokens) |
| Material Icons | [fonts.google.com/icons](https://fonts.google.com/icons) |
