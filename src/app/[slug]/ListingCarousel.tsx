'use client';

import { useState, useEffect } from 'react';

interface Props {
  slides: string[];
  typeBadge: string | null;
  emoji: string | null;
  color: string | null;
}

export default function ListingCarousel({ slides, typeBadge, emoji, color }: Props) {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCur(c => (c + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  const prev = () => setCur(c => (c - 1 + slides.length) % slides.length);
  const next = () => setCur(c => (c + 1) % slides.length);

  return (
    <div className="lhero lhero--full">
      <div className="lhero__track">
        {slides.length > 0 ? slides.map((src, i) => (
          <div
            key={i}
            className={`lhero__slide${i === cur ? ' active' : ''}`}
            style={{ backgroundImage: `url('${src}')` }}
          />
        )) : (
          <div
            className="lhero__slide active"
            style={{ background: `${color ?? '#4ac8d0'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}
          >
            {emoji ?? '🏪'}
          </div>
        )}
      </div>
      {slides.length > 1 && (
        <>
          <button className="lhero__arrow lhero__arrow--prev" onClick={prev} aria-label="Previous">‹</button>
          <button className="lhero__arrow lhero__arrow--next" onClick={next} aria-label="Next">›</button>
          <div className="lhero__dots">
            {slides.map((_, i) => (
              <button key={i} className={`lhero__dot${i === cur ? ' active' : ''}`} onClick={() => setCur(i)} />
            ))}
          </div>
        </>
      )}
      <div className="lhero__badge-wrap">
        <span className="lhero__type-badge">{typeBadge ?? 'Business'}</span>
      </div>
    </div>
  );
}
