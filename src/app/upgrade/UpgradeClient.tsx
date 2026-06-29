'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { CityConfig } from '@/lib/types';

const FEATURES = [
  { icon: 'mail', title: 'Live enquiry form', desc: 'Customers contact you directly from your listing' },
  { icon: 'home', title: 'Homepage placement', desc: 'Featured in the homepage sections for your category' },
  { icon: 'mark_email_read', title: 'Weekly email feature', desc: 'Included in our digest to thousands of locals' },
  { icon: 'campaign', title: 'Promoted events', desc: '1 promoted event per month included (annual plan)' },
  { icon: 'star', title: 'Gold badge', desc: 'Stand out with a Gold verified badge on your listing' },
  { icon: 'bar_chart', title: 'Analytics', desc: 'See how many people view and interact with your listing' },
];

export default function UpgradeClient({
  city,
  businesses,
}: {
  city: CityConfig;
  businesses: { id: string; name: string; is_gold: boolean; plan: string }[];
}) {
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  const [selectedBiz, setSelectedBiz] = useState(businesses[0]?.id ?? '');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleCheckout() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/login?next=/upgrade'; return; }

    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        type: plan === 'annual' ? 'gold_annual' : 'gold_monthly',
        bizId: selectedBiz,
        userId: session.user.id,
        successUrl: `${window.location.origin}/business-dashboard?success=1`,
        cancelUrl: `${window.location.origin}/upgrade?cancelled=1`,
      }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { alert('Something went wrong. Please try again.'); setLoading(false); }
  }

  return (
    <div className="upgrade-wrap">
      <div className="upgrade-topbar container">
        <Link href="/" className="upgrade-topbar__logo">{city.fullName}</Link>
        <Link href="/business-dashboard" className="upgrade-topbar__back">← Back to dashboard</Link>
      </div>

      <div className="upgrade-hero container">
        <div className="upgrade-hero__badge">⭐ Gold Membership</div>
        <h1 className="upgrade-hero__title">Get more from your listing</h1>
        <p className="upgrade-hero__sub">
          Unlock direct enquiries, homepage placement, promoted events and a spot in our weekly email.
        </p>
      </div>

      <div className="upgrade-toggle container">
        <button className={`upgrade-toggle__btn ${plan === 'annual' ? 'active' : ''}`} onClick={() => setPlan('annual')}>
          Annual <span className="upgrade-toggle__save">Save 17%</span>
        </button>
        <button className={`upgrade-toggle__btn ${plan === 'monthly' ? 'active' : ''}`} onClick={() => setPlan('monthly')}>
          Monthly
        </button>
      </div>

      <div className="upgrade-card container">
        <div className="upgrade-card__left">
          <div className="upgrade-card__plan">Gold</div>
          <div className="upgrade-card__price-row">
            <span className="upgrade-card__price">{plan === 'annual' ? '$249' : '$25'}</span>
            <span className="upgrade-card__per">{plan === 'annual' ? '/ year' : '/ month'}</span>
          </div>
          <p className="upgrade-card__note">
            {plan === 'annual' ? 'Billed annually · cancel anytime' : 'Billed monthly · cancel anytime'}
          </p>
          <ul className="upgrade-card__features">
            {FEATURES.map(f => (
              <li key={f.icon}>
                <span className="material-symbols-rounded">{f.icon}</span>
                <div><strong>{f.title}</strong> — {f.desc}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="upgrade-card__right">
          {businesses.length > 1 && (
            <div className="form-field">
              <label>Select your business</label>
              <select value={selectedBiz} onChange={e => setSelectedBiz(e.target.value)}>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          {businesses.length === 0 ? (
            <div>
              <p>You don&apos;t have any businesses listed yet.</p>
              <Link href="/business-signup" className="btn btn--primary">List Your Business First</Link>
            </div>
          ) : (
            <button className="btn btn--gold btn--full" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Redirecting…' : `Upgrade to Gold — ${plan === 'annual' ? '$249/yr' : '$25/mo'}`}
            </button>
          )}
          <p className="upgrade-card__terms">Secure payment via Stripe. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}
