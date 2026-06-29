'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ApprovalsClient({ articles: initial }: { articles: any[] }) {
  const [articles, setArticles] = useState(initial);
  const supabase = createClient();

  async function approve(id: string) {
    await supabase.from('articles').update({ approved: true }).eq('id', id);
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  async function reject(id: string) {
    await supabase.from('articles').delete().eq('id', id);
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  if (articles.length === 0) return <p className="admin-empty">No pending approvals. 🎉</p>;

  return (
    <div className="approvals-list">
      {articles.map(a => (
        <div key={a.id} className="approval-card">
          <div className="approval-card__info">
            <p className="approval-card__title">{a.title}</p>
            <p className="approval-card__meta">{a.type} · {a.author ?? 'Unknown'} · {a.created_at?.split('T')[0]}</p>
            {a.excerpt && <p className="approval-card__excerpt">{a.excerpt}</p>}
          </div>
          <div className="approval-card__actions">
            <button className="btn btn--primary btn--sm" onClick={() => approve(a.id)}>Approve</button>
            <button className="btn btn--ghost btn--sm" onClick={() => reject(a.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
