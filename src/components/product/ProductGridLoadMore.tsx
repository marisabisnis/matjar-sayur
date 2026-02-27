'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';
import styles from './ProductGridLoadMore.module.css';

interface ProductGridLoadMoreProps {
    products: Product[];
}

function getInitialCount(): number {
    if (typeof window === 'undefined') return 18;
    return window.innerWidth < 768 ? 10 : 18;
}

function getLoadMoreCount(): number {
    if (typeof window === 'undefined') return 18;
    return window.innerWidth < 768 ? 10 : 18;
}

export default function ProductGridLoadMore({ products }: ProductGridLoadMoreProps) {
    const [visibleCount, setVisibleCount] = useState(18);

    useEffect(() => {
        setVisibleCount(getInitialCount());
    }, []);

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + getLoadMoreCount(), products.length));
    }, [products.length]);

    const visibleProducts = products.slice(0, visibleCount);
    const hasMore = visibleCount < products.length;
    const remaining = products.length - visibleCount;

    return (
        <>
            <div className={styles.productGrid}>
                {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {hasMore && (
                <div className={styles.loadMoreWrap}>
                    <button
                        className={styles.loadMoreBtn}
                        onClick={handleLoadMore}
                        aria-label={`Tampilkan ${Math.min(remaining, getLoadMoreCount())} produk lagi`}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            expand_more
                        </span>
                        Tampilkan Lebih Banyak ({remaining} produk lagi)
                    </button>
                </div>
            )}
        </>
    );
}
