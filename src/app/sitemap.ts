import type { MetadataRoute } from 'next';
import productsData from '../../public/data/products.json';
import type { Product } from '@/types';

const products = productsData as Product[];

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://matjarsayur.com';

    const productUrls = products.map((p) => ({
        url: `${baseUrl}/produk/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...productUrls,
    ];
}
