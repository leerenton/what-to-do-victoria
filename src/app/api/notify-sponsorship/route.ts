import { NextRequest, NextResponse } from 'next/server';

const RESEND_KEY = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { name, email, business, message, city = 'geelong' } = body;
  if (!name || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'What To Do <hello@whattodogeelong.com.au>',
      to: 'lee.renton81@gmail.com',
      subject: `New sponsorship enquiry — ${business ?? name}`,
      html: `<p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}<br/><strong>Business:</strong> ${business ?? 'N/A'}<br/><strong>City:</strong> ${city}</p><p>${message ?? ''}</p>`,
    }),
  });

  return NextResponse.json({ ok: true });
}
