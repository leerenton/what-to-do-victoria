'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminApprovalsClient({ promotions: initial }: { promotions: any[] }) {
  const [promotions, setPromotions] = useState(initial);
  const supabase = createClient();

  async function updateStatus(id: string, status: string) {
    await supabase.from('promotions').update({ status }).eq('id', id);
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr><th>Business</th><th>Package</th><th>Type</th><th>City</th><th>Dates</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {promotions.map(p => (
            <tr key={p.id} className={p.status === 'pending' ? 'admin-table__row--alert' : ''}>
              <td>{p.businesses?.name ?? p.business_id}</td>
              <td>{p.package}</td>
              <td>{p.item_type}</td>
              <td>{p.city}</td>
              <td>{p.starts_at?.split('T')[0]} → {p.ends_at?.split('T')[0]}</td>
              <td><span className={`badge badge--${p.status}`}>{p.status}</span></td>
              <td>
                {p.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn--primary btn--xs" onClick={() => updateStatus(p.id, 'active')}>Approve</button>
                    <button className="btn btn--ghost btn--xs" onClick={() => updateStatus(p.id, 'cancelled')}>Reject</button>
                  </div>
                )}
                {p.status === 'active' && (
                  <button className="btn btn--ghost btn--xs" onClick={() => updateStatus(p.id, 'expired')}>Expire</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
