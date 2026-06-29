import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { email, city = 'geelong' } = body;
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // Find user by email
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find(u => u.email === email);
  if (!user) return NextResponse.json({ ok: true }); // Silently succeed — user may not exist yet

  await supabase.from('user_city_subscriptions').upsert(
    { user_id: user.id, city, subscribed: true },
    { onConflict: 'user_id,city' }
  );

  return NextResponse.json({ ok: true });
}
