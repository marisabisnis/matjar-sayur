'use client';

import { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already dismissed recently
        const lastDismissed = localStorage.getItem('pwa-dismiss');
        if (lastDismissed) {
            const diff = Date.now() - Number(lastDismissed);
            if (diff < 7 * 24 * 60 * 60 * 1000) { // 7 days
                return;
            }
        }

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show banner after a short delay
            setTimeout(() => setVisible(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        if (result.outcome === 'accepted') {
            setVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setDismissed(true);
        setVisible(false);
        localStorage.setItem('pwa-dismiss', String(Date.now()));
    };

    if (!visible || dismissed) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <span className={styles.emoji}>📱</span>
                <div className={styles.text}>
                    <p className={styles.title}>Install Pesan Sayur</p>
                    <p className={styles.desc}>Akses cepat dari layar utama!</p>
                </div>
            </div>
            <div className={styles.actions}>
                <button onClick={handleDismiss} className={styles.btnDismiss}>Nanti</button>
                <button onClick={handleInstall} className={styles.btnInstall}>Install</button>
            </div>
        </div>
    );
}
