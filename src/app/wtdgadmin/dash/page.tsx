import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashPage() {
  const supabase = createClient();

  const [
    { count: bizCount },
    { count: eventCount },
    { count: goldCount },
    { count: pendingPromos },
    { count: unreadInquiries },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_gold', true),
    supabase.from('promotions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('unread', true),
  ]);

  const stats = [
    { label: 'Businesses', value: bizCount ?? 0, icon: '🏪' },
    { label: 'Events', value: eventCount ?? 0, icon: '📅' },
    { label: 'Gold Members', value: goldCount ?? 0, icon: '⭐' },
    { label: 'Pending Promos', value: pendingPromos ?? 0, icon: '📣', alert: (pendingPromos ?? 0) > 0 },
    { label: 'Unread Inquiries', value: unreadInquiries ?? 0, icon: '✉️', alert: (unreadInquiries ?? 0) > 0 },
  ];

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Dashboard</h1>
      <div className="admin-stat-grid">
        {stats.map(s => (
          <div key={s.label} className={`admin-stat-card ${s.alert ? 'admin-stat-card--alert' : ''}`}>
            <span className="admin-stat-card__icon">{s.icon}</span>
            <span className="admin-stat-card__val">{s.value}</span>
            <span className="admin-stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
