'use client';

import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/types';
import styles from './ProductCard.module.css';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const addItem = useCartStore((s) => s.addItem);

    const handleAdd = () => {
        addItem(
            {
                id: product.id,
                nama: product.nama,
                harga: product.harga_diskon || product.harga,
                foto_utama: product.foto_utama,
            },
            1
        );
    };

    return (
        <button
            className={styles.addButton}
            onClick={handleAdd}
            aria-label={`Tambah ${product.nama} ke keranjang`}
        >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                add_shopping_cart
            </span>
            Tambah
        </button>
    );
}
