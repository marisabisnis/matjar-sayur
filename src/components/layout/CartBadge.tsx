'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import styles from './Header.module.css';
import Link from 'next/link';

export default function CartBadge() {
    const [count, setCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Subscribe to store changes
        const unsub = useCartStore.subscribe((state) => {
            setCount(state.items.reduce((sum, i) => sum + i.qty, 0));
        });
        // Set initial count
        setCount(useCartStore.getState().items.reduce((sum, i) => sum + i.qty, 0));
        return unsub;
    }, []);

    return (
        <Link href="/keranjang" className={styles.cartButton} aria-label="Keranjang belanja">
            <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
            {mounted && count > 0 && (
                <span className={styles.cartBadge} aria-label={`${count} item di keranjang`}>
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
