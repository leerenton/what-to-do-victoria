'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CityConfig } from '@/lib/types';

interface NavProps {
  city: CityConfig;
  onCitySwitcher?: () => void;
}

export default function Nav({ city, onCitySwitcher }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const closeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const logoSrc = city.logoUrl ?? `/wtd_${city.slug}_black.png`;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDrop(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close search overlay on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
        setOpenDrop(null);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Lock body scroll when drawer/search open
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleDropEnter = useCallback((name: string) => {
    clearTimeout(closeTimers.current[name]);
    setOpenDrop(name);
  }, []);

  const handleDropLeave = useCallback((name: string) => {
    closeTimers.current[name] = setTimeout(() => {
      setOpenDrop(prev => prev === name ? null : prev);
    }, 120);
  }, []);

  const toggleDrop = useCallback((name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDrop(prev => prev === name ? null : name);
  }, []);

  const closeAll = useCallback(() => {
    setOpenDrop(null);
    setMobileOpen(false);
  }, []);

  return (
    <>
      {/* Promo bar — only on non-victoria sites */}
      {city.slug !== 'victoria' && (
        <div className="wtdg-promo-bar">
          <div className="wtdg-promo-bar__inner">
            <span>🏪 Business owner? <Link href="/business-signup">Get listed free →</Link></span>
            <span className="wtdg-promo-bar__sep">|</span>
            <span>🎪 Running an event? <Link href="/business-signup">Promote it here →</Link></span>
          </div>
        </div>
      )}

      <header className="nav" ref={navRef}>
        <div className="nav__inner container">

          {/* Logo */}
          <Link href="/" className="nav__logo-link">
            <Image src={logoSrc} alt={city.fullName} width={140} height={36} className="nav__logo-img" priority />
          </Link>

          {/* Desktop nav links + mobile drawer */}
          <nav className={`nav__links${mobileOpen ? ' nav--open' : ''}`} aria-label="Main navigation">

            {/* Mobile drawer header */}
            <div className="nav__mobile-header">
              <Image src={logoSrc} alt={city.fullName} width={120} height={30} className="nav__mobile-logo" />
              <button className="nav__mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="nav__mobile-scroll">

              {/* Eat mega */}
              <div
                className={`nav__drop nav__drop--mega${openDrop === 'eat' ? ' open' : ''}`}
                onMouseEnter={() => handleDropEnter('eat')}
                onMouseLeave={() => handleDropLeave('eat')}
              >
                <button className="nav__drop-toggle" onClick={e => toggleDrop('eat', e)} aria-expanded={openDrop === 'eat'}>
                  Eat <span className="material-symbols-rounded">expand_more</span>
                </button>
                <div className="nav__drop-menu nav__mega">
                  <div className="nav__mega__left">
                    <p className="nav__mega__label">Browse</p>
                    <Link href="/eat" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">restaurant</span> All Food &amp; Drink</Link>
                    <Link href="/eat?filter=café" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">coffee</span> Cafés</Link>
                    <Link href="/eat?filter=restaurant" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">dinner_dining</span> Restaurants</Link>
                    <Link href="/eat?filter=brunch" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">egg_alt</span> Brunch</Link>
                    <Link href="/eat?filter=bakery" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">bakery_dining</span> Bakeries</Link>
                    <Link href="/eat?filter=asian" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">ramen_dining</span> Asian</Link>
                    <Link href="/eat?filter=pizza" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">local_pizza</span> Pizza</Link>
                  </div>
                  <div className="nav__mega__right">
                    <p className="nav__mega__label">Featured</p>
                    <div className="nav__mega__cards">
                      <Link href="/eat?filter=restaurant" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#0d9488' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Waterfront Dining</span><span className="nav__mega__card-date">City &amp; Waterfront</span></div>
                      </Link>
                      <Link href="/eat?filter=café" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#d97706' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Best Cafés</span><span className="nav__mega__card-date">Coffee &amp; All-Day Dining</span></div>
                      </Link>
                      <Link href="/eat?filter=brunch" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#7c3aed' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Sunday Brunch</span><span className="nav__mega__card-date">Weekend Favourites</span></div>
                      </Link>
                      <Link href="/eat?filter=bakery" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#e11d48' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Bakeries &amp; Sweets</span><span className="nav__mega__card-date">Fresh &amp; Local</span></div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drink mega */}
              <div
                className={`nav__drop nav__drop--mega${openDrop === 'drink' ? ' open' : ''}`}
                onMouseEnter={() => handleDropEnter('drink')}
                onMouseLeave={() => handleDropLeave('drink')}
              >
                <button className="nav__drop-toggle" onClick={e => toggleDrop('drink', e)} aria-expanded={openDrop === 'drink'}>
                  Drink <span className="material-symbols-rounded">expand_more</span>
                </button>
                <div className="nav__drop-menu nav__mega">
                  <div className="nav__mega__left">
                    <p className="nav__mega__label">Browse</p>
                    <Link href="/drink" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">local_bar</span> All Bars &amp; Drinks</Link>
                    <Link href="/drink?filter=brewery" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">sports_bar</span> Breweries</Link>
                    <Link href="/drink?filter=winery" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">wine_bar</span> Wineries &amp; Cellar Doors</Link>
                    <Link href="/drink?filter=bar" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">nightlife</span> Bars</Link>
                    <Link href="/drink?filter=pub" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">emoji_food_beverage</span> Pubs</Link>
                    <Link href="/drink?filter=cocktail" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">local_cafe</span> Cocktails</Link>
                  </div>
                  <div className="nav__mega__right">
                    <p className="nav__mega__label">Featured</p>
                    <div className="nav__mega__cards">
                      <Link href="/drink?filter=brewery" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#1d4ed8' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Craft Beer Trail</span><span className="nav__mega__card-date">{city.name} Breweries</span></div>
                      </Link>
                      <Link href="/drink?filter=winery" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#7c2d12' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Local Wineries</span><span className="nav__mega__card-date">Cellar Door Tastings</span></div>
                      </Link>
                      <Link href="/drink?filter=bar" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#4338ca' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Best Bars</span><span className="nav__mega__card-date">Cocktails &amp; Good Vibes</span></div>
                      </Link>
                      <Link href="/drink?filter=pub" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#166534' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Local Pubs</span><span className="nav__mega__card-date">{city.name} Favourites</span></div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Do mega */}
              <div
                className={`nav__drop nav__drop--mega${openDrop === 'do' ? ' open' : ''}`}
                onMouseEnter={() => handleDropEnter('do')}
                onMouseLeave={() => handleDropLeave('do')}
              >
                <button className="nav__drop-toggle" onClick={e => toggleDrop('do', e)} aria-expanded={openDrop === 'do'}>
                  Do <span className="material-symbols-rounded">expand_more</span>
                </button>
                <div className="nav__drop-menu nav__mega">
                  <div className="nav__mega__left">
                    <p className="nav__mega__label">Browse</p>
                    <Link href="/do" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">explore</span> All Things To Do</Link>
                    <Link href="/do?filter=activity" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">sports_tennis</span> Activities</Link>
                    <Link href="/do?filter=attraction" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">account_balance</span> Attractions</Link>
                    <Link href="/do?filter=art" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">palette</span> Arts &amp; Culture</Link>
                    <Link href="/do?filter=adventure" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">hiking</span> Adventure</Link>
                    <Link href="/do?filter=nature" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">forest</span> Nature &amp; Outdoors</Link>
                    <Link href="/do?filter=wellness" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">spa</span> Wellness</Link>
                    <Link href="/do?filter=sport" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">stadium</span> Sport</Link>
                    <div className="nav__drop-divider" />
                    <Link href="/parks" className="nav__mega__link nav__mega__link--parks" onClick={closeAll}><span className="material-symbols-rounded">park</span> Parks &amp; Green Spaces</Link>
                    <Link href="/date-night" className="nav__mega__link nav__mega__link--datenight" onClick={closeAll}><span className="material-symbols-rounded">favorite</span> Date Night Planner</Link>
                  </div>
                  <div className="nav__mega__right">
                    <p className="nav__mega__label">Featured</p>
                    <div className="nav__mega__cards">
                      <Link href="/do?filter=family" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#0891b2' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Family Activities</span><span className="nav__mega__card-date">Kids &amp; All Ages</span></div>
                      </Link>
                      <Link href="/parks" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#15803d' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Parks &amp; Green Spaces</span><span className="nav__mega__card-date">{city.name}&apos;s Great Outdoors</span></div>
                      </Link>
                      <Link href="/do?filter=art" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#7e22ce' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Arts &amp; Culture</span><span className="nav__mega__card-date">Galleries &amp; Museums</span></div>
                      </Link>
                      <Link href="/do?filter=adventure" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#c2410c' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Adventure &amp; Outdoors</span><span className="nav__mega__card-date">Get Active in {city.name}</span></div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events mega */}
              <div
                className={`nav__drop nav__drop--mega${openDrop === 'events' ? ' open' : ''}`}
                onMouseEnter={() => handleDropEnter('events')}
                onMouseLeave={() => handleDropLeave('events')}
              >
                <button className="nav__drop-toggle" onClick={e => toggleDrop('events', e)} aria-expanded={openDrop === 'events'}>
                  Events <span className="material-symbols-rounded">expand_more</span>
                </button>
                <div className="nav__drop-menu nav__mega">
                  <div className="nav__mega__left">
                    <p className="nav__mega__label">Browse</p>
                    <Link href="/events" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">event</span> All Events</Link>
                    <Link href="/events#today" className="nav__mega__link nav__mega__link--today" onClick={closeAll}><span className="nav__mega__live-dot" /> Happening Today</Link>
                    <Link href="/events#tomorrow" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">wb_sunny</span> Tomorrow</Link>
                    <Link href="/events#weekend" className="nav__mega__link" onClick={closeAll}><span className="material-symbols-rounded">weekend</span> This Weekend</Link>
                    <div className="nav__drop-divider" />
                    <Link href="/events" className="nav__mega__link nav__mega__link--submit" onClick={closeAll}><span className="material-symbols-rounded">add_circle</span> Submit an Event</Link>
                  </div>
                  <div className="nav__mega__right">
                    <p className="nav__mega__label">Major Events</p>
                    <div className="nav__mega__cards">
                      <Link href="/events" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#0e4a7a' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Festival of Sails</span><span className="nav__mega__card-date">Jan 2027</span></div>
                      </Link>
                      <Link href="/events" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#c0392b' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Cadel Evans Race</span><span className="nav__mega__card-date">Feb 2027</span></div>
                      </Link>
                      <Link href="/events" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#6B2737' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Pako Festa</span><span className="nav__mega__card-date">Mar 2027</span></div>
                      </Link>
                      <Link href="/events" className="nav__mega__card" onClick={closeAll}>
                        <div className="nav__mega__card-img" style={{ backgroundColor: '#2c7a4b' }} />
                        <div className="nav__mega__card-body"><span className="nav__mega__card-name">Geelong Show</span><span className="nav__mega__card-date">Oct 2027</span></div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Read */}
              <Link href="/guides" onClick={closeAll}>Read</Link>

              {/* Personalise */}
              <Link href="/account" className="btn btn--teal btn--sm" onClick={closeAll}>Personalise</Link>

            </div>{/* end nav__mobile-scroll */}
          </nav>

          {/* nav__end: city switcher + account + search + hamburger */}
          <div className="nav__end">
            {/* City switcher (multi-city feature) */}
            <button
              className="nav__city-pill"
              onClick={onCitySwitcher}
              title="Switch city"
              aria-label="Switch city"
            >
              <span className="material-symbols-rounded">location_city</span>
              <span className="nav__city-pill__name">{city.name}</span>
              <span className="material-symbols-rounded">expand_more</span>
            </button>

            {/* Account */}
            <Link href="/account" className="nav__login-btn" aria-label="My account">
              <span className="material-symbols-rounded">account_circle</span>
            </Link>

            {/* Search */}
            <button className="nav__search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <span className="material-symbols-rounded">search</span>
            </button>

            {/* Hamburger */}
            <button
              className="nav__hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>

        </div>

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div className="nav__backdrop active" onClick={() => setMobileOpen(false)} aria-hidden="true" />
        )}

        {/* Search overlay */}
        {searchOpen && (
          <div className="nav__search-overlay" onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
            <div className="nav__search-overlay__inner">
              <span className="material-symbols-rounded nav__search-overlay__icon">search</span>
              <input
                ref={searchInputRef}
                className="nav__search-overlay__input"
                type="search"
                placeholder={`Search places, events in ${city.name}…`}
                autoComplete="off"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="nav__search-overlay__close" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            {searchQuery.length >= 2 && (
              <div className="nav__search-results">
                <div className="sr-empty">Search coming soon — <Link href="/events" onClick={() => setSearchOpen(false)}>browse events</Link> or <Link href="/eat" onClick={() => setSearchOpen(false)}>explore places</Link>.</div>
              </div>
            )}
          </div>
        )}

      </header>
    </>
  );
}
