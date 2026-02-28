'use client';

import { useState, useCallback } from 'react';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/types';
import { formatHarga } from '@/lib/utils';
import styles from './page.module.css';

interface ProductDetailClientProps {
    product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const addItem = useCartStore((s) => s.addItem);
    const [qty, setQty] = useState(product.min_qty || 1);
    const [selectedVariasi, setSelectedVariasi] = useState<number>(0);
    const [catatan, setCatatan] = useState('');
    const [added, setAdded] = useState(false);
    const [shared, setShared] = useState(false);

    const variasi = product.variasi?.[0];
    const tambahan = variasi ? variasi.opsi[selectedVariasi]?.tambahan || 0 : 0;
    const hargaFinal = (product.harga_diskon || product.harga) + tambahan;

    const handleAdd = useCallback(() => {
        addItem(
            {
                id: product.id,
                nama: product.nama,
                harga: product.harga_diskon || product.harga,
                foto_utama: product.foto_utama,
            },
            qty,
            variasi ? variasi.opsi[selectedVariasi]?.label : undefined,
            tambahan,
            catatan || undefined
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    }, [addItem, product, qty, variasi, selectedVariasi, tambahan, catatan]);

    const handleShare = useCallback(async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const text = `🥬 ${product.nama} — ${formatHarga(hargaFinal)}\n${url}`;

        // Try Web Share API first (mobile)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: product.nama, text, url });
                setShared(true);
                setTimeout(() => setShared(false), 2000);
                return;
            } catch { /* user cancelled or not supported */ }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(text);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        } catch {
            // Final fallback: open WA
            const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        }
    }, [product.nama, hargaFinal]);

    return (
        <>
            {/* Variant Selector */}
            {variasi && variasi.opsi.length > 0 && (
                <div className={styles.variantSection}>
                    <label className={styles.variantLabel}>Pilih {variasi.nama || 'Ukuran'}</label>
                    <div className={styles.variantOptions}>
                        {variasi.opsi.map((opsi, i) => (
                            <button
                                key={opsi.label}
                                className={`${styles.variantBtn} ${i === selectedVariasi ? styles.variantBtnActive : ''}`}
                                onClick={() => setSelectedVariasi(i)}
                            >
                                {opsi.label}
                                {opsi.tambahan > 0 && (() => {
                                    const hargaDasar = product.harga_diskon || product.harga;
                                    const totalHarga = hargaDasar + opsi.tambahan;
                                    // Extract quantity from label (e.g. "3" from "3 ikat kecil", "500" from "500 gram")
                                    const qtyMatch = opsi.label.match(/^(\d+)/);
                                    const labelQty = qtyMatch ? parseInt(qtyMatch[1]) : null;
                                    // Extract unit from label (e.g. "ikat" from "3 ikat kecil", "gram" from "500 gram")
                                    const unitMatch = opsi.label.match(/^\d+\s+(\S+)/);
                                    const unit = unitMatch ? unitMatch[1] : product.satuan || 'pcs';

                                    if (labelQty && labelQty > 1 && unit !== 'gram' && unit !== 'kg') {
                                        const perUnit = Math.round(totalHarga / labelQty);
                                        return <span style={{ fontSize: '11px', opacity: 0.7 }}> (per {unit} {formatHarga(perUnit)})</span>;
                                    } else if (unit === 'gram' && labelQty && labelQty >= 500) {
                                        // For weight: show price per 100g or per kg
                                        const perKg = Math.round(totalHarga / (labelQty / 1000));
                                        return <span style={{ fontSize: '11px', opacity: 0.7 }}> ({formatHarga(perKg)}/kg)</span>;
                                    } else if (unit === 'kg' && labelQty && labelQty > 1) {
                                        const perKg = Math.round(totalHarga / labelQty);
                                        return <span style={{ fontSize: '11px', opacity: 0.7 }}> (per kg {formatHarga(perKg)})</span>;
                                    }
                                    return <span style={{ fontSize: '11px', opacity: 0.7 }}> +{formatHarga(opsi.tambahan)}</span>;
                                })()}
                                {i === selectedVariasi && (
                                    <span className={styles.variantCheck}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check</span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className={styles.notesSection}>
                <label htmlFor="product-notes" className={styles.notesLabel}>
                    Catatan (Opsional)
                </label>
                <textarea
                    id="product-notes"
                    className={styles.notesInput}
                    placeholder="Contoh: Tolong pilih yang daunnya kecil-kecil..."
                    rows={2}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                />
            </div>

            {/* Qty & Add to Cart */}
            <div className={styles.cartActions}>
                <div className={styles.qtySelector}>
                    <button
                        className={styles.qtyBtn}
                        onClick={() => setQty(Math.max(product.min_qty || 1, qty - 1))}
                        aria-label="Kurangi jumlah"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                    </button>
                    <span className={styles.qtyValue}>{qty}</span>
                    <button
                        className={styles.qtyBtn}
                        onClick={() => setQty(qty + 1)}
                        aria-label="Tambah jumlah"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    </button>
                </div>
                <button className={styles.addToCartBtn} onClick={handleAdd}>
                    <span className="material-symbols-outlined">
                        {added ? 'check_circle' : 'shopping_basket'}
                    </span>
                    {added ? 'Ditambahkan!' : `Tambah — ${formatHarga(hargaFinal * qty)}`}
                </button>
            </div>

            {/* Share Button */}
            <button className={styles.shareBtn} onClick={handleShare}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {shared ? 'check' : 'share'}
                </span>
                {shared ? 'Link Tersalin!' : 'Bagikan Produk'}
            </button>
        </>
    );
}
