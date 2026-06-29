import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_EMAILS } from '@/lib/types';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !ADMIN_EMAILS.includes(session.user.email ?? '')) {
    redirect('/login?next=/wtdgadmin');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">WTDG Admin</div>
        <nav className="admin-nav">
          <Link href="/wtdgadmin/dash" className="admin-nav__link">📊 Dashboard</Link>
          <Link href="/wtdgadmin/businesses" className="admin-nav__link">🏪 Businesses</Link>
          <Link href="/wtdgadmin/events" className="admin-nav__link">📅 Events</Link>
          <Link href="/wtdgadmin/users" className="admin-nav__link">👥 Users</Link>
          <Link href="/wtdgadmin/offers" className="admin-nav__link">🎁 Offers</Link>
          <Link href="/wtdgadmin/promotions" className="admin-nav__link">📣 Promotions</Link>
          <Link href="/wtdgadmin/revenue" className="admin-nav__link">💰 Revenue</Link>
          <Link href="/wtdgadmin/inquiries" className="admin-nav__link">✉️ Inquiries</Link>
          <Link href="/wtdgadmin/approvals" className="admin-nav__link">✅ Approvals</Link>
          <Link href="/wtdgadmin/content" className="admin-nav__link">📝 Content</Link>
          <Link href="/wtdgadmin/sites" className="admin-nav__link">🌐 Sites</Link>
          <Link href="/wtdgadmin/settings" className="admin-nav__link">⚙️ Settings</Link>
        </nav>
        <Link href="/" className="admin-nav__link admin-sidebar__back">← Back to site</Link>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
