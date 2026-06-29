import { MetadataRoute } from 'next';
import { getCityConfig } from '@/lib/get-city';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const city = await getCityConfig();
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/wtdgadmin/', '/api/'] },
    ],
    sitemap: `https://${city.domain}/sitemap.xml`,
  };
}
