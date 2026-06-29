import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin — Businesses' };

export default async function AdminBusinessesPage() {
  const supabase = createClient();
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, type, section, city, plan, is_gold, claimed, owner_id, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Businesses</h1>
        <span className="admin-page__count">{businesses?.length ?? 0} total</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th><th>Type</th><th>Section</th><th>City</th><th>Plan</th><th>Claimed</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(businesses ?? []).map(biz => (
              <tr key={biz.id}>
                <td>
                  <Link href={biz.id ? `/listing?id=${biz.id}` : '#'} className="admin-table__link" target="_blank">
                    {biz.name}
                  </Link>
                </td>
                <td>{biz.type}</td>
                <td>{biz.section}</td>
                <td>{biz.city}</td>
                <td>{biz.is_gold ? '⭐ Gold' : biz.plan}</td>
                <td>{biz.claimed ? '✅' : '—'}</td>
                <td>{new Date(biz.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
