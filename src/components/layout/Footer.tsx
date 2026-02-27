'use client';

import { useEffect, useState } from 'react';
import styles from './Footer.module.css';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Footer() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        if (result.outcome === 'accepted') {
            setInstalled(true);
            setCanInstall(false);
        }
        setDeferredPrompt(null);
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div className={styles.footerBrand}>
                    <div className={styles.footerLogoIcon}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>
                            nutrition
                        </span>
                    </div>
                    <span className={styles.footerLogoText}>Matjar Sayur</span>
                </div>

                {/* PWA Install Section */}
                {canInstall && !installed && (
                    <div className={styles.installSection}>
                        <div className={styles.installInfo}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>
                                install_mobile
                            </span>
                            <span className={styles.installText}>Install aplikasi untuk akses cepat</span>
                        </div>
                        <button onClick={handleInstall} className={styles.installBtn}>
                            Install
                        </button>
                    </div>
                )}

                <p className={styles.footerCopy}>
                    © 2026 Matjar Sayur. Segar dari ladang ke meja Anda.
                </p>
            </div>
        </footer>
    );
}
