# 📖 Panduan Admin — Pesan Sayur

Panduan lengkap mengelola toko online Pesan Sayur melalui Google Sheets.

---

## 🔗 Akses Google Sheets

Buka spreadsheet dengan ID: `1HHVN9Fn6wHb0xGbHsHAqFrqAxklNinJjpKyvqZTAYQg`

Spreadsheet terdiri dari 7 tab (sheet):

| Tab | Fungsi |
|-----|--------|
| `products` | Daftar semua produk |
| `categories` | Kategori produk |
| `stores` | Info toko (alamat, WA, ongkir) |
| `payment_methods` | Metode pembayaran |
| `orders` | Pesanan masuk |
| `sliders` | Slider promo di homepage |
| `coupons` | Kupon diskon |

---

## 🥬 Mengelola Produk (Tab: `products`)

### Kolom-kolom Penting

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `id` | ID unik (angka) | `1`, `2`, `3` |
| `kategori_id` | ID dari tab categories | `1` (Sayuran) |
| `nama` | Nama produk | `Bayam Hijau Ikat Segar` |
| `slug` | URL-friendly name (huruf kecil, pakai `-`) | `bayam-hijau-ikat-segar` |
| `deskripsi` | Deskripsi lengkap | (teks bebas) |
| `harga` | Harga normal (angka tanpa Rp) | `5500` |
| `harga_diskon` | Harga promo (kosongkan jika tidak promo) | `3500` atau kosong |
| `foto_utama` | URL foto utama | `https://...` |
| `foto_galeri` | URL foto tambahan, pisah dengan koma | `https://url1, https://url2` |
| `stok` | Jumlah stok | `100` |
| `satuan` | Satuan jual | `ikat`, `kg`, `pack`, `bonggol` |
| `aktif` | Tampilkan di web? | `TRUE` atau `FALSE` |
| `unggulan` | Produk unggulan di homepage? | `TRUE` atau `FALSE` |
| `urutan` | Urutan tampil (kecil = duluan) | `1`, `2`, `3` |
| `min_qty` | Minimal pembelian | `1` |
| `variasi_json` | Variasi produk (format JSON) | Lihat contoh di bawah |
| `seo_title` | Judul SEO | `Bayam Hijau - Pesan Sayur` |
| `seo_desc` | Deskripsi SEO | (teks pendek) |
| `kategori_nama` | Nama kategori (untuk display) | `Sayuran` |

### Cara Tambah Produk Baru

1. Scroll ke baris kosong paling bawah di tab `products`
2. Isi semua kolom sesuai tabel di atas
3. `id` harus unik (tidak boleh sama dengan yang sudah ada)
4. `slug` harus unik dan pakai huruf kecil + strip (`-`)
5. Set `aktif` = `TRUE` agar muncul di website

### Cara Update Harga

1. Cari produk berdasarkan nama atau ID
2. Ubah kolom `harga` (harga normal) — **angka saja, tanpa Rp**
3. Untuk promo: isi `harga_diskon` dengan harga promo
4. Untuk hapus promo: kosongkan kolom `harga_diskon`

### Cara Update Foto

1. Upload foto ke Google Drive / hosting lain
2. Copy URL gambar (harus URL publik yang bisa diakses)
3. Tempel di kolom `foto_utama`
4. Untuk foto tambahan, tempel di `foto_galeri` (pisah dengan koma)

**Tips foto Google Drive:**
- Upload ke Drive → Klik kanan → Share → Anyone with link
- Ubah URL dari: `https://drive.google.com/file/d/FILE_ID/view`  
  Menjadi: `https://lh3.googleusercontent.com/d/FILE_ID`

### Format Variasi Produk

Kolom `variasi_json` menggunakan format JSON:

#### Contoh 1: Variasi Ukuran/Berat
```json
[{"nama":"Ukuran","opsi":[{"label":"500gr","tambahan":0},{"label":"1kg","tambahan":5000}]}]
```
- `nama` = nama grup variasi (Ukuran, Berat, dll)
- `opsi` = daftar pilihan
  - `label` = nama pilihan
  - `tambahan` = tambahan harga (0 jika sama)

#### Contoh 2: Variasi Warna
```json
[{"nama":"Warna","opsi":[{"label":"Merah","tambahan":0},{"label":"Hijau","tambahan":0}]}]
```

#### Contoh 3: Multiple Variasi
```json
[{"nama":"Ukuran","opsi":[{"label":"S","tambahan":0},{"label":"L","tambahan":3000}]},{"nama":"Warna","opsi":[{"label":"Merah","tambahan":0},{"label":"Hijau","tambahan":0}]}]
```

**Penting:** JSON harus dalam 1 baris. Jangan buat multi-line di cell.

---

## 📂 Mengelola Kategori (Tab: `categories`)

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `id` | ID unik | `1` |
| `nama` | Nama kategori | `Sayuran Segar` |
| `slug` | URL slug | `sayuran-segar` |
| `icon_url` | Material icon name | `nutrition` |
| `urutan` | Urutan tampil | `1` |
| `aktif` | Tampilkan? | `TRUE` |

**Ikon tersedia:** `nutrition`, `emoji_nature`, `set_meal`, `soup_kitchen`, `local_cafe`, `cookie`, `inventory_2`

Cari ikon lain di: [fonts.google.com/icons](https://fonts.google.com/icons)

---

## 💳 Mengelola Pembayaran (Tab: `payment_methods`)

### Transfer Bank
Setiap bank = 1 baris dengan `tipe` = `transfer`:

| tipe | provider | no_rekening | atas_nama | instruksi | aktif |
|------|----------|-------------|-----------|-----------|-------|
| transfer | BSI | 1234567890 | Nama Pemilik | Transfer ke BSI | TRUE |
| transfer | Mandiri | 0987654321 | Nama Pemilik | Transfer ke Mandiri | TRUE |

### QRIS
1 baris dengan `tipe` = `qris`. Kolom `qris_url` berisi URL foto QR:

| tipe | provider | qris_url | atas_nama | instruksi | aktif |
|------|----------|----------|-----------|-----------|-------|
| qris | QRIS | https://url-foto-qr | Pesan Sayur | Scan QR Code | TRUE |

**Cara upload foto QRIS:**
1. Screenshot QRIS dari aplikasi bank
2. Upload ke Google Drive (Share → Anyone with link)
3. Copy URL dan tempel di kolom `qris_url`

### COD
1 baris dengan `tipe` = `cod`:

| tipe | provider | instruksi | aktif |
|------|----------|-----------|-------|
| cod | COD | Bayar tunai saat pesanan tiba | TRUE |

---

## 🖼️ Mengelola Slider Promo (Tab: `sliders`)

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `id` | ID unik | `1` |
| `gambar_url` | URL gambar banner | `https://...` |
| `judul` | Judul promo | `Belanja Segar Setiap Hari` |
| `deskripsi` | Deskripsi singkat | `Gratis ongkir min Rp100rb` |
| `tipe_link` | Jenis link | `kategori` atau `url` |
| `link_tujuan` | URL tujuan | `/kategori/sayuran-segar` |
| `urutan` | Urutan tampil | `1` |
| `aktif` | Tampilkan? | `TRUE` |

---

## 🎫 Mengelola Kupon (Tab: `coupons`)

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `kode` | Kode kupon (huruf besar) | `HEMAT10` |
| `tipe` | `nominal`, `persen`, atau `gratis_ongkir` | `persen` |
| `nilai` | Nilai diskon | `10` (10%) atau `5000` (Rp5.000) |
| `min_order` | Minimum belanja | `50000` |
| `max_diskon` | Batas maksimal diskon (untuk tipe persen) | `15000` |
| `batas_pakai` | Maksimal penggunaan (0 = unlimited) | `100` |
| `sudah_dipakai` | Counter otomatis | `0` |
| `berlaku_dari` | Tanggal mulai | `2026-01-01` |
| `berlaku_sampai` | Tanggal berakhir | `2026-12-31` |
| `aktif` | Aktif? | `TRUE` |

---

## 🏪 Mengelola Info Toko (Tab: `stores`)

| Kolom | Isi |
|-------|-----|
| `nama` | Nama toko |
| `alamat` | Alamat lengkap |
| `lat`, `lng` | Koordinat GPS toko |
| `telepon` | Nomor telepon |
| `whatsapp` | Nomor WA (format 628xxx) |
| `tarif_per_km` | Ongkir per km (Rp) |
| `min_order` | Minimum order (Rp) |
| `max_jarak_km` | Jarak max pengiriman (km) |
| `gratis_ongkir_diatas` | Free ongkir jika belanja di atas (Rp) |

---

## 📦 Melihat Pesanan (Tab: `orders`)

Tab ini otomatis terisi saat pelanggan checkout. Kolom:

| Kolom | Isi |
|-------|-----|
| `id_order` | ID pesanan |
| `tanggal` | Waktu order |
| `nama` | Nama pelanggan |
| `telepon` | HP pelanggan |
| `alamat` | Alamat kirim |
| `items_json` | Detail item (JSON) |
| `subtotal` | Total harga barang |
| `ongkir` | Ongkos kirim |
| `total` | Total bayar |
| `status` | Status order (default: pending) |
| `link_maps` | Link Google Maps pelanggan |

---

## 🔄 Cara Deploy Perubahan

Setelah mengubah data di Google Sheets:

### Data yang langsung update (tanpa deploy):
- ✅ Pesanan baru (`orders`)
- ✅ Validasi kupon (`coupons`)

### Data yang perlu deploy ulang:
- ❌ Produk (`products`) — perlu rebuild
- ❌ Kategori (`categories`) — perlu rebuild  
- ❌ Slider (`sliders`) — perlu rebuild
- ❌ Pembayaran (`payment_methods`) — perlu rebuild

### Cara rebuild di Vercel:
1. Buka dashboard Vercel → project `pesan-sayur`
2. Klik tab **Deployments**
3. Klik tombol **⋮** (titik tiga) di deployment terakhir
4. Pilih **Redeploy**
5. Tunggu ~1 menit sampai selesai

---

## ❓ FAQ

**Q: Foto dari Google Drive tidak muncul?**  
A: Pastikan foto di-share "Anyone with link". Gunakan format URL: `https://lh3.googleusercontent.com/d/FILE_ID`

**Q: Produk tidak muncul di website?**  
A: Cek kolom `aktif` harus `TRUE`. Lalu redeploy di Vercel.

**Q: Kupon tidak bisa dipakai?**  
A: Cek: (1) `aktif` = TRUE, (2) belum kadaluarsa, (3) `sudah_dipakai` < `batas_pakai`, (4) subtotal >= `min_order`
