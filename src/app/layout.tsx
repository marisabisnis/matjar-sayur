import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Pesan Sayur - Belanja Segar Harian Online',
    template: '%s | Pesan Sayur',
  },
  description:
    'Belanja sayuran segar, buah-buahan, lauk pauk, dan bumbu dapur online. Diantar cepat langsung dari petani ke rumah Anda. Gratis ongkir untuk pembelian minimal Rp100rb.',
  keywords: [
    'belanja sayur online',
    'sayuran segar',
    'pesan sayur',
    'belanja buah online',
    'bumbu dapur',
    'lauk pauk segar',
    'delivery sayur',
    'toko sayur online',
  ],
  authors: [{ name: 'Pesan Sayur' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Pesan Sayur',
    title: 'Pesan Sayur - Belanja Segar Harian Online',
    description:
      'Belanja sayuran segar, buah-buahan, lauk pauk, dan bumbu dapur online. Diantar cepat langsung dari petani ke rumah Anda.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pesan Sayur - Belanja Segar Harian Online',
    description:
      'Belanja sayuran segar online. Diantar cepat dari petani ke rumah Anda.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pesan Sayur" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', paddingBottom: '72px' }}>
        <Header />
        {children}
        <Footer />
        <BottomNav />
        <InstallPrompt />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
