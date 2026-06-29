import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/lib/structured-data';
import type { Article } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `Local Guides — ${city.name}`,
    description: `Explore hand-picked local guides for ${city.name} — the best places to eat, drink, do and stay.`,
    alternates: { canonical: `https://${city.domain}/guides` },
  };
}

export default async function GuidesPage() {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('approved', true)
    .or(`city.eq.${city.slug},cities.cs.{${city.slug}}`)
    .order('published_at', { ascending: false });

  const list = (articles ?? []) as Article[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Guides', url: `https://${city.domain}/guides` },
      ])} />
      <JsonLd data={itemListSchema(
        `Local Guides for ${city.name}`,
        `https://${city.domain}/guides`,
        list.slice(0, 20).map(a => ({ name: a.title, url: `https://${city.domain}/guides/${a.id}` }))
      )} />

      <div className="coll-hero">
        <div className="coll-hero__inner container">
          <p className="coll-hero__eyebrow">🗺️ Explore {city.name}</p>
          <h1 className="coll-hero__title">Local Guides</h1>
          <p className="coll-hero__sub">Hand-picked guides to the best {city.name} has to offer.</p>
        </div>
      </div>

      <div className="coll-body container">
        <div className="guide-grid">
          {list.map(article => (
            <Link key={article.id} href={`/guides/${article.id}`} className="guide-card">
              <div className="guide-card__img-wrap">
                {article.hero_img && (
                  <Image src={article.hero_img} alt={article.title} fill sizes="(max-width: 640px) 100vw, 360px" className="guide-card__img" />
                )}
              </div>
              <div className="guide-card__body">
                {article.type && <span className="guide-card__type">{article.type}</span>}
                <h2 className="guide-card__title">{article.title}</h2>
                {article.excerpt && <p className="guide-card__excerpt">{article.excerpt}</p>}
                {article.published_at && <p className="guide-card__date">{article.published_at}</p>}
              </div>
            </Link>
          ))}
          {list.length === 0 && <p className="coll-empty">Guides coming soon.</p>}
        </div>
      </div>
    </>
  );
}
