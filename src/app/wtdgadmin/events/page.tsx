import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin — Events' };

export default async function AdminEventsPage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from('events')
    .select('id, title, category, date, location, city, featured, is_promoted, source, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Events</h1>
        <span className="admin-page__count">{events?.length ?? 0} total</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Category</th><th>Date</th><th>City</th><th>Source</th><th>Featured</th><th>Promoted</th></tr>
          </thead>
          <tbody>
            {(events ?? []).map(e => (
              <tr key={e.id}>
                <td><a href={`/events/${e.id}`} target="_blank" className="admin-table__link">{e.title}</a></td>
                <td>{e.category}</td>
                <td>{e.date}</td>
                <td>{e.city}</td>
                <td>{e.source}</td>
                <td>{e.featured ? '⭐' : '—'}</td>
                <td>{e.is_promoted ? '📣' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
