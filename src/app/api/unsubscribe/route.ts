import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const city = searchParams.get('city') ?? 'geelong';

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find(u => u.email === email);
  if (!user) return new NextResponse('You have been unsubscribed.', { headers: { 'Content-Type': 'text/plain' } });

  await supabase.from('user_city_subscriptions').upsert(
    { user_id: user.id, city, subscribed: false },
    { onConflict: 'user_id,city' }
  );

  return new NextResponse('You have been unsubscribed from weekly emails.', { headers: { 'Content-Type': 'text/plain' } });
}
