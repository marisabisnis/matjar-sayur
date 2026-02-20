'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHistoryStore } from '@/stores/history-store';
import { useCartStore } from '@/stores/cart-store';
import { searchOrders, type GASOrder } from '@/lib/api';
import { formatHarga, formatTanggalPendek } from '@/lib/utils';
import type { LocalOrder } from '@/stores/history-store';
import styles from './page.module.css';

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

export default function CariOrderPage() {
    const router = useRouter();
    const addOrder = useHistoryStore(s => s.addOrder);
    const reorder = useCartStore(s => s.reorder);

    const [telepon, setTelepon] = useState('');
    const [results, setResults] = useState<LocalOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        const clean = telepon.replace(/[^0-9]/g, '');
        if (clean.length < 8) {
            setError('Masukkan nomor HP minimal 8 digit');
            return;
        }

        setLoading(true);
        setError('');
        setResults([]);
        setSearched(true);

        const res = await searchOrders(clean);
        if (res.success && res.orders) {
            const converted = res.orders.map(gasToLocal);
            setResults(converted);
            if (converted.length === 0) {
                setError('Tidak ada pesanan ditemukan untuk nomor ini');
            }
        } else {
            setError(res.error || 'Gagal mencari pesanan');
        }
        setLoading(false);
    };

    const handleSaveAll = () => {
        results.forEach(order => addOrder(order));
        router.push('/histori');
    };

    const handleReorder = (order: LocalOrder) => {
        addOrder(order); // Save to local
        reorder(order.items);
        router.push('/keranjang');
    };

    return (
        <main className={styles.page}>
            <h1 className={styles.title}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>manage_search</span>
                Cari Pesanan
            </h1>
            <p className={styles.subtitle}>
                Masukkan nomor HP yang digunakan saat checkout untuk menemukan pesananmu.
            </p>

            {/* Search Form */}
            <div className={styles.searchCard}>
                <div className={styles.searchBox}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>call</span>
                    <input
                        type="tel"
                        className={styles.searchInput}
                        placeholder="Contoh: 081234567890"
                        value={telepon}
                        onChange={e => setTelepon(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className={styles.searchBtn}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>hourglass_top</span>
                            Mencari...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                            Cari Pesanan
                        </>
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className={styles.errorMsg}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {results.length === 0 && searched ? 'search_off' : 'error'}
                    </span>
                    {error}
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <>
                    <div className={styles.resultHeader}>
                        <span className={styles.resultCount}>
                            Ditemukan <strong>{results.length}</strong> pesanan
                        </span>
                        <button onClick={handleSaveAll} className={styles.saveAllBtn}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                            Simpan ke Riwayat
                        </button>
                    </div>

                    <div className={styles.orderList}>
                        {results.map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <Link href={`/struk/${order.id}`} className={styles.orderMain} onClick={() => addOrder(order)}>
                                    <div className={styles.orderTop}>
                                        <span className={styles.orderId}>{order.id}</span>
                                        <span className={styles.orderDate}>{formatTanggalPendek(order.tanggal)}</span>
                                    </div>
                                    <div className={styles.orderItems}>
                                        {order.items.slice(0, 3).map((item, i) => (
                                            <span key={i} className={styles.orderItemName}>
                                                {item.nama} x{item.qty}
                                            </span>
                                        ))}
                                        {order.items.length > 3 && (
                                            <span className={styles.orderMore}>+{order.items.length - 3} lainnya</span>
                                        )}
                                    </div>
                                    <div className={styles.orderBottom}>
                                        <span className={styles.orderItemCount}>
                                            {order.items.reduce((s, i) => s + i.qty, 0)} item
                                        </span>
                                        <span className={styles.orderTotal}>{formatHarga(order.total)}</span>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => handleReorder(order)}
                                    className={styles.reorderBtn}
                                >
                                    <span className="material-symbols-outlined">replay</span>
                                    Pesan Lagi
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* No results after search */}
            {searched && !loading && results.length === 0 && !error && (
                <div className={styles.emptyResult}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>inbox</span>
                    <p>Tidak ada pesanan untuk nomor ini</p>
                </div>
            )}
        </main>
    );
}
