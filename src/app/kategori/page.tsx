import Link from 'next/link';
import type { Metadata } from 'next';
import categoriesData from '../../../public/data/categories.json';
import type { Category } from '@/types';
import styles from './page.module.css';

const categories = categoriesData as Category[];

export const metadata: Metadata = {
    title: 'Kategori Produk',
    description: 'Jelajahi kategori produk segar: Sayuran, Buah-buahan, Lauk Pauk, Bumbu Dapur, Minuman, dan Snack.',
};

const categoryIcons: Record<string, string> = {
    'sayuran-segar': 'nutrition',
    'buah-buahan': 'emoji_nature',
    'lauk-pauk': 'set_meal',
    'bumbu-dapur': 'soup_kitchen',
    'minuman': 'local_cafe',
    'snack': 'cookie',
};

export default function KategoriPage() {
    return (
        <main className={styles.page}>
            <h1 className={styles.title}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>category</span>
                Kategori Produk
            </h1>
            <div className={styles.grid}>
                {categories.map((cat) => (
                    <Link key={cat.id} href={`/kategori/${cat.slug}`} className={styles.card}>
                        <div className={styles.cardIcon}>
                            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                                {categoryIcons[cat.slug] || 'inventory_2'}
                            </span>
                        </div>
                        <h2 className={styles.cardName}>{cat.nama}</h2>
                    </Link>
                ))}
            </div>
        </main>
    );
}
