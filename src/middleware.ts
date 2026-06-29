import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { citySlugFromHost, DOMAIN_CITY_MAP } from '@/lib/city';

const ADMIN_HOSTNAME = 'wtdadmin.whattodovictoria.com.au';
const ASSET_RE = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|webp|map|json|txt|xml)$/i;
const PASSTHROUGH_RE = /^\/(api|_next|_vercel|assets)\//;
const ADMIN_RE = /^\/wtdgadmin/;

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const host = request.headers.get('host') ?? hostname;

  // ── Pass through assets and API routes ───────────────────
  if (ASSET_RE.test(pathname) || PASSTHROUGH_RE.test(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createClient(request, response);

  // ── Refresh Supabase auth session ─────────────────────────
  await supabase.auth.getSession();

  // ── Admin subdomain → /wtdgadmin ──────────────────────────
  if (host === ADMIN_HOSTNAME && !ADMIN_RE.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/wtdgadmin' + pathname;
    return NextResponse.rewrite(url);
  }

  // ── Detect city from domain ───────────────────────────────
  const citySlug = citySlugFromHost(host);

  // Attach city slug as a header for Server Components to read
  response.headers.set('x-city-slug', citySlug);

  // ── Site mode guard (skip admin pages) ───────────────────
  if (!ADMIN_RE.test(pathname) && !pathname.includes('maintenance') && !pathname.includes('coming-soon')) {
    try {
      const { data: site } = await supabase
        .from('sites')
        .select('site_mode')
        .or(`domain.eq.${host.split(':')[0]},domain_www.eq.${host.split(':')[0]}`)
        .maybeSingle();

      if (site?.site_mode === 'maintenance') {
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        return NextResponse.redirect(url);
      }
      if (site?.site_mode === 'coming_soon') {
        const url = request.nextUrl.clone();
        url.pathname = '/coming-soon';
        return NextResponse.redirect(url);
      }
    } catch {
      // Fail open — never block a live site
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
