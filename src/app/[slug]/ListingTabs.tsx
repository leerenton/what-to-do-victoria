'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Event, Promo } from '@/lib/types';

interface Props {
  events: Event[];
  promos: Promo[];
}

function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function ListingTabs({ events, promos }: Props) {
  const [tab, setTab] = useState<'events' | 'promos'>('events');

  return (
    <>
      <div className="listing-tabs" role="tablist">
        <button
          className={`listing-tab${tab === 'events' ? ' listing-tab--active' : ''}`}
          role="tab"
          onClick={() => setTab('events')}
        >
          What&apos;s on <span className="tab-count">{events.length}</span>
        </button>
        <button
          className={`listing-tab${tab === 'promos' ? ' listing-tab--active' : ''}`}
          role="tab"
          onClick={() => setTab('promos')}
        >
          Offers <span className="tab-count">{promos.length}</span>
        </button>
      </div>

      <div className={`tab-panel${tab !== 'events' ? ' tab-panel--hidden' : ''}`}>
        {events.length > 0 ? (
          <div className="event-scroll" style={{ marginTop: '.75rem' }}>
            {events.map(ev => (
              <Link key={ev.id} href={`/events/${ev.id}`} className="event-card">
                {ev.img
                  ? <img src={ev.img} alt={ev.title} className="event-card__thumb-img" loading="lazy" />
                  : <div className="event-card__thumb" style={{ background: `${ev.color ?? '#e8f4ff'}22` }}>{ev.emoji ?? '📅'}</div>
                }
                <div className="event-card__body">
                  <span className="event-card__cat">{ev.category}</span>
                  <h3 className="event-card__title">{ev.title}</h3>
                  <p className="event-card__meta">📅 {fmtDate(ev.date)}{ev.time ? ` · 🕐 ${ev.time}` : ''}</p>
                  {ev.location && <p className="event-card__meta">📍 {ev.location}</p>}
                  <div className={`event-card__cta${ev.price === 'Free' ? ' event-card__cta--free' : ''}`}>{ev.price === 'Free' ? 'Free Entry' : 'Get Tickets →'}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="listing-empty">No upcoming events right now. Check back soon.</p>
        )}
      </div>

      <div className={`tab-panel${tab !== 'promos' ? ' tab-panel--hidden' : ''}`}>
        {promos.length > 0 ? (
          <div className="promo-list">
            {promos.map(pr => (
              <div key={pr.id} className="promo-card">
                <div className="promo-card__icon">{pr.emoji ?? '🎁'}</div>
                <div className="promo-card__body">
                  {pr.tag && <span className="promo-card__tag">{pr.tag}</span>}
                  <h3 className="promo-card__title">{pr.title}</h3>
                  {pr.description && <p className="promo-card__desc">{pr.description}</p>}
                  {pr.expires && <p className="promo-card__expires">⏳ {pr.expires}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="listing-empty">No active offers right now.</p>
        )}
      </div>
    </>
  );
}
