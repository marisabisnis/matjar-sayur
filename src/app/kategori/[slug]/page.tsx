import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import type { Product, Category } from '@/types';
import productsData from '../../../../public/data/products.json';
import categoriesData from '../../../../public/data/categories.json';
import styles from './page.module.css';

const products = productsData as Product[];
const categories = categoriesData as Category[];

export function generateStaticParams() {
    return categories.map((cat) => ({ slug: cat.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
    const cat = categories.find(c => c.slug === params.slug);
    return {
        title: cat ? `${cat.nama} — Pesan Sayur` : 'Kategori — Pesan Sayur',
        description: cat ? `Belanja ${cat.nama} segar online di Pesan Sayur. Diantar cepat!` : 'Kategori produk Pesan Sayur',
    };
}

export default async function KategoriSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = categories.find(c => c.slug === slug);
    const catProducts = category
        ? products.filter(p => p.kategori_id === category.id && p.aktif)
        : [];

    return (
        <main className={styles.page}>
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb}>
                <Link href="/" className={styles.breadcrumbLink}>Beranda</Link>
                <span>›</span>
                <Link href="/kategori" className={styles.breadcrumbLink}>Kategori</Link>
                <span>›</span>
                <span className={styles.breadcrumbCurrent}>{category?.nama || slug}</span>
            </nav>

            <h1 className={styles.title}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>category</span>
                {category?.nama || slug}
            </h1>

            {catProducts.length > 0 ? (
                <>
                    <p className={styles.productCount}>
                        Menampilkan <strong>{catProducts.length}</strong> produk
                    </p>
                    <div className={styles.grid}>
                        {catProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.empty}>
                    <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--text-muted)' }}>
                        inventory_2
                    </span>
                    <h2>Belum Ada Produk</h2>
                    <p>Produk untuk kategori ini sedang disiapkan. Cek kembali nanti!</p>
                    <Link href="/kategori" className={styles.backBtn}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                        Lihat Kategori Lain
                    </Link>
                </div>
            )}
        </main>
    );
}
