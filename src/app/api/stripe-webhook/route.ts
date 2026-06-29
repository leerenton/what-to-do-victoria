import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PACKAGE_DAYS: Record<string, number> = { boost: 7, spotlight: 14, premier: 30 };
const PROMO_TYPES = new Set(['boost', 'spotlight', 'premier', 'event_boost', 'event_spotlight', 'event_premier']);

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const type = meta.type ?? '';
  const bizId = meta.biz_id;
  const userId = meta.user_id;
  const itemType = meta.item_type ?? (meta.event_id ? 'event' : null);
  const itemId = meta.item_id ?? meta.event_id;

  if (type === 'gold_annual' || type === 'gold_monthly') {
    if (!bizId) return;
    const expiresAt = new Date();
    if (type === 'gold_annual') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setMonth(expiresAt.getMonth() + 1);
    const credits = type === 'gold_annual' ? 14 : 1;

    await supabase.from('businesses').update({
      is_gold: true,
      gold_expires_at: expiresAt.toISOString(),
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      credit_balance: credits,
    }).eq('id', bizId);

    await supabase.from('credit_ledger').insert({
      business_id: bizId,
      amount: credits,
      reason: type === 'gold_annual' ? 'gold_annual_signup' : 'gold_monthly_signup',
      ref_id: session.id,
    });
  }

  const baseType = type.replace('event_', '');
  if (PROMO_TYPES.has(type) && bizId) {
    const days = PACKAGE_DAYS[baseType] ?? 7;
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + days);

    let bizCity = 'geelong';
    const { data: biz } = await supabase.from('businesses').select('city').eq('id', bizId).single();
    if (biz?.city) bizCity = biz.city;

    await supabase.from('promotions').insert({
      business_id: bizId,
      city: bizCity,
      item_type: itemType ?? 'event',
      item_id: String(itemId ?? ''),
      package: baseType,
      status: 'pending',
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      paid_amount: session.amount_total ?? 0,
      credits_used: 0,
      stripe_session_id: session.id,
    });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription || invoice.billing_reason !== 'subscription_cycle') return;
  const { data: rows } = await supabase.from('businesses').select('id, credit_balance').eq('stripe_subscription_id', invoice.subscription as string);
  if (!rows?.length) return;
  const biz = rows[0];
  const newBalance = (biz.credit_balance ?? 0) + 1;
  await supabase.from('businesses').update({ credit_balance: newBalance }).eq('id', biz.id);
  await supabase.from('credit_ledger').insert({ business_id: biz.id, amount: 1, reason: 'gold_monthly_renew', ref_id: invoice.id });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const bizId = subscription.metadata?.biz_id;
  if (bizId) {
    await supabase.from('businesses').update({ is_gold: false, gold_expires_at: null, stripe_subscription_id: null }).eq('id', bizId);
  } else {
    const { data: rows } = await supabase.from('businesses').select('id').eq('stripe_subscription_id', subscription.id);
    if (rows?.[0]) {
      await supabase.from('businesses').update({ is_gold: false, gold_expires_at: null, stripe_subscription_id: null }).eq('id', rows[0].id);
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
