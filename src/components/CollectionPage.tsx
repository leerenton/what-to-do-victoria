'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Business } from '@/lib/types';

interface Props {
  businesses: Business[];
  filters: { label: string; value: string }[];
  title: string;
  eyebrow: string;
  sub: string;
  heroClass?: string;
  defaultFilter?: string;
}

export default function CollectionPage({
  businesses,
  filters,
  title,
  eyebrow,
  sub,
  heroClass = '',
  defaultFilter = 'all',
}: Props) {
  const [active, setActive] = useState(defaultFilter);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return businesses.filter(b => {
      const matchCat = active === 'all' ||
        (b.type ?? '').toLowerCase().includes(active) ||
        (b.tags ?? []).some(t => t.toLowerCase().includes(active));
      const matchQ = !search ||
        (b.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (b.suburb ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (b.description ?? '').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQ;
    });
  }, [businesses, active, search]);

  return (
    <>
      <div className={`coll-hero${heroClass ? ` ${heroClass}` : ''}`}>
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
              className={`coll-filter-pill${active === 'all' ? ' active' : ''}`}
              onClick={() => setActive('all')}
            >
              All
            </button>
            {filters.map(f => (
              <button
                key={f.value}
                className={`coll-filter-pill${active === f.value ? ' active' : ''}`}
                onClick={() => setActive(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="coll-topbar-row2">
            <div className="coll-search-wrap">
              <span className="material-symbols-rounded coll-search-icon">search</span>
              <input
                className="coll-search"
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <p className="coll-count">{filtered.length} place{filtered.length !== 1 ? 's' : ''}</p>

        <div className="coll-grid">
          {filtered.map(biz => <CollCard key={biz.id} biz={biz} />)}
          {filtered.length === 0 && (
            <div className="coll-empty">
              <span className="material-symbols-rounded" style={{ fontSize: '2.5rem' }}>search_off</span>
              <p>No results match your search.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CollCard({ biz }: { biz: Business }) {
  const href = biz.slug ? `/${biz.slug}` : `/listing?id=${biz.id}`;
  return (
    <Link href={href} className={`coll-card${biz.is_gold ? ' coll-card--gold' : ''}`}>
      {biz.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={biz.img} alt={biz.name} className="coll-card__img" loading="lazy" />
      ) : (
        <div className="coll-card__img-placeholder" style={{ background: `${biz.color ?? '#4ac8d0'}22` }}>
          {biz.emoji ?? '🏪'}
        </div>
      )}
      <div className="coll-card__body">
        <div className="coll-card__type-row">
          <div className="coll-card__type">{biz.type}</div>
          {biz.is_gold && <span className="coll-card__gold-badge">⭐ Gold</span>}
        </div>
        <div className="coll-card__name">{biz.name}</div>
        {biz.description && <div className="coll-card__desc">{biz.description}</div>}
        <div className="coll-card__foot">
          <span className="coll-card__loc">
            <span className="material-symbols-rounded" style={{ fontSize: '.85rem', verticalAlign: '-.1em' }}>location_on</span>
            {' '}{biz.suburb ?? biz.location ?? ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
