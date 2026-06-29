import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const RESEND_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') ?? new URL(request.url).searchParams.get('secret');
  if (secret !== CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Find free-plan businesses with an owner that haven't been nudged recently
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, city, owner_id')
    .eq('plan', 'free')
    .eq('is_gold', false)
    .not('owner_id', 'is', null)
    .limit(50);

  if (!businesses?.length) return NextResponse.json({ ok: true, sent: 0 });

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let sent = 0;

  for (const biz of businesses) {
    const user = users?.find(u => u.id === biz.owner_id);
    if (!user?.email) continue;

    const { data: site } = await supabase.from('sites').select('domain, name').eq('slug', biz.city).single();
    const domain = site?.domain ?? 'whattodogeelong.com.au';
    const cityName = site?.name ?? 'Geelong';

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `What To Do <hello@${domain}>`,
        to: user.email,
        subject: `${biz.name} — unlock more with Gold`,
        html: `<p>Hi,</p><p>Your listing <strong>${biz.name}</strong> is live on What To Do ${cityName}. Upgrade to Gold to get homepage placement, direct enquiries, and a spot in our weekly email.</p><p><a href="https://${domain}/upgrade">Upgrade to Gold →</a></p>`,
      }),
    });
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
