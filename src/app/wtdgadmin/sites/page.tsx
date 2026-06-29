import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin — Sites' };

export default async function AdminSitesPage() {
  const supabase = createClient();
  const { data: sites } = await supabase.from('sites').select('*').order('name');

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Sites / Cities</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Domain</th><th>Mode</th><th>Active</th></tr></thead>
          <tbody>
            {(sites ?? []).map(site => (
              <tr key={site.id}>
                <td>{site.full_name}</td>
                <td>{site.slug}</td>
                <td><a href={`https://${site.domain}`} target="_blank" rel="noreferrer">{site.domain}</a></td>
                <td><span className={`badge badge--${site.site_mode}`}>{site.site_mode}</span></td>
                <td>{site.active ? '✅' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
