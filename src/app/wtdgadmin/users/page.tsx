import type { Metadata } from 'next';
import { createServiceClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin — Users' };

export default async function AdminUsersPage() {
  const supabase = createServiceClient();
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 200 });

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Users</h1>
        <span className="admin-page__count">{users?.length ?? 0} total</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Email</th><th>Name</th><th>Provider</th><th>Confirmed</th><th>Created</th></tr>
          </thead>
          <tbody>
            {(users ?? []).map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.user_metadata?.full_name ?? '—'}</td>
                <td>{user.app_metadata?.provider ?? 'email'}</td>
                <td>{user.confirmed_at ? '✅' : '⏳'}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
