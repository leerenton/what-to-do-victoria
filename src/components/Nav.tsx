'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CityConfig } from '@/lib/types';

interface NavProps {
  city: CityConfig;
  onCitySwitcher?: () => void;
}

export default function Nav({ city, onCitySwitcher }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (name: string) =>
    setActiveDropdown(prev => (prev === name ? null : name));

  return (
    <header className="nav" ref={navRef}>
      <div className="nav__inner container">
        {/* Logo */}
        <Link href="/" className="nav__logo-link">
          {city.logoUrl ? (
            <Image src={city.logoUrl} alt={city.fullName} width={140} height={36} className="nav__logo" />
          ) : (
            <span className="nav__logo-text">{city.fullName}</span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="nav__links" aria-label="Main navigation">

          {/* Eat mega */}
          <div className={`nav__drop nav__drop--mega ${activeDropdown === 'eat' ? 'nav__drop--open' : ''}`}>
            <button className="nav__drop-toggle" onClick={() => toggle('eat')} aria-expanded={activeDropdown === 'eat'}>
              Eat <span className="material-symbols-rounded">expand_more</span>
            </button>
            <div className="nav__drop-menu nav__mega">
              <div className="nav__mega__left">
                <p className="nav__mega__label">Browse</p>
                <Link href="/eat" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">restaurant</span> All Food &amp; Drink</Link>
                <Link href="/eat?filter=caf%C3%A9" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">coffee</span> Cafés</Link>
                <Link href="/eat?filter=restaurant" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">dinner_dining</span> Restaurants</Link>
                <Link href="/eat?filter=brunch" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">egg_alt</span> Brunch</Link>
                <Link href="/eat?filter=bakery" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">bakery_dining</span> Bakeries</Link>
                <Link href="/eat?filter=asian" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">ramen_dining</span> Asian</Link>
                <Link href="/eat?filter=pizza" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">local_pizza</span> Pizza</Link>
              </div>
              <div className="nav__mega__right">
                <p className="nav__mega__label">Drink</p>
                <Link href="/drink" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">local_bar</span> All Bars &amp; Drinks</Link>
                <Link href="/drink?filter=bar" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">sports_bar</span> Bars</Link>
                <Link href="/drink?filter=wine" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">wine_bar</span> Wine Bars</Link>
                <Link href="/drink?filter=cocktails" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">local_bar</span> Cocktail Bars</Link>
                <Link href="/drink?filter=brewery" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">sports_bar</span> Breweries</Link>
                <Link href="/date-night" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">favorite</span> Date Night</Link>
              </div>
            </div>
          </div>

          {/* Do mega */}
          <div className={`nav__drop nav__drop--mega ${activeDropdown === 'do' ? 'nav__drop--open' : ''}`}>
            <button className="nav__drop-toggle" onClick={() => toggle('do')} aria-expanded={activeDropdown === 'do'}>
              Do <span className="material-symbols-rounded">expand_more</span>
            </button>
            <div className="nav__drop-menu nav__mega">
              <div className="nav__mega__left">
                <p className="nav__mega__label">Things To Do</p>
                <Link href="/do" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">explore</span> All Activities</Link>
                <Link href="/do?filter=attraction" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">stadium</span> Attractions</Link>
                <Link href="/do?filter=adventure" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">hiking</span> Adventure</Link>
                <Link href="/do?filter=arts" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">palette</span> Arts &amp; Culture</Link>
                <Link href="/do?filter=sport" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">sports</span> Sport</Link>
                <Link href="/do?filter=family" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">family_restroom</span> Family</Link>
                <Link href="/do?filter=wellness" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">spa</span> Wellness</Link>
                <Link href="/parks" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">park</span> Parks</Link>
              </div>
              <div className="nav__mega__right">
                <p className="nav__mega__label">Stay &amp; More</p>
                <Link href="/stay" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">hotel</span> Where to Stay</Link>
                <Link href="/events" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">event</span> Events</Link>
                <Link href="/guides" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">map</span> Local Guides</Link>
                <Link href="/community-guides" className="nav__mega__link" onClick={() => setActiveDropdown(null)}><span className="material-symbols-rounded">groups</span> Community Guides</Link>
              </div>
            </div>
          </div>

          <Link href="/events" className="nav__link">Events</Link>
          <Link href="/stay" className="nav__link">Stay</Link>
          <Link href="/guides" className="nav__link">Guides</Link>

          {/* City switcher */}
          <button className="nav__city-btn" onClick={onCitySwitcher} title="Switch city">
            <span className="material-symbols-rounded">location_city</span>
            <span className="nav__city-name">{city.name}</span>
            <span className="material-symbols-rounded nav__city-chevron">expand_more</span>
          </button>
        </nav>

        {/* Account + mobile */}
        <div className="nav__actions">
          <Link href="/account" className="nav__account-btn" aria-label="Account">
            <span className="material-symbols-rounded">account_circle</span>
          </Link>
          <button
            className="nav__mobile-toggle"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-rounded">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav__mobile">
          <Link href="/eat" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>Eat</Link>
          <Link href="/drink" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>Drink</Link>
          <Link href="/do" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>Do</Link>
          <Link href="/events" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>Events</Link>
          <Link href="/stay" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>Stay</Link>
          <Link href="/guides" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>Guides</Link>
          <Link href="/parks" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>Parks</Link>
          <Link href="/date-night" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>Date Night</Link>
          <hr className="nav__mobile-divider" />
          <Link href="/account" className="nav__mobile-link" onClick={() => setMobileOpen(false)}>My Account</Link>
          <button className="nav__mobile-link nav__mobile-link--city" onClick={() => { setMobileOpen(false); onCitySwitcher?.(); }}>
            Switch City ({city.name})
          </button>
        </div>
      )}
    </header>
  );
}
