'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/types';

const CATEGORIES = [
  { label: 'All', filter: 'all' },
  { label: 'Music', filter: 'music' },
  { label: 'Markets', filter: 'markets' },
  { label: 'Arts', filter: 'arts' },
  { label: 'Food & Drink', filter: 'food' },
  { label: 'Family', filter: 'family' },
  { label: 'Sport', filter: 'sport' },
  { label: 'Festival', filter: 'festival' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const SPORT_BRANDS: Record<string, { bg: string; accent: string; logo: string; label: string }> = {
  'afl-cats':   { bg: '#001F5B', accent: '#C49A2B', logo: '🏉', label: 'AFL' },
  'nbl-united': { bg: '#002B5C', accent: '#63B3ED', logo: '🏀', label: 'NBL' },
};

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const iso = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]));
  // Try "day month" format
  const MONTH_MAP: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
  const s = dateStr.replace(/^(mon|tue|wed|thu|fri|sat|sun)[a-z]*[,\s]*/i, '');
  const m = s.match(/(\d{1,2})\s+([a-z]+)/i);
  if (!m) return null;
  const mon = MONTH_MAP[m[2].toLowerCase().slice(0,3)];
  if (mon === undefined) return null;
  const y = new Date().getFullYear();
  return new Date(y, mon, parseInt(m[1]));
}

function getUrgency(ev: Event): 'today' | 'tomorrow' | 'soon' | 'upcoming' | 'past' {
  const d = parseDate(ev.date);
  if (!d) return 'upcoming';
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return 'past';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === 2) return 'soon';
  return 'upcoming';
}

function fmtEventDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Mini Calendar ──────────────────────────────────────────

interface CalRange { start: Date; end: Date }

function MiniCalendar({
  eventDays,
  range,
  onChange,
}: {
  eventDays: Set<string>;
  range: CalRange | null;
  onChange: (r: CalRange | null) => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [pickingEnd, setPickingEnd] = useState(false);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const clear = () => { onChange(null); setPickingEnd(false); };

  const handleCell = (y: number, m: number, d: number) => {
    const clicked = new Date(y, m, d);
    clicked.setHours(0,0,0,0);
    if (!range || !pickingEnd) {
      onChange({ start: clicked, end: clicked });
      setPickingEnd(true);
    } else {
      if (clicked < range.start) {
        onChange({ start: clicked, end: range.start });
      } else {
        onChange({ start: range.start, end: clicked });
      }
      setPickingEnd(false);
    }
  };

  const today = new Date(); today.setHours(0,0,0,0);
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay  = new Date(viewYear, viewMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;

  const startMs = range?.start.getTime() ?? null;
  const endMs   = range?.end.getTime() ?? startMs;

  const rangeLabel = () => {
    if (!range) return null;
    const sM = MONTHS_SHORT[range.start.getMonth()];
    if (range.end.getTime() === range.start.getTime()) return `${range.start.getDate()} ${sM}`;
    const eM = MONTHS_SHORT[range.end.getMonth()];
    return sM === eM
      ? `${range.start.getDate()}–${range.end.getDate()} ${sM}`
      : `${range.start.getDate()} ${sM} – ${range.end.getDate()} ${eM}`;
  };

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startDow; i++) cells.push(<div key={`e${i}`} className="ecal__cell ecal__cell--empty" />);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const key = `${viewYear}-${viewMonth}-${d}`;
    const ms  = new Date(viewYear, viewMonth, d).getTime();
    const isToday = ms === today.getTime();
    const isStart = startMs !== null && ms === startMs;
    const isEnd   = endMs !== null && ms === endMs && range?.end !== range?.start;
    const single  = isStart && startMs === endMs;
    const inRange = startMs !== null && endMs !== null && ms > startMs && ms < endMs;
    const hasEvs  = eventDays.has(key);

    let cls = 'ecal__cell';
    if (single)       cls += ' ecal__cell--range-start ecal__cell--range-end ecal__cell--single';
    else if (isStart) cls += ' ecal__cell--range-start';
    else if (isEnd)   cls += ' ecal__cell--range-end';
    else if (inRange) cls += ' ecal__cell--in-range';
    else if (isToday) cls += ' ecal__cell--today';
    if (hasEvs)       cls += ' ecal__cell--has-events';

    cells.push(
      <button key={d} className={cls} onClick={() => handleCell(viewYear, viewMonth, d)}>
        {d}{hasEvs && <span className="ecal__dot" />}
      </button>
    );
  }

  const label = rangeLabel();

  return (
    <div className="ecal">
      <div className="ecal__nav">
        <button className="ecal__nav-btn" onClick={prevMonth} aria-label="Previous month">
          <span className="material-symbols-rounded">chevron_left</span>
        </button>
        <span className="ecal__month">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="ecal__nav-btn" onClick={nextMonth} aria-label="Next month">
          <span className="material-symbols-rounded">chevron_right</span>
        </button>
        {label && <button className="ecal__clear" onClick={clear}>Clear</button>}
      </div>
      <div className="ecal__grid">
        {DAYS.map(d => <div key={d} className="ecal__dow">{d}</div>)}
        {cells}
      </div>
      {pickingEnd && <p className="ecal__hint">Tap an end date</p>}
    </div>
  );
}

// ── Ev Card ───────────────────────────────────────────────

function EvCard({ event }: { event: Event }) {
  const urgency = getUrgency(event);
  const brand   = event.source ? SPORT_BRANDS[event.source] : null;

  const urgencyBadge = urgency === 'today' ? (
    <span className="ev-urgency ev-urgency--today"><span className="ev-urgency__dot" />Today</span>
  ) : urgency === 'tomorrow' ? (
    <span className="ev-urgency ev-urgency--tomorrow">Tomorrow</span>
  ) : urgency === 'soon' ? (
    <span className="ev-urgency ev-urgency--soon">In 2 days</span>
  ) : null;

  const cardStyle = brand ? { borderTop: `3px solid ${brand.accent}` } : undefined;

  return (
    <Link
      href={`/events/${event.id}`}
      className={`ev-card${brand ? ' ev-card--sport' : ''}${event.is_promoted ? ' ev-card--promoted' : ''}`}
      style={cardStyle}
    >
      {urgencyBadge}
      {brand ? (
        <div className="ev-card__img ev-card__img--sport" style={{ background: brand.bg }}>
          <span className="ev-card__sport-logo">{brand.logo}</span>
          <span className="ev-card__sport-label" style={{ color: brand.accent }}>{brand.label}</span>
        </div>
      ) : event.img ? (
        <div className="ev-card__img" style={{ backgroundImage: `url('${event.img}')` }}>
          {event.is_promoted && <span className="ev-card__promoted-badge">Promoted</span>}
        </div>
      ) : (
        <div className="ev-card__img ev-card__img--emoji" style={{ background: `${event.color ?? '#e8f4ff'}22` }}>
          {event.emoji ?? '📅'}
        </div>
      )}
      <div className="ev-card__body">
        <div className="ev-card__cat-row">
          <span className="ev-card__cat">{event.category}</span>
        </div>
        <h3 className="ev-card__title">{event.title}</h3>
        {event.location && (
          <div className="ev-card__meta">
            <span className="material-symbols-rounded">location_on</span>{event.location}
          </div>
        )}
        <div className="ev-card__meta">
          <span className="material-symbols-rounded">schedule</span>
          {fmtEventDate(event.date)}{event.time ? ` · ${event.time}` : ''}
        </div>
        <div className="ev-card__foot">
          <span className={`ev-card__price${event.price === 'Free' ? ' ev-card__price--free' : ''}`}>
            {event.price || 'See event'}
          </span>
          {(event.tags ?? []).slice(0, 2).map(t => (
            <span key={t} className="ev-card__tag">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── Today strip ───────────────────────────────────────────

function HappeningToday({ events }: { events: Event[] }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayEvs = events.filter(ev => {
    const d = parseDate(ev.date);
    return d && d.getTime() === today.getTime();
  });
  if (!todayEvs.length) return null;

  return (
    <div className="happening-today">
      <div className="container">
        <div className="happening-today__hdr">
          <span className="happening-today__dot" />
          <h2 className="happening-today__title">Happening Today</h2>
          <span className="happening-today__count">{todayEvs.length} event{todayEvs.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="happening-today__scroll">
          {todayEvs.map(ev => (
            <Link key={ev.id} href={`/events/${ev.id}`} className="today-card">
              <div
                className={`today-card__img${!ev.img ? ' today-card__img--emoji' : ''}`}
                style={ev.img ? { backgroundImage: `url('${ev.img}')` } : { background: `${ev.color ?? '#4ac8d0'}22` }}
              >
                {!ev.img && (ev.emoji ?? '📅')}
              </div>
              <div className="today-card__body">
                <span className="today-card__cat">{ev.category}</span>
                <h4 className="today-card__title">{ev.title}</h4>
                <p className="today-card__time">{ev.time ?? 'All day'}</p>
                <p className="today-card__loc">{ev.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────

export default function EventsClient({
  events,
  pastEvents,
  cityName,
}: {
  events: Event[];
  pastEvents: Event[];
  cityName: string;
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch]             = useState('');
  const [calRange, setCalRange]         = useState<CalRange | null>(null);
  const [showPast, setShowPast]         = useState(false);

  // Build set of days that have events (for calendar dots)
  const eventDays = useMemo(() => {
    const s = new Set<string>();
    events.forEach(ev => {
      const d = parseDate(ev.date);
      if (d) s.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return s;
  }, [events]);

  const filterItems = useCallback((items: Event[]) => {
    return items.filter(ev => {
      const matchCat = activeFilter === 'all' || (ev.category ?? '').toLowerCase().includes(activeFilter);
      const matchQ   = !search || [ev.title, ev.location, ev.category].some(f => (f ?? '').toLowerCase().includes(search.toLowerCase()));
      const matchCal = !calRange || (() => {
        const d = parseDate(ev.date);
        if (!d) return false;
        const end = new Date(calRange.end); end.setHours(23,59,59,999);
        return d >= calRange.start && d <= end;
      })();
      return matchCat && matchQ && matchCal;
    });
  }, [activeFilter, search, calRange]);

  const upcoming = useMemo(() => filterItems(events), [events, filterItems]);
  const past     = useMemo(() => filterItems(pastEvents), [pastEvents, filterItems]);
  const count    = upcoming.length + (showPast ? past.length : 0);

  return (
    <>
      <HappeningToday events={events} />

      <div className="events-layout container">
        {/* Sidebar */}
        <aside className="events-sidebar">
          <div className="events-sidebar__inner">
            <div className="events-calendar-wrap">
              <MiniCalendar eventDays={eventDays} range={calRange} onChange={setCalRange} />
            </div>
            <div className="events-sidebar__filters">
              <div className="events-sidebar__filters-label">Category</div>
              <div className="coll-filters coll-filters--vertical">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.filter}
                    className={`coll-filter-pill${activeFilter === cat.filter ? ' active' : ''}`}
                    onClick={() => setActiveFilter(cat.filter)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="events-main">
          <div className="events-main__topbar">
            <div className="coll-search-wrap">
              <span className="material-symbols-rounded coll-search-icon">search</span>
              <input
                className="coll-search"
                type="text"
                placeholder={`Search events in ${cityName}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {calRange && (
            <div style={{ padding: '.5rem 0 .25rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <span className="date-pill" style={{ fontSize: '.85rem' }}>
                📅 {calRange.start.getDate() === calRange.end.getDate() && calRange.start.getMonth() === calRange.end.getMonth()
                  ? `${calRange.start.getDate()} ${MONTHS_SHORT[calRange.start.getMonth()]}`
                  : `${calRange.start.getDate()}–${calRange.end.getDate()} ${MONTHS_SHORT[calRange.end.getMonth()]}`
                }
              </span>
              <button className="gw-link" style={{ fontSize: '.8rem' }} onClick={() => setCalRange(null)}>Clear</button>
            </div>
          )}

          <div className="events-toolbar">
            <p className="coll-count">{count} result{count !== 1 ? 's' : ''}</p>
            <button
              className={`past-toggle${showPast ? ' active' : ''}`}
              onClick={() => setShowPast(v => !v)}
            >
              {showPast ? 'Hide past events' : 'Show past events'}
            </button>
          </div>

          {upcoming.length > 0 || (showPast && past.length > 0) ? (
            <div className="ev-grid">
              {upcoming.map(ev => <EvCard key={ev.id} event={ev} />)}
              {showPast && past.length > 0 && (
                <>
                  <div className="ev-grid__past-divider">Past events</div>
                  {past.map(ev => <EvCard key={ev.id} event={ev} />)}
                </>
              )}
            </div>
          ) : (
            <div className="coll-empty">
              <span className="material-symbols-rounded" style={{ fontSize: '2.5rem' }}>search_off</span>
              <p>No events match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
