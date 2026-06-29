import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin — Inquiries' };

export default async function AdminInquiriesPage() {
  const supabase = createClient();
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*, businesses(name)')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Inquiries</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Business</th><th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Unread</th></tr>
          </thead>
          <tbody>
            {(inquiries ?? []).map(inq => (
              <tr key={inq.id} className={inq.unread ? 'admin-table__row--alert' : ''}>
                <td>{inq.businesses?.name ?? inq.business_id}</td>
                <td>{inq.name}</td>
                <td><a href={`mailto:${inq.email}`}>{inq.email}</a></td>
                <td className="admin-table__msg">{inq.message}</td>
                <td>{new Date(inq.created_at).toLocaleDateString()}</td>
                <td>{inq.unread ? '🔴' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
