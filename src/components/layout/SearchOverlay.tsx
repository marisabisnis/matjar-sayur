'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { formatHarga } from '@/lib/utils';
import styles from './SearchOverlay.module.css';

interface SearchOverlayProps {
    products: Product[];
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ products, isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input when opened + lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            setActiveIndex(-1);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const search = useCallback((q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        const terms = q.toLowerCase().split(/\s+/);
        const matched = products.filter(p => {
            const text = `${p.nama} ${p.deskripsi || ''} ${p.kategori_nama || ''} ${p.satuan || ''}`.toLowerCase();
            return terms.every(t => text.includes(t));
        });
        setResults(matched.slice(0, 8));
        setActiveIndex(-1);
    }, [products]);

    const handleChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(value), 150);
    };

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
            onClose();
            window.location.href = `/produk/${results[activeIndex].slug}`;
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.searchBox}>
                    <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                    <input
                        ref={inputRef}
                        type="search"
                        className={styles.input}
                        placeholder="Cari sayur, buah, bumbu..."
                        value={query}
                        onChange={e => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className={styles.closeBtn} onClick={onClose}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>

                {query.trim() && results.length === 0 && (
                    <div className={styles.empty}>
                        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-muted)' }}>
                            search_off
                        </span>
                        <p>Tidak ada produk &quot;{query}&quot;</p>
                    </div>
                )}

                {results.length > 0 && (
                    <div className={styles.results}>
                        {results.map((p, i) => (
                            <Link
                                key={p.id}
                                href={`/produk/${p.slug}`}
                                className={`${styles.resultItem} ${i === activeIndex ? styles.resultItemActive : ''}`}
                                onClick={onClose}
                            >
                                <div className={styles.resultImage}>
                                    <Image
                                        src={p.foto_utama}
                                        alt={p.nama}
                                        width={48}
                                        height={48}
                                        className={styles.resultImg}
                                    />
                                </div>
                                <div className={styles.resultInfo}>
                                    <span className={styles.resultName}>{p.nama}</span>
                                    <span className={styles.resultMeta}>
                                        {p.kategori_nama && <span className={styles.resultCat}>{p.kategori_nama}</span>}
                                        <span className={styles.resultPrice}>
                                            {formatHarga(p.harga_diskon || p.harga)}
                                        </span>
                                    </span>
                                </div>
                                {p.harga_diskon && p.harga_diskon < p.harga && (
                                    <span className={styles.resultBadge}>Promo</span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}

                {!query.trim() && (
                    <div className={styles.hints}>
                        <p className={styles.hintLabel}>Coba cari:</p>
                        <div className={styles.hintTags}>
                            {['Bayam', 'Wortel', 'Tempe', 'Cabai', 'Ayam'].map(tag => (
                                <button
                                    key={tag}
                                    className={styles.hintTag}
                                    onClick={() => handleChange(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
