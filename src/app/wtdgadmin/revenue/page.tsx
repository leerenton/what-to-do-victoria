import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin — Revenue' };

export default async function AdminRevenuePage() {
  const supabase = createClient();

  const [{ data: goldBiz }, { data: promotions }] = await Promise.all([
    supabase.from('businesses').select('id, name, city, gold_expires_at, stripe_subscription_id').eq('is_gold', true).order('name'),
    supabase.from('promotions').select('id, package, paid_amount, city, status, created_at').order('created_at', { ascending: false }).limit(100),
  ]);

  const promoRevenue = (promotions ?? []).reduce((sum, p) => sum + (p.paid_amount ?? 0), 0);

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Revenue</h1>
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><span className="admin-stat-card__icon">⭐</span><span className="admin-stat-card__val">{goldBiz?.length ?? 0}</span><span className="admin-stat-card__label">Active Gold</span></div>
        <div className="admin-stat-card"><span className="admin-stat-card__icon">💰</span><span className="admin-stat-card__val">${(promoRevenue / 100).toFixed(0)}</span><span className="admin-stat-card__label">Promo Revenue (AUD)</span></div>
      </div>
      <h2 className="admin-section-title">Gold Members</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Business</th><th>City</th><th>Gold Expires</th></tr></thead>
          <tbody>
            {(goldBiz ?? []).map(b => (
              <tr key={b.id}><td>{b.name}</td><td>{b.city}</td><td>{b.gold_expires_at?.split('T')[0] ?? '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="admin-section-title">Promotions</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Package</th><th>City</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {(promotions ?? []).map(p => (
              <tr key={p.id}><td>{p.package}</td><td>{p.city}</td><td><span className={`badge badge--${p.status}`}>{p.status}</span></td><td>${((p.paid_amount ?? 0) / 100).toFixed(2)}</td><td>{new Date(p.created_at).toLocaleDateString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
