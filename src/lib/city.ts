import type { CityConfig, Site } from './types';

// Static fallback map for middleware (runs before DB is available)
export const DOMAIN_CITY_MAP: Record<string, string> = {
  'whattodogeelong.com.au':       'geelong',
  'www.whattodogeelong.com.au':   'geelong',
  'whattodoballarat.com.au':      'ballarat',
  'www.whattodoballarat.com.au':  'ballarat',
  'whattodobendigo.com.au':       'bendigo',
  'www.whattodobendigo.com.au':   'bendigo',
  'whattodovictoria.com.au':      'victoria',
  'www.whattodovictoria.com.au':  'victoria',
  'whattodoshepparton.com.au':    'shepparton',
  'www.whattodoshepparton.com.au':'shepparton',
  'whattodowodonga.com.au':       'wodonga',
  'www.whattodowodonga.com.au':   'wodonga',
  'whattodohorsham.com.au':       'horsham',
  'www.whattodohorsham.com.au':   'horsham',
  'whattodomildura.com.au':       'mildura',
  'www.whattodomildura.com.au':   'mildura',
  'whattodosale.com.au':          'sale',
  'www.whattodosale.com.au':      'sale',
  'whattodotraralgon.com.au':     'traralgon',
  'www.whattodotraralgon.com.au': 'traralgon',
  'whattodowarrnambool.com.au':   'warrnambool',
  'www.whattodowarrnambool.com.au':'warrnambool',
};

export const DEFAULT_CITY = 'geelong';

export function citySlugFromHost(host: string): string {
  // Strip port for local dev
  const h = host.split(':')[0];
  return DOMAIN_CITY_MAP[h] ?? DEFAULT_CITY;
}

export function siteToConfig(site: Site): CityConfig {
  return {
    slug: site.slug,
    name: site.name,
    fullName: site.full_name,
    domain: site.domain,
    logoUrl: site.logo_url,
    primaryColor: site.primary_color,
    heroTagline: site.hero_tagline,
    mapLat: site.map_lat,
    mapLng: site.map_lng,
    mapZoom: site.map_zoom,
  };
}

export const FALLBACK_CITY_CONFIG: CityConfig = {
  slug: 'geelong',
  name: 'Geelong',
  fullName: 'What To Do Geelong',
  domain: 'whattodogeelong.com.au',
  logoUrl: null,
  primaryColor: '#0d9488',
  heroTagline: 'Your guide to Geelong',
  mapLat: -38.1499,
  mapLng: 144.3617,
  mapZoom: 13,
};
