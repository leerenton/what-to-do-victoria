'use client';

import { useState } from 'react';
import Nav from './Nav';
import CitySwitcher from './CitySwitcher';
import type { CityConfig } from '@/lib/types';

export default function SiteShell({
  city,
  children,
}: {
  city: CityConfig;
  children: React.ReactNode;
}) {
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <>
      <Nav city={city} onCitySwitcher={() => setShowSwitcher(true)} />
      {children}
      {showSwitcher && (
        <CitySwitcher currentSlug={city.slug} onClose={() => setShowSwitcher(false)} />
      )}
    </>
  );
}
