import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Product } from '@/types';
import { formatHarga } from '@/lib/utils';
import ProductDetailClient from './ProductDetailClient';
import styles from './page.module.css';
import productsData from '../../../../public/data/products.json';

const products = productsData as Product[];

export async function generateStaticParams() {
    return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);
    if (!product) return { title: 'Produk Tidak Ditemukan' };

    return {
        title: product.seo_title || product.nama,
        description: product.seo_desc || product.deskripsi,
        openGraph: {
            title: product.seo_title || product.nama,
            description: product.seo_desc || product.deskripsi,
            images: [{ url: product.foto_utama, width: 600, height: 600, alt: product.nama }],
            type: 'website',
        },
    };
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);

    if (!product) {
        return (
            <main className={styles.page}>
                <h1>Produk tidak ditemukan</h1>
            </main>
        );
    }

    const hargaTampil = product.harga_diskon || product.harga;
    const relatedProducts = products
        .filter((p) => p.kategori_id === product.kategori_id && p.id !== product.id)
        .slice(0, 5);
    const allRelated = relatedProducts.length < 4
        ? [...relatedProducts, ...products.filter((p) => p.id !== product.id && !relatedProducts.find((r) => r.id === p.id)).slice(0, 5 - relatedProducts.length)]
        : relatedProducts;

    const gallery = product.foto_galeri?.length > 0
        ? product.foto_galeri
        : [product.foto_utama];

    // JSON-LD Product + BreadcrumbList
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                name: product.nama,
                description: product.deskripsi,
                image: product.foto_utama,
                sku: product.id,
                offers: {
                    '@type': 'Offer',
                    price: hargaTampil,
                    priceCurrency: 'IDR',
                    availability: product.stok > 0
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                    seller: { '@type': 'Organization', name: 'Matjar Sayur' },
                },
                category: product.kategori_nama,
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://matjarsayur.com' },
                    { '@type': 'ListItem', position: 2, name: product.kategori_nama || 'Produk', item: `https://matjarsayur.com/kategori/${product.kategori_nama?.toLowerCase().replace(/\s+/g, '-') || 'semua'}` },
                    { '@type': 'ListItem', position: 3, name: product.nama },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className={styles.page}>
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/" className={styles.breadcrumbLink}>Beranda</Link>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                    <Link href={`/kategori/${product.kategori_nama?.toLowerCase().replace(/\s+/g, '-') || 'semua'}`} className={styles.breadcrumbLink}>
                        {product.kategori_nama || 'Produk'}
                    </Link>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                    <span className={styles.breadcrumbCurrent}>{product.nama}</span>
                </nav>

                <div className={styles.productLayout}>
                    {/* Image Gallery */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImage}>
                            <span className={styles.organikBadge}>Organik</span>
                            <Image
                                src={product.foto_utama}
                                alt={product.nama}
                                fill
                                className={styles.mainImageInner}
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                        <div className={styles.thumbnails}>
                            {gallery.slice(0, 3).map((img, i) => (
                                <button
                                    key={i}
                                    className={`${styles.thumbnail} ${i === 0 ? styles.thumbnailActive : ''}`}
                                    aria-label={`Lihat foto ${i + 1}`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.nama} foto ${i + 1}`}
                                        width={100}
                                        height={100}
                                        className={styles.thumbnailImage}
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                            <button className={styles.thumbnail} aria-label="Putar video produk">
                                <div className={styles.thumbnailVideo}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                                        play_circle
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className={styles.details}>
                        {/* Badges */}
                        <div className={styles.badges}>
                            <span className={styles.badgeBestseller}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                                Terlaris
                            </span>
                            <span className={styles.badgeStock}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                                Stok Tersedia
                            </span>
                        </div>

                        <h1 className={styles.productName}>{product.nama}</h1>

                        {/* Price */}
                        <div className={styles.priceBlock}>
                            <span className={styles.priceMain}>{formatHarga(hargaTampil)}</span>
                            <span className={styles.priceUnit}>/{product.satuan}</span>
                            {product.harga_diskon && (
                                <span className={styles.priceOld}>{formatHarga(product.harga)}</span>
                            )}
                        </div>

                        <p className={styles.description}>{product.deskripsi}</p>

                        <div className={styles.divider} />

                        <ProductDetailClient product={product} />

                        {/* Info Cards */}
                        <div className={styles.infoCards}>
                            <div className={styles.infoCard}>
                                <div className={styles.infoCardLeft}>
                                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>local_shipping</span>
                                    <span className={styles.infoCardLabel}>Pengiriman Instan Tersedia</span>
                                </div>
                                <span className={styles.infoCardValue}>Tiba dalam 2 jam</span>
                            </div>
                            <div className={styles.infoCard}>
                                <div className={styles.infoCardLeft}>
                                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>verified_user</span>
                                    <span className={styles.infoCardLabel}>Garansi Segar</span>
                                </div>
                                <span className={styles.infoCardValue}>Uang kembali jika layu</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <section className={styles.relatedSection} aria-label="Produk terkait">
                    <div className={styles.relatedHeader}>
                        <h2 className={styles.relatedTitle}>Produk Terkait</h2>
                        <div className={styles.relatedNav}>
                            <button className={styles.relatedNavBtn} aria-label="Sebelumnya">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            <button className={styles.relatedNavBtn} aria-label="Selanjutnya">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <div className={`${styles.relatedScroll} scrollbar-hide`}>
                        {allRelated.map((p) => (
                            <Link
                                key={p.id}
                                href={`/produk/${p.slug}`}
                                className={styles.relatedCard}
                            >
                                <div className={styles.relatedCardImage}>
                                    {p.harga_diskon && (
                                        <span className={styles.relatedPromoBadge}>Promo</span>
                                    )}
                                    <Image
                                        src={p.foto_utama}
                                        alt={p.nama}
                                        fill
                                        className={styles.relatedCardImg}
                                        loading="lazy"
                                        sizes="200px"
                                    />
                                    <button className={styles.relatedWishBtn} aria-label={`Suka ${p.nama}`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>favorite</span>
                                    </button>
                                </div>
                                <h3 className={styles.relatedCardName}>{p.nama}</h3>
                                <p className={styles.relatedCardUnit}>{p.satuan}</p>
                                <div className={styles.relatedCardBottom}>
                                    {p.harga_diskon ? (
                                        <div className={styles.relatedPriceGroup}>
                                            <span className={styles.relatedPriceOld}>{formatHarga(p.harga)}</span>
                                            <span className={styles.relatedPrice}>{formatHarga(p.harga_diskon)}</span>
                                        </div>
                                    ) : (
                                        <span className={styles.relatedPrice}>{formatHarga(p.harga)}</span>
                                    )}
                                    <button className={styles.relatedAddBtn} aria-label={`Tambah ${p.nama}`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
