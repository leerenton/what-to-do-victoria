'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Event } from '@/lib/types';

const CATEGORIES = ['All', 'Music', 'Food & Drink', 'Arts', 'Sport', 'Family', 'Markets', 'Festivals', 'Community'];

export default function EventsClient({ events, cityName }: { events: Event[]; cityName: string }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchesCat = category === 'All' || e.category === category || e.tags?.includes(category);
      const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [events, category, search]);

  return (
    <div className="coll-body container">
      <div className="coll-topbar">
        <div className="events-search-wrap">
          <span className="material-symbols-rounded">search</span>
          <input
            type="search"
            placeholder={`Search events in ${cityName}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="events-search"
            aria-label="Search events"
          />
        </div>
        <div className="coll-filters" role="group" aria-label="Filter by category">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`coll-filter-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <p className="coll-count">{filtered.length} events</p>
      </div>

      <div className="event-grid">
        {filtered.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
        {filtered.length === 0 && (
          <p className="coll-empty">No events found. Try a different filter.</p>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`} className="event-card">
      <div className="event-card__img-wrap">
        {event.img ? (
          <Image src={event.img} alt={event.title} fill sizes="(max-width: 640px) 100vw, 320px" className="event-card__img" />
        ) : (
          <div className="event-card__img-placeholder" style={{ background: event.color ?? '#e2e8f0' }}>
            <span className="event-card__emoji">{event.emoji ?? '📅'}</span>
          </div>
        )}
        {event.is_promoted && <span className="event-card__promoted">Promoted</span>}
      </div>
      <div className="event-card__body">
        <span className="event-card__cat">{event.category ?? 'Event'}</span>
        <h2 className="event-card__title">{event.title}</h2>
        <p className="event-card__meta">
          {event.date && <span>{event.date}</span>}
          {event.time && <span> · {event.time}</span>}
          {event.location && <span> · {event.location}</span>}
        </p>
        {event.price && <p className="event-card__price">{event.price}</p>}
      </div>
    </Link>
  );
}
