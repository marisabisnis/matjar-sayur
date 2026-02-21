import Image from 'next/image';
import Link from 'next/link';
import { formatHarga, hitungDiskonPersen } from '@/lib/utils';
import type { Product } from '@/types';
import AddToCartButton from './AddToCartButton';
import styles from './ProductCard.module.css';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const hargaTampil = product.harga_diskon || product.harga;
    const diskonPersen = product.harga_diskon
        ? hitungDiskonPersen(product.harga, product.harga_diskon)
        : 0;

    return (
        <article className={styles.card}>
            <Link href={`/produk/${product.slug}`} className={styles.cardLink}>
                <div className={styles.imageWrapper}>
                    {diskonPersen > 0 && (
                        <span className={`${styles.badge} ${styles.badgeDiscount}`}>
                            -{diskonPersen}%
                        </span>
                    )}
                    {!product.harga_diskon && product.urutan <= 3 && (
                        <span className={`${styles.badge} ${styles.badgeNew}`}>Baru</span>
                    )}
                    <Image
                        src={product.foto_utama}
                        alt={product.nama}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={styles.productImage}
                        loading="lazy"
                    />
                </div>

                <div className={styles.info}>
                    <p className={styles.category}>{product.kategori_nama || 'Produk'}</p>
                    <h3 className={styles.name}>{product.nama}</h3>
                    <div className={styles.prices}>
                        {product.harga_diskon && (
                            <span className={styles.priceOld}>{formatHarga(product.harga)}</span>
                        )}
                        <span className={styles.priceNow}>{formatHarga(hargaTampil)}</span>
                    </div>
                </div>
            </Link>
            <div className={styles.addBtnWrap}>
                <AddToCartButton product={product} />
            </div>
        </article>
    );
}
