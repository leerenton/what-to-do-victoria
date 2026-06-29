import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/lib/structured-data';
import type { Stay } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `Where to Stay in ${city.name}`,
    description: `Find the best hotels, apartments, B&Bs and accommodation in ${city.name}.`,
    alternates: { canonical: `https://${city.domain}/stay` },
  };
}

export default async function StayPage() {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: stays } = await supabase
    .from('stays')
    .select('*')
    .eq('city', city.slug)
    .order('name');

  const stayList = (stays ?? []) as Stay[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Where to Stay', url: `https://${city.domain}/stay` },
      ])} />
      <JsonLd data={itemListSchema(
        `Accommodation in ${city.name}`,
        `https://${city.domain}/stay`,
        stayList.slice(0, 20).map(s => ({ name: s.name, url: `https://${city.domain}/stay` }))
      )} />

      <div className="coll-hero">
        <div className="coll-hero__inner container">
          <p className="coll-hero__eyebrow">🛏️ Accommodation in {city.name}</p>
          <h1 className="coll-hero__title">Where to Stay</h1>
          <p className="coll-hero__sub">Hotels, boutique stays and apartments — find the perfect base in {city.name}.</p>
        </div>
      </div>

      <div className="coll-body container">
        <div className="coll-grid">
          {stayList.map(stay => (
            <div key={stay.id} className="biz-card">
              <div className="biz-card__img-wrap">
                {stay.img ? (
                  <Image src={stay.img} alt={stay.name} fill sizes="(max-width: 640px) 100vw, 280px" className="biz-card__img" />
                ) : (
                  <div className="biz-card__img-placeholder" style={{ background: stay.color ?? '#e2e8f0' }}>
                    <span>{stay.emoji ?? '🏨'}</span>
                  </div>
                )}
              </div>
              <div className="biz-card__body">
                <h2 className="biz-card__name">{stay.name}</h2>
                <p className="biz-card__type">{stay.type}</p>
                {stay.location && <p className="biz-card__location">{stay.location}</p>}
                {stay.price && <p className="biz-card__price">From {stay.price}</p>}
                {stay.stars && <p className="biz-card__stars">{'⭐'.repeat(Number(stay.stars))}</p>}
              </div>
            </div>
          ))}
          {stayList.length === 0 && (
            <p className="coll-empty">Accommodation listings coming soon.</p>
          )}
        </div>
      </div>
    </>
  );
}
