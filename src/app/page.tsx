import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import PromoSlider from '@/components/home/PromoSlider';
import type { Product, Category } from '@/types';
import styles from './page.module.css';
import productsData from '../../public/data/products.json';
import categoriesData from '../../public/data/categories.json';
import slidersData from '../../public/data/sliders.json';

export default function HomePage() {
  const products = productsData as Product[];
  const categories = categoriesData as Category[];

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Matjar Sayur',
        url: 'https://matjarsayur.com',
        logo: 'https://matjarsayur.com/icons/logo.png',
        description: 'Toko sayuran & lauk pauk online. Belanja segar harian diantar cepat.',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: 'Indonesian',
        },
      },
      {
        '@type': 'WebSite',
        name: 'Matjar Sayur',
        url: 'https://matjarsayur.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://matjarsayur.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        name: 'Produk Unggulan',
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: p.nama,
            url: `https://matjarsayur.com/produk/${p.slug}`,
            image: p.foto_utama,
            offers: {
              '@type': 'Offer',
              price: p.harga_diskon || p.harga,
              priceCurrency: 'IDR',
              availability: 'https://schema.org/InStock',
            },
          },
        })),
      },
    ],
  };

  const menuItems = [
    { icon: 'home', label: 'Beranda', active: true, filled: true },
    { icon: 'local_offer', label: 'Promo Spesial', active: false },
    { icon: 'trending_up', label: 'Terlaris', active: false },
    { icon: 'new_releases', label: 'Terbaru', active: false },
  ];

  const categoryColors: Record<string, string> = {
    'nutrition': '#16a34a',
    'emoji_nature': '#f97316',
    'set_meal': '#ef4444',
    'soup_kitchen': '#ca8a04',
    'local_cafe': '#3b82f6',
    'cookie': '#a855f7',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.main}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} custom-scrollbar`} aria-label="Navigasi kategori">
          <nav>
            {/* Menu Utama */}
            <div className={styles.sidebarSection}>
              <h2 className={styles.sidebarLabel}>Menu Utama</h2>
              <div className={styles.sidebarNav}>
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href="#"
                    className={`${styles.sidebarLink} ${item.active ? styles.sidebarLinkActive : ''}`}
                  >
                    <span
                      className={`material-symbols-outlined ${item.filled ? 'filled' : ''} ${styles.sidebarIcon}`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Kategori */}
            <div className={styles.sidebarSection}>
              <h2 className={styles.sidebarLabel}>Kategori</h2>
              <div className={styles.sidebarNav}>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className={styles.sidebarLink}
                  >
                    <span
                      className={`material-symbols-outlined ${styles.sidebarIcon}`}
                      style={{ '--hover-color': categoryColors[cat.icon_url] || '#16a34a' } as React.CSSProperties}
                    >
                      {cat.icon_url}
                    </span>
                    {cat.nama}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Member Plus */}
          <div className={styles.memberBox}>
            <div className={styles.memberCard}>
              <div className={styles.memberHeader}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>
                  workspace_premium
                </span>
                <h3 className={styles.memberTitle}>Member Plus</h3>
              </div>
              <p className={styles.memberDesc}>
                Dapatkan gratis ongkir tanpa minimum belanja.
              </p>
              <button className={styles.memberBtn}>Upgrade Sekarang</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          {/* Promo Slider */}
          <PromoSlider slides={slidersData} />

          {/* Produk Unggulan */}
          <section aria-label="Produk unggulan">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className="material-symbols-outlined filled" style={{ color: 'var(--color-primary)' }}>
                  verified
                </span>
                Produk Unggulan
              </h2>
              <Link href="/kategori/semua" className={styles.sectionLink}>
                Lihat Semua
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  chevron_right
                </span>
              </Link>
            </div>

            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Trust Badges */}
          <section className={styles.trustSection} aria-label="Keunggulan layanan">
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                  local_shipping
                </span>
              </div>
              <div>
                <h3 className={styles.trustTitle}>Pengiriman Cepat</h3>
                <p className={styles.trustDesc}>Pesanan Anda dikirim langsung hari ini.</p>
              </div>
            </div>

            <div className={styles.trustDivider} />

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                  verified_user
                </span>
              </div>
              <div>
                <h3 className={styles.trustTitle}>Jaminan Kualitas</h3>
                <p className={styles.trustDesc}>Produk segar dan berkualitas tinggi.</p>
              </div>
            </div>

            <div className={styles.trustDivider} />

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                  support_agent
                </span>
              </div>
              <div>
                <h3 className={styles.trustTitle}>Layanan 24/7</h3>
                <p className={styles.trustDesc}>Bantuan pelanggan siap melayani Anda.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
