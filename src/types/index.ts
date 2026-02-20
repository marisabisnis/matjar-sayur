export interface Product {
    id: string;
    kategori_id: string;
    nama: string;
    slug: string;
    deskripsi: string;
    harga: number;
    harga_diskon: number | null;
    foto_utama: string;
    foto_galeri: string[];
    stok: number;
    satuan: string;
    aktif: boolean;
    unggulan: boolean;
    urutan: number;
    min_qty: number;
    variasi: ProductVariation[];
    seo_title: string;
    seo_desc: string;
    kategori_nama?: string;
}

export interface ProductVariation {
    nama: string;
    opsi: { label: string; tambahan: number }[];
}

export interface Category {
    id: string;
    nama: string;
    slug: string;
    icon_url: string;
    urutan: number;
    aktif: boolean;
}

export interface CartItem {
    id: string;
    nama: string;
    harga: number;
    foto: string;
    qty: number;
    variasi?: string;
    tambahan?: number;
    catatan?: string;
    subtotal: number;
}

export interface Store {
    id: string;
    nama: string;
    alamat: string;
    lat: number;
    lng: number;
    telepon: string;
    whatsapp: string;
    jam_buka: string;
    tarif_per_km: number;
    min_order: number;
    max_jarak_km: number;
    gratis_ongkir_diatas: number;
    logo_url: string;
    banner_url: string;
    aktif: boolean;
}

export interface Order {
    id_order: string;
    tanggal: string;
    nama: string;
    telepon: string;
    alamat: string;
    lat: number;
    lng: number;
    jarak_km: number;
    toko_terdekat: string;
    link_maps: string;
    items: CartItem[];
    subtotal: number;
    diskon: number;
    kupon: string;
    ongkir: number;
    total: number;
    tgl_kirim: string;
    metode_bayar: string;
    status_bayar: string;
    status_order: string;
    catatan: string;
    struk_url: string;
}

export interface PaymentMethod {
    tipe: string;
    provider: string;
    no_rekening: string;
    atas_nama: string;
    logo_url: string;
    instruksi: string;
    aktif: boolean;
}

export interface Slider {
    id: string;
    gambar_url: string;
    judul: string;
    deskripsi: string;
    tipe_link: 'produk' | 'kategori' | 'url';
    link_tujuan: string;
    urutan: number;
    aktif: boolean;
}
