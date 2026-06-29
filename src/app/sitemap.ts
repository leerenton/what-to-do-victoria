import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getCityConfig } from '@/lib/get-city';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const city = await getCityConfig();
  const supabase = createClient();
  const base = `https://${city.domain}`;

  const staticRoutes = [
    { url: base, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${base}/eat`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/drink`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/do`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/events`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${base}/stay`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${base}/guides`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${base}/parks`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/date-night`, priority: 0.7, changeFrequency: 'weekly' as const },
  ];

  const [{ data: businesses }, { data: events }, { data: articles }] = await Promise.all([
    supabase.from('businesses').select('slug, created_at').eq('city', city.slug).not('slug', 'is', null),
    supabase.from('events').select('id, created_at').eq('city', city.slug).gte('date', new Date().toISOString().split('T')[0]),
    supabase.from('articles').select('id, published_at').eq('approved', true),
  ]);

  const bizRoutes = (businesses ?? []).map(b => ({
    url: `${base}/${b.slug}`,
    lastModified: b.created_at,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const eventRoutes = (events ?? []).map(e => ({
    url: `${base}/events/${e.id}`,
    lastModified: e.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const articleRoutes = (articles ?? []).map(a => ({
    url: `${base}/guides/${a.id}`,
    lastModified: a.published_at ?? undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...bizRoutes, ...eventRoutes, ...articleRoutes];
}
