'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  itemId: string;
  itemType: string;
  title: string;
}

export default function SaveButton({ itemId, itemType, title }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const { data } = await supabase
        .from('saved_items')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('item_id', itemId)
        .single();
      setSaved(!!data);
      setLoading(false);
    }
    check();
  }, [itemId]);

  async function toggle() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/login'; return; }
    setLoading(true);
    if (saved) {
      await supabase.from('saved_items').delete().eq('user_id', session.user.id).eq('item_id', itemId);
      setSaved(false);
    } else {
      await supabase.from('saved_items').insert({ user_id: session.user.id, item_id: itemId, item_type: itemType, title });
      setSaved(true);
    }
    setLoading(false);
  }

  if (loading) return null;

  return (
    <button className={`save-btn ${saved ? 'save-btn--saved' : ''}`} onClick={toggle} aria-label={saved ? 'Remove from saved' : 'Save'}>
      <span className="material-symbols-rounded">{saved ? 'bookmark' : 'bookmark_border'}</span>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
