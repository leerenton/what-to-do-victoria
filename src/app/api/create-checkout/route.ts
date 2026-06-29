import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const PRICE_IDS: Record<string, string | undefined> = {
  gold_annual:      process.env.STRIPE_PRICE_GOLD_ANNUAL,
  gold_monthly:     process.env.STRIPE_PRICE_GOLD_MONTHLY,
  promoter_annual:  process.env.STRIPE_PRICE_PROMOTER_ANNUAL,
  promoter_monthly: process.env.STRIPE_PRICE_PROMOTER_MONTHLY,
  boost:            process.env.STRIPE_PRICE_BOOST,
  spotlight:        process.env.STRIPE_PRICE_SPOTLIGHT,
  premier:          process.env.STRIPE_PRICE_PREMIER,
  event_boost:      process.env.STRIPE_PRICE_BOOST,
  event_spotlight:  process.env.STRIPE_PRICE_SPOTLIGHT,
  event_premier:    process.env.STRIPE_PRICE_PREMIER,
};

const SUBSCRIPTION_TYPES = new Set(['gold_annual', 'gold_monthly', 'promoter_annual', 'promoter_monthly']);

export async function POST(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.headers.get('origin') ?? 'https://whattodogeelong.com.au';

  // Verify auth
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const jwt = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { type, bizId, userId, itemType, itemId } = body;

  if (!type || !PRICE_IDS[type]) {
    return NextResponse.json({ error: `Unknown checkout type: ${type}` }, { status: 400 });
  }

  // Verify biz ownership if bizId provided
  if (bizId) {
    const { data: biz } = await supabase.from('businesses').select('id').eq('id', bizId).eq('owner_id', user.id).single();
    if (!biz) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const priceId = PRICE_IDS[type]!;
  const isSubscription = SUBSCRIPTION_TYPES.has(type);
  const successUrl = `${origin}/business-dashboard?success=1&type=${type}`;
  const cancelUrl = `${origin}/upgrade?cancelled=1`;

  const metadata: Record<string, string> = { type };
  if (bizId) metadata.biz_id = bizId;
  if (userId) metadata.user_id = userId;
  if (itemType) metadata.item_type = itemType;
  if (itemId) metadata.item_id = String(itemId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: isSubscription ? 'subscription' : 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    currency: 'aud',
    metadata,
    ...(isSubscription ? { subscription_data: { metadata } } : {}),
  });

  return NextResponse.json({ url: session.url });
}
