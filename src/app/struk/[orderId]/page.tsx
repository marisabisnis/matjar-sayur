'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHistoryStore, type LocalOrder } from '@/stores/history-store';
import { useCartStore } from '@/stores/cart-store';
import { fetchOrder, type GASOrder } from '@/lib/api';
import { formatHarga, formatTanggal } from '@/lib/utils';
import { generateWALink, DEFAULT_WA_NUMBER } from '@/lib/whatsapp';
import storesData from '../../../../public/data/stores.json';
import styles from './page.module.css';

const store = storesData[0] as {
    nama: string;
    alamat: string;
    telepon: string;
    whatsapp: string;
    lat: number;
    lng: number;
};

function gasToLocal(g: GASOrder): LocalOrder {
    return {
        id: g.id_order,
        tanggal: g.tanggal,
        nama: g.nama,
        telepon: g.telepon,
        alamat: g.alamat,
        items: g.items_json.map(i => ({
            id: i.id || i.nama,
            nama: i.nama,
            harga: i.harga,
            foto: '',
            qty: i.qty,
            variasi: i.variasi,
            tambahan: i.tambahan,
            catatan: i.catatan,
            subtotal: (i.harga + (i.tambahan || 0)) * i.qty,
        })),
        subtotal: Number(g.subtotal) || 0,
        ongkir: Number(g.ongkir) || 0,
        diskon: Number(g.diskon) || 0,
        kupon: g.kupon || undefined,
        total: Number(g.total) || 0,
        jadwal: g.jadwal,
        metodeBayar: g.metode_bayar,
        catatan: g.catatan || undefined,
        linkMaps: g.link_maps || undefined,
    };
}

type StrukMode = 'pembeli' | 'kurir';

export default function StrukPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const router = useRouter();
    const getOrder = useHistoryStore(s => s.getOrder);
    const addOrder = useHistoryStore(s => s.addOrder);
    const reorder = useCartStore(s => s.reorder);

    const [order, setOrder] = useState<LocalOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<StrukMode>('pembeli');

    useEffect(() => {
        const local = getOrder(orderId);
        if (local) {
            setOrder(local);
            setLoading(false);
            return;
        }

        fetchOrder(orderId).then(res => {
            if (res.success && res.order) {
                const converted = gasToLocal(res.order);
                addOrder(converted);
                setOrder(converted);
            } else {
                setError(res.error || 'Order tidak ditemukan');
            }
            setLoading(false);
        });
    }, [orderId, getOrder, addOrder]);

    const handleReorder = () => {
        if (!order) return;
        reorder(order.items);
        router.push('/keranjang');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        const url = window.location.href;
        const text = `🧾 Struk Belanja Pesan Sayur\nID: ${orderId}\n${url}`;
        const waUrl = generateWALink(DEFAULT_WA_NUMBER, text);
        window.open(waUrl, '_blank');
    };

    // Build route link from store to customer
    const getRouteLink = () => {
        if (!order?.linkMaps) return null;
        const match = order.linkMaps.match(/q=([-\d.]+),([-\d.]+)/);
        if (!match) return order.linkMaps;
        const custLat = match[1];
        const custLng = match[2];
        return `https://www.google.com/maps/dir/${store.lat},${store.lng}/${custLat},${custLng}`;
    };

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loading}>
                    <span className="material-symbols-outlined">hourglass_top</span>
                    <p>Memuat struk...</p>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className={styles.page}>
                <div className={styles.errorState}>
                    <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--text-muted)' }}>
                        receipt_long
                    </span>
                    <h2>Order Tidak Ditemukan</h2>
                    <p>{error || `Order ${orderId} tidak ditemukan.`}</p>
                    <div className={styles.errorActions}>
                        <Link href="/cari-order" className={styles.btnSecondary}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                            Cari Order
                        </Link>
                        <Link href="/" className={styles.btnPrimary}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
                            Belanja
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const routeLink = getRouteLink();

    return (
        <main className={styles.page}>
            {/* Success Header */}
            <div className={styles.successHeader}>
                <div className={styles.checkCircle}>
                    <span className="material-symbols-outlined">check</span>
                </div>
                <h1 className={styles.successTitle}>Pesanan Berhasil!</h1>
                <p className={styles.successDesc}>Pesananmu sudah dikirim via WhatsApp</p>
            </div>

            {/* Mode Toggle */}
            <div className={styles.modeToggle}>
                <button
                    className={`${styles.modeBtn} ${mode === 'pembeli' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('pembeli')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                    Struk Pembeli
                </button>
                <button
                    className={`${styles.modeBtn} ${mode === 'kurir' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('kurir')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>local_shipping</span>
                    Struk Kurir
                </button>
            </div>

            {/* Receipt Card */}
            <div className={styles.receipt} id="struk-cetak">
                {/* Receipt Header */}
                <div className={styles.receiptHeader}>
                    <div>
                        <h2 className={styles.receiptTitle}>
                            {mode === 'kurir' ? '🚚 Struk Pengiriman' : '🧾 Struk Belanja'}
                        </h2>
                        <p className={styles.receiptBrand}>Pesan Sayur</p>
                    </div>
                    <div className={styles.receiptMeta}>
                        <span className={styles.orderId}>{order.id}</span>
                        <span className={styles.orderDate}>{formatTanggal(order.tanggal)}</span>
                    </div>
                </div>

                <div className={styles.divider} />

                {/* === KURIR MODE: Store info === */}
                {mode === 'kurir' && (
                    <>
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                <span className="material-symbols-outlined">store</span>
                                Asal Toko
                            </h3>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Toko</span>
                                    <span className={styles.infoValue}>{store.nama}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Alamat</span>
                                    <span className={styles.infoValue}>{store.alamat}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Telepon</span>
                                    <span className={styles.infoValue}>{store.telepon}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.divider} />
                    </>
                )}

                {/* Customer Info */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <span className="material-symbols-outlined">person</span>
                        Data Penerima
                    </h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Nama</span>
                            <span className={styles.infoValue}>{order.nama}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Telepon</span>
                            <span className={styles.infoValue}>{order.telepon}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Alamat</span>
                            <span className={styles.infoValue}>{order.alamat}</span>
                        </div>
                        {order.linkMaps && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Lokasi</span>
                                <a href={order.linkMaps} target="_blank" rel="noopener noreferrer" className={styles.mapsLink}>
                                    📍 Buka di Google Maps
                                </a>
                            </div>
                        )}
                        {/* Kurir: add route link */}
                        {mode === 'kurir' && routeLink && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Rute</span>
                                <a href={routeLink} target="_blank" rel="noopener noreferrer" className={styles.routeLink}>
                                    🗺️ Navigasi ke Penerima
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.divider} />

                {/* Items */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <span className="material-symbols-outlined">shopping_bag</span>
                        Detail Pesanan
                    </h3>
                    <div className={styles.itemsList}>
                        {order.items.map((item, idx) => {
                            const harga = item.harga + (item.tambahan || 0);
                            return (
                                <div key={idx} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemNum}>{idx + 1}.</span>
                                        <div>
                                            <p className={styles.itemName}>
                                                {item.nama}
                                                {item.variasi && <span className={styles.itemVariant}> ({item.variasi})</span>}
                                            </p>
                                            {item.catatan && (
                                                <p className={styles.itemNote}>📝 {item.catatan}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        {mode === 'pembeli' ? (
                                            <>
                                                <span className={styles.itemQty}>{item.qty}x {formatHarga(harga)}</span>
                                                <span className={styles.itemSubtotal}>{formatHarga(harga * item.qty)}</span>
                                            </>
                                        ) : (
                                            <span className={styles.itemQty}>× {item.qty}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.divider} />

                {/* Summary */}
                <div className={styles.summary}>
                    {mode === 'pembeli' && (
                        <>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>{formatHarga(order.subtotal)}</span>
                            </div>
                            {order.diskon > 0 && (
                                <div className={`${styles.summaryRow} ${styles.summaryDiskon}`}>
                                    <span>Diskon{order.kupon ? ` (${order.kupon})` : ''}</span>
                                    <span>-{formatHarga(order.diskon)}</span>
                                </div>
                            )}
                            <div className={styles.summaryRow}>
                                <span>Ongkir</span>
                                <span>{order.ongkir === 0 ? 'GRATIS 🎉' : formatHarga(order.ongkir)}</span>
                            </div>
                        </>
                    )}
                    <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                        <span>Total</span>
                        <span>{formatHarga(order.total)}</span>
                    </div>
                </div>

                <div className={styles.divider} />

                {/* Payment & Delivery Info */}
                <div className={styles.section}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Jadwal</span>
                            <span className={styles.infoValue}>{order.jadwal}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Pembayaran</span>
                            <span className={styles.infoValue}>{order.metodeBayar}</span>
                        </div>
                        {order.catatan && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Catatan</span>
                                <span className={styles.infoValue}>{order.catatan}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.receiptFooter}>
                    <p>Terima kasih sudah belanja di <strong>Pesan Sayur</strong> 🥬</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
                <button onClick={handleReorder} className={styles.btnPrimary}>
                    <span className="material-symbols-outlined">replay</span>
                    Pesan Lagi
                </button>
                <button onClick={handlePrint} className={styles.btnSecondary}>
                    <span className="material-symbols-outlined">print</span>
                    Cetak
                </button>
                <button onClick={handleShare} className={styles.btnSecondary}>
                    <span className="material-symbols-outlined">share</span>
                    Share
                </button>
            </div>

            {/* Navigation */}
            <div className={styles.navLinks}>
                <Link href="/histori">Lihat Semua Pesanan →</Link>
                <Link href="/">Kembali Belanja →</Link>
            </div>
        </main>
    );
}
