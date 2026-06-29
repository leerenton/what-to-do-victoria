'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Site } from '@/lib/types';

interface Props {
  currentSlug: string;
  onClose: () => void;
}

export default function CitySwitcher({ currentSlug, onClose }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [{ data: sitesData }, { data: { session } }] = await Promise.all([
        supabase.from('sites').select('*').eq('active', true).order('name'),
        supabase.auth.getSession(),
      ]);
      setSites(sitesData ?? []);

      if (session?.user) {
        setUserId(session.user.id);
        const { data: subsData } = await supabase
          .from('user_city_subscriptions')
          .select('city, subscribed')
          .eq('user_id', session.user.id);
        setSubs(new Set((subsData ?? []).filter(s => s.subscribed).map(s => s.city)));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function toggleSub(city: string) {
    if (!userId) {
      window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
      return;
    }
    setToggling(city);
    const nowSubbed = subs.has(city);
    await supabase.from('user_city_subscriptions').upsert(
      { user_id: userId, city, subscribed: !nowSubbed },
      { onConflict: 'user_id,city' }
    );
    setSubs(prev => {
      const next = new Set(prev);
      if (nowSubbed) next.delete(city); else next.add(city);
      return next;
    });
    setToggling(null);
  }

  return (
    <div
      className="cs-overlay"
      onClick={e => { if ((e.target as HTMLElement).classList.contains('cs-overlay')) onClose(); }}
    >
      <div className="cs-panel">
        <div className="cs-header">
          <div>
            <div className="cs-title">Switch City</div>
            {userId
              ? <div className="cs-sub">Toggle to get weekly emails for each city</div>
              : <div className="cs-sub"><a href="/login">Sign in</a> to manage email subscriptions</div>
            }
          </div>
          <button className="cs-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {loading ? (
          <div className="cs-loading">Loading cities…</div>
        ) : (
          <div className="cs-cities">
            {sites.map(site => {
              const isCurrent = site.slug === currentSlug;
              const isSubbed = subs.has(site.slug);
              const domain = site.domain;
              return (
                <div key={site.slug} className="cs-city">
                  <div className="cs-city__info">
                    <div className="cs-city__name">
                      {site.name}
                      {isCurrent && <span className="cs-city__here">YOU&apos;RE HERE</span>}
                    </div>
                    <a
                      href={`https://${domain}`}
                      className="cs-city__domain"
                      target={isCurrent ? '_self' : '_blank'}
                      rel="noreferrer"
                    >
                      {domain}
                    </a>
                  </div>
                  <button
                    className={`cs-sub-btn ${isSubbed ? 'cs-sub-btn--active' : ''}`}
                    onClick={() => toggleSub(site.slug)}
                    disabled={toggling === site.slug}
                  >
                    {toggling === site.slug ? '…' : isSubbed ? '✅ Subscribed' : '+ Subscribe'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
