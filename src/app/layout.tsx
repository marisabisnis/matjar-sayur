import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Matjar Sayur - Belanja Segar Harian Online',
    template: '%s | Matjar Sayur',
  },
  description:
    'Belanja sayuran segar, buah-buahan, lauk pauk, dan bumbu dapur online. Diantar cepat langsung dari petani ke rumah Anda. Gratis ongkir untuk pembelian minimal Rp100rb.',
  keywords: [
    'belanja sayur online',
    'sayuran segar',
    'matjar sayur',
    'belanja buah online',
    'bumbu dapur',
    'lauk pauk segar',
    'delivery sayur',
    'toko sayur online',
  ],
  authors: [{ name: 'Matjar Sayur' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Matjar Sayur',
    title: 'Matjar Sayur - Belanja Segar Harian Online',
    description:
      'Belanja sayuran segar, buah-buahan, lauk pauk, dan bumbu dapur online. Diantar cepat langsung dari petani ke rumah Anda.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Matjar Sayur - Belanja Segar Harian Online',
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
        <meta name="apple-mobile-web-app-title" content="Matjar Sayur" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=add,add_shopping_cart,arrow_forward,check_circle,chevron_left,chevron_right,close,cookie,delete,emoji_nature,expand_more,favorite,grid_view,history,home,local_cafe,local_offer,local_shipping,location_on,menu,new_releases,nutrition,phone,play_circle,search,search_off,set_meal,shopping_cart,soup_kitchen,support_agent,trending_up,verified,verified_user,workspace_premium&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', paddingBottom: '72px' }}>
        <Header />
        {children}
        <Footer />
        <BottomNav />
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
