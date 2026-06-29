'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Business } from '@/lib/types';

interface Props {
  businesses: Business[];
  filters: { label: string; value: string }[];
  title: string;
  eyebrow: string;
  sub: string;
  defaultFilter?: string;
}

export default function CollectionPage({ businesses, filters, title, eyebrow, sub, defaultFilter = 'all' }: Props) {
  const [active, setActive] = useState(defaultFilter);

  const filtered = useMemo(() => {
    if (active === 'all') return businesses;
    return businesses.filter(b =>
      b.type?.toLowerCase() === active.toLowerCase() ||
      b.tags?.some(t => t.toLowerCase() === active.toLowerCase())
    );
  }, [businesses, active]);

  return (
    <>
      <div className="coll-hero">
        <div className="coll-hero__inner container">
          <p className="coll-hero__eyebrow">{eyebrow}</p>
          <h1 className="coll-hero__title">{title}</h1>
          <p className="coll-hero__sub">{sub}</p>
        </div>
      </div>

      <div className="coll-body container">
        <div className="coll-topbar">
          <div className="coll-filters" role="group" aria-label="Filter by type">
            <button
              className={`coll-filter-pill ${active === 'all' ? 'active' : ''}`}
              onClick={() => setActive('all')}
            >
              All
            </button>
            {filters.map(f => (
              <button
                key={f.value}
                className={`coll-filter-pill ${active === f.value ? 'active' : ''}`}
                onClick={() => setActive(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="coll-count">{filtered.length} places</p>
        </div>

        <div className="coll-grid">
          {filtered.map(biz => (
            <BizCard key={biz.id} biz={biz} />
          ))}
          {filtered.length === 0 && (
            <p className="coll-empty">No results for this filter yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

function BizCard({ biz }: { biz: Business }) {
  const href = biz.slug ? `/${biz.slug}` : `/listing?id=${biz.id}`;
  return (
    <Link href={href} className="biz-card">
      <div className="biz-card__img-wrap">
        {biz.img ? (
          <Image src={biz.img} alt={biz.name} fill sizes="(max-width: 640px) 100vw, 280px" className="biz-card__img" />
        ) : (
          <div className="biz-card__img-placeholder" style={{ background: biz.color ?? '#e2e8f0' }}>
            <span className="biz-card__emoji">{biz.emoji ?? '🏪'}</span>
          </div>
        )}
        {biz.is_gold && <span className="biz-card__gold">⭐ Gold</span>}
      </div>
      <div className="biz-card__body">
        <h2 className="biz-card__name">{biz.name}</h2>
        <p className="biz-card__type">{biz.type}</p>
        {biz.suburb && <p className="biz-card__location">{biz.suburb}</p>}
        {biz.description && <p className="biz-card__desc">{biz.description}</p>}
      </div>
    </Link>
  );
}
