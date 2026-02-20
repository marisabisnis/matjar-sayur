'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHistoryStore, type LocalOrder } from '@/stores/history-store';
import { useCartStore } from '@/stores/cart-store';
import { formatHarga, formatTanggalPendek } from '@/lib/utils';
import styles from './page.module.css';

export default function HistoriPage() {
    const router = useRouter();
    const orders = useHistoryStore(s => s.orders);
    const reorder = useCartStore(s => s.reorder);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleReorder = (order: LocalOrder) => {
        reorder(order.items);
        router.push('/keranjang');
    };

    if (!mounted) {
        return (
            <main className={styles.page}>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0' }}>Memuat riwayat...</p>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>history</span>
                    Riwayat Pesanan
                </h1>
                <span className={styles.badge}>{orders.length} pesanan</span>
            </div>

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--text-muted)' }}>
                        receipt_long
                    </span>
                    <h2 className={styles.emptyTitle}>Belum Ada Pesanan</h2>
                    <p className={styles.emptyDesc}>
                        Riwayat pesananmu akan muncul di sini setelah kamu checkout.
                    </p>
                    <div className={styles.emptyActions}>
                        <Link href="/" className={styles.btnPrimary}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
                            Mulai Belanja
                        </Link>
                    </div>
                    <div className={styles.recoveryHint}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
                        <span>Cache terhapus? <Link href="/cari-order" className={styles.recoveryLink}>Cari order by nomor HP</Link></span>
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.orderList}>
                        {orders.map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <Link href={`/struk/${order.id}`} className={styles.orderMain}>
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
                                    title="Pesan Lagi"
                                >
                                    <span className="material-symbols-outlined">replay</span>
                                    Pesan Lagi
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.recoveryHint} style={{ marginTop: 'var(--space-lg)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
                        <span>Cache terhapus? <Link href="/cari-order" className={styles.recoveryLink}>Cari order by nomor HP</Link></span>
                    </div>
                </>
            )}
        </main>
    );
}
