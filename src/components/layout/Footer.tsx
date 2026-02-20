import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div className={styles.footerBrand}>
                    <div className={styles.footerLogoIcon}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>
                            nutrition
                        </span>
                    </div>
                    <span className={styles.footerLogoText}>Pesan Sayur</span>
                </div>
                <p className={styles.footerCopy}>
                    © 2026 Pesan Sayur. Segar dari ladang ke meja Anda.
                </p>
            </div>
        </footer>
    );
}
