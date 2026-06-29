import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin — Settings' };

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase.from('site_settings').select('*');

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Site Settings</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Key</th><th>Value</th></tr></thead>
          <tbody>
            {(settings ?? []).map((s: any) => (
              <tr key={s.key}><td>{s.key}</td><td>{s.value}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
