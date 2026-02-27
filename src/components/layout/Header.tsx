'use client';

import { useState } from 'react';
import Link from 'next/link';
import CartBadge from './CartBadge';
import SearchOverlay from './SearchOverlay';
import type { Product } from '@/types';
import productsData from '../../../public/data/products.json';
import styles from './Header.module.css';

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false);
    const products = productsData as Product[];

    return (
        <>
            <header className={styles.header} role="banner">
                <div className={styles.headerInner}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo} aria-label="Matjar Sayur - Beranda">
                        <div className={styles.logoIcon}>
                            <span className="material-symbols-outlined" aria-hidden="true">eco</span>
                        </div>
                        <h1 className={styles.logoText}>
                            Matjar <span className={styles.logoAccent}>Sayur</span>
                        </h1>
                    </Link>

                    {/* Search Bar — click to open overlay */}
                    <div className={styles.searchBar} role="search">
                        <div
                            className={styles.searchWrapper}
                            onClick={() => setSearchOpen(true)}
                            style={{ cursor: 'pointer' }}
                        >
                            <input
                                type="search"
                                className={styles.searchInput}
                                placeholder="Cari sayur, buah, bumbu dapur..."
                                aria-label="Cari produk"
                                readOnly
                                onFocus={() => setSearchOpen(true)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span className={`material-symbols-outlined ${styles.searchIcon}`} aria-hidden="true">
                                search
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        {/* Mobile search icon */}
                        <button
                            className={styles.mobileSearchBtn}
                            onClick={() => setSearchOpen(true)}
                            aria-label="Cari produk"
                        >
                            <span className="material-symbols-outlined">search</span>
                        </button>

                        <CartBadge />

                        <button className={styles.userButton} aria-label="Akun pengguna">
                            <div className={styles.userAvatar}>
                                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px', color: '#1e293b' }}>
                                    person
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            <SearchOverlay
                products={products}
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </>
    );
}
