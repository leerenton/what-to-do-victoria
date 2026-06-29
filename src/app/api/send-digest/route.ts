import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const RESEND_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

// Only callable by Vercel cron or with CRON_SECRET
function isAuthorized(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') ?? new URL(request.url).searchParams.get('secret');
  return secret === CRON_SECRET;
}

async function sendResend(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'What To Do <hello@whattodogeelong.com.au>', to, subject, html }),
  });
  return res.ok;
}

function buildDigestHtml(events: any[], cityName: string, siteUrl: string, email: string) {
  const eventRows = events.map(e => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
        <a href="${siteUrl}/events/${e.id}" style="font-weight:600;color:#1a1a2e;text-decoration:none;">${e.title}</a><br/>
        <span style="color:#64748b;font-size:.85rem;">${e.date ?? ''}${e.location ? ` · ${e.location}` : ''}${e.price ? ` · ${e.price}` : ''}</span>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#f5f5f0;margin:0;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:#1a1a2e;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:1.4rem;">What's On in ${cityName}</h1>
      </div>
      <div style="padding:24px;">
        <p style="color:#475569;">Here's what's happening this week in ${cityName}.</p>
        <table style="width:100%;border-collapse:collapse;">${eventRows}</table>
        <div style="margin-top:24px;text-align:center;">
          <a href="${siteUrl}/events" style="background:#0d9488;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">See All Events →</a>
        </div>
      </div>
      <div style="padding:16px;text-align:center;color:#94a3b8;font-size:.75rem;">
        <a href="${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#94a3b8;">Unsubscribe</a>
      </div>
    </div>
  </body></html>`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get all active sites
  const { data: sites } = await supabase.from('sites').select('slug, name, domain').eq('active', true);

  let totalSent = 0;

  for (const site of (sites ?? [])) {
    const siteUrl = `https://${site.domain}`;
    const now = new Date().toISOString().split('T')[0];

    // Get upcoming events for this city
    const { data: events } = await supabase
      .from('events')
      .select('id, title, date, location, price, category')
      .eq('city', site.slug)
      .gte('date', now)
      .order('date')
      .limit(8);

    if (!events?.length) continue;

    // Get subscribers for this city
    const { data: subs } = await supabase
      .from('user_city_subscriptions')
      .select('user_id')
      .eq('city', site.slug)
      .eq('subscribed', true);

    if (!subs?.length) continue;

    // Get emails for those users
    const userIds = subs.map(s => s.user_id);
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emails = users?.filter(u => userIds.includes(u.id) && u.email).map(u => u.email!) ?? [];

    for (const email of emails) {
      const html = buildDigestHtml(events, site.name, siteUrl, email);
      const ok = await sendResend(email, `What's on in ${site.name} this week`, html);
      if (ok) totalSent++;
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent });
}
