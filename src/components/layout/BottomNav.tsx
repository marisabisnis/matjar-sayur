'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import styles from './BottomNav.module.css';

const navItems = [
    { href: '/', icon: 'home', iconFilled: 'home', label: 'Home' },
    { href: '/kategori', icon: 'grid_view', iconFilled: 'grid_view', label: 'Kategori' },
    { href: '/keranjang', icon: 'shopping_cart', iconFilled: 'shopping_cart', label: 'Keranjang', showBadge: true },
    { href: '/histori', icon: 'history', iconFilled: 'history', label: 'Histori' },
    { href: '/cari-order', icon: 'search', iconFilled: 'search', label: 'Cari' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [cartCount, setCartCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const unsub = useCartStore.subscribe((state) => {
            setCartCount(state.items.reduce((sum, i) => sum + i.qty, 0));
        });
        setCartCount(useCartStore.getState().items.reduce((sum, i) => sum + i.qty, 0));
        return unsub;
    }, []);

    return (
        <nav className={styles.bottomNav} aria-label="Navigasi utama">
            <div className={styles.navInner}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''} ${styles.navIcon}`}>
                                {isActive ? item.iconFilled : item.icon}
                            </span>
                            <span className={styles.navLabel}>{item.label}</span>
                            {item.showBadge && mounted && cartCount > 0 && (
                                <span className={styles.navBadge}>
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
