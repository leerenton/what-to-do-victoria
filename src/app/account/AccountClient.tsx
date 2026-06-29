'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { CityConfig, SavedItem } from '@/lib/types';

interface Props {
  user: User;
  city: CityConfig;
  savedItems: SavedItem[];
  businesses: { id: string; name: string; slug: string | null; plan: string; is_gold: boolean }[];
  citySubscriptions: { city: string; subscribed: boolean }[];
}

export default function AccountClient({ user, city, savedItems, businesses, citySubscriptions }: Props) {
  const [tab, setTab] = useState<'saved' | 'businesses' | 'subscriptions'>('saved');
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="account-page container">
      <div className="account-header">
        <div>
          <h1 className="account-header__name">{user.user_metadata?.full_name ?? 'My Account'}</h1>
          <p className="account-header__email">{user.email}</p>
        </div>
        <button className="btn btn--ghost" onClick={signOut}>Sign Out</button>
      </div>

      <div className="account-tabs">
        <button className={`account-tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>
          Saved ({savedItems.length})
        </button>
        <button className={`account-tab ${tab === 'businesses' ? 'active' : ''}`} onClick={() => setTab('businesses')}>
          My Businesses ({businesses.length})
        </button>
        <button className={`account-tab ${tab === 'subscriptions' ? 'active' : ''}`} onClick={() => setTab('subscriptions')}>
          City Emails
        </button>
      </div>

      {tab === 'saved' && (
        <div className="account-section">
          {savedItems.length === 0
            ? <p className="account-empty">Nothing saved yet. Browse around and save places you love!</p>
            : (
              <div className="saved-list">
                {savedItems.map(item => (
                  <div key={item.id} className="saved-item">
                    <div className="saved-item__icon" style={{ background: item.color ?? '#e2e8f0' }}>{item.emoji ?? '📌'}</div>
                    <div className="saved-item__info">
                      <p className="saved-item__title">{item.title}</p>
                      {item.location && <p className="saved-item__location">{item.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {tab === 'businesses' && (
        <div className="account-section">
          {businesses.length === 0 ? (
            <div className="account-empty">
              <p>You don&apos;t have any businesses listed yet.</p>
              <Link href="/business-signup" className="btn btn--primary">List Your Business</Link>
            </div>
          ) : (
            <div className="biz-list">
              {businesses.map(biz => (
                <div key={biz.id} className="biz-list-item">
                  <div className="biz-list-item__info">
                    <p className="biz-list-item__name">{biz.name}</p>
                    <p className="biz-list-item__plan">{biz.is_gold ? '⭐ Gold' : biz.plan}</p>
                  </div>
                  <div className="biz-list-item__actions">
                    <Link href="/business-dashboard" className="btn btn--ghost btn--sm">Dashboard</Link>
                    {!biz.is_gold && <Link href="/upgrade" className="btn btn--primary btn--sm">Upgrade</Link>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'subscriptions' && (
        <div className="account-section">
          <p className="account-section__desc">Choose which cities you&apos;d like to receive weekly event digests for.</p>
          <div className="sub-list">
            {citySubscriptions.map(sub => (
              <div key={sub.city} className="sub-item">
                <span className="sub-item__city">{sub.city}</span>
                <span className={`sub-item__status ${sub.subscribed ? 'sub-item__status--on' : ''}`}>
                  {sub.subscribed ? '✅ Subscribed' : 'Not subscribed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
