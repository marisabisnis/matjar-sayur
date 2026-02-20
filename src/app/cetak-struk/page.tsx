'use client';

import { useState } from 'react';
import { searchOrders, type GASOrder } from '@/lib/api';
import { formatHarga, formatTanggal } from '@/lib/utils';
import storesData from '../../../public/data/stores.json';
import styles from './page.module.css';

const store = storesData[0] as {
    nama: string;
    alamat: string;
    telepon: string;
    lat: number;
    lng: number;
};

type FilterStatus = 'semua' | 'cod' | 'transfer' | 'qris';

export default function CetakStrukPage() {
    const [telepon, setTelepon] = useState('');
    const [orders, setOrders] = useState<GASOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [filter, setFilter] = useState<FilterStatus>('semua');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        if (!telepon.trim() || telepon.replace(/[^0-9]/g, '').length < 8) {
            setError('Masukkan nomor telepon yang valid (min 8 digit).');
            return;
        }
        setLoading(true);
        setError('');
        setSearched(true);

        const res = await searchOrders(telepon);
        if (res.success && res.orders) {
            setOrders(res.orders);
            setSelected(new Set());
        } else {
            setError(res.error || 'Gagal memuat pesanan.');
            setOrders([]);
        }
        setLoading(false);
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'semua') return true;
        const bayar = (o.metode_bayar || '').toLowerCase();
        if (filter === 'cod') return bayar.includes('cod') || bayar.includes('tempat');
        if (filter === 'transfer') return bayar.includes('transfer');
        if (filter === 'qris') return bayar.includes('qris');
        return true;
    });

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === filteredOrders.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filteredOrders.map(o => o.id_order)));
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const selectedOrders = filteredOrders.filter(o => selected.has(o.id_order));

    const getRouteLink = (order: GASOrder) => {
        if (!order.link_maps) return null;
        const match = order.link_maps.match(/q=([-\d.]+),([-\d.]+)/);
        if (!match) return order.link_maps;
        return `https://www.google.com/maps/dir/${store.lat},${store.lng}/${match[1]},${match[2]}`;
    };

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>print</span>
                    Cetak Struk Batch
                </h1>
                <p className={styles.subtitle}>Cari pesanan, pilih, dan cetak struk kurir sekaligus</p>
            </div>

            {/* Search */}
            <div className={styles.searchCard}>
                <div className={styles.searchRow}>
                    <input
                        type="tel"
                        className={styles.searchInput}
                        placeholder="Nomor telepon pembeli..."
                        value={telepon}
                        onChange={e => setTelepon(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <button className={styles.searchBtn} onClick={handleSearch} disabled={loading}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {loading ? 'hourglass_top' : 'search'}
                        </span>
                        {loading ? 'Mencari...' : 'Cari'}
                    </button>
                </div>
                {error && <p className={styles.errorText}>{error}</p>}
            </div>

            {/* Results */}
            {searched && !loading && (
                <>
                    {orders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>
                                inbox
                            </span>
                            <p>Tidak ada pesanan ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            {/* Filters & Actions */}
                            <div className={styles.toolbar}>
                                <div className={styles.filterGroup}>
                                    {(['semua', 'cod', 'transfer', 'qris'] as FilterStatus[]).map(f => (
                                        <button
                                            key={f}
                                            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                                            onClick={() => { setFilter(f); setSelected(new Set()); }}
                                        >
                                            {f === 'semua' ? 'Semua' : f.toUpperCase()}
                                            <span className={styles.filterCount}>
                                                {orders.filter(o => {
                                                    if (f === 'semua') return true;
                                                    const b = (o.metode_bayar || '').toLowerCase();
                                                    if (f === 'cod') return b.includes('cod') || b.includes('tempat');
                                                    if (f === 'transfer') return b.includes('transfer');
                                                    if (f === 'qris') return b.includes('qris');
                                                    return true;
                                                }).length}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className={styles.actionGroup}>
                                    <button className={styles.selectAllBtn} onClick={toggleAll}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                            {selected.size === filteredOrders.length ? 'deselect' : 'select_all'}
                                        </span>
                                        {selected.size === filteredOrders.length ? 'Batal Semua' : 'Pilih Semua'}
                                    </button>
                                    {selected.size > 0 && (
                                        <button className={styles.printBtn} onClick={handlePrint}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                                            Cetak {selected.size} Struk
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Order List */}
                            <div className={styles.orderList}>
                                {filteredOrders.map(order => (
                                    <label
                                        key={order.id_order}
                                        className={`${styles.orderCard} ${selected.has(order.id_order) ? styles.orderCardSelected : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={selected.has(order.id_order)}
                                            onChange={() => toggleSelect(order.id_order)}
                                        />
                                        <div className={styles.orderInfo}>
                                            <div className={styles.orderTop}>
                                                <span className={styles.orderIdBadge}>{order.id_order}</span>
                                                <span className={styles.orderBayar}>{order.metode_bayar}</span>
                                            </div>
                                            <p className={styles.orderNama}>{order.nama} — {order.alamat}</p>
                                            <div className={styles.orderBottom}>
                                                <span>{formatTanggal(order.tanggal)}</span>
                                                <span className={styles.orderTotal}>{formatHarga(Number(order.total))}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* === PRINT AREA (hidden on screen, shown on print) === */}
            <div className={styles.printArea}>
                {selectedOrders.map(order => {
                    const items = Array.isArray(order.items_json) ? order.items_json : [];
                    const routeLink = getRouteLink(order);
                    return (
                        <div key={order.id_order} className={styles.printReceipt}>
                            <div className={styles.printReceiptHeader}>
                                <div>
                                    <h2 className={styles.printTitle}>🚚 Struk Pengiriman</h2>
                                    <p className={styles.printBrand}>Pesan Sayur</p>
                                </div>
                                <div className={styles.printMeta}>
                                    <span className={styles.printOrderId}>{order.id_order}</span>
                                    <span className={styles.printDate}>{formatTanggal(order.tanggal)}</span>
                                </div>
                            </div>

                            <div className={styles.printDivider} />

                            {/* Store */}
                            <div className={styles.printSection}>
                                <h3 className={styles.printSectionTitle}>📦 Asal Toko</h3>
                                <p>{store.nama} — {store.alamat}</p>
                                <p>Telp: {store.telepon}</p>
                            </div>

                            <div className={styles.printDivider} />

                            {/* Customer */}
                            <div className={styles.printSection}>
                                <h3 className={styles.printSectionTitle}>📍 Penerima</h3>
                                <p><strong>{order.nama}</strong></p>
                                <p>{order.alamat}</p>
                                <p>Telp: {order.telepon}</p>
                                {routeLink && <p>🗺️ Rute: {routeLink}</p>}
                            </div>

                            <div className={styles.printDivider} />

                            {/* Items */}
                            <div className={styles.printSection}>
                                <h3 className={styles.printSectionTitle}>🧺 Pesanan</h3>
                                {items.map((item, idx) => (
                                    <p key={idx}>
                                        {idx + 1}. {item.nama}{item.variasi ? ` (${item.variasi})` : ''} × {item.qty}
                                    </p>
                                ))}
                            </div>

                            <div className={styles.printDivider} />

                            {/* Summary */}
                            <div className={styles.printSection}>
                                <p><strong>Total: {formatHarga(Number(order.total))}</strong></p>
                                <p>Bayar: {order.metode_bayar}</p>
                                <p>Jadwal: {order.jadwal}</p>
                                {order.catatan && <p>Catatan: {order.catatan}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
