import { headers } from 'next/headers';
import { createClient } from './supabase/server';
import { siteToConfig, FALLBACK_CITY_CONFIG, citySlugFromHost } from './city';
import type { CityConfig } from './types';

// Called from Server Components to get the current city config.
// Reads the x-city-slug header set by middleware, then fetches from DB.
export async function getCityConfig(): Promise<CityConfig> {
  const headersList = headers();
  const slug = headersList.get('x-city-slug') ?? 'geelong';

  try {
    const supabase = createClient();
    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', slug)
      .single();

    if (site) return siteToConfig(site);
  } catch {}

  return FALLBACK_CITY_CONFIG;
}
