import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const jwt = authHeader?.slice(7);
  if (!jwt) return NextResponse.redirect(new URL('/login', request.url));

  const { data: { user } } = await supabase.auth.getUser(jwt);
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const { data: biz } = await supabase.from('businesses').select('stripe_customer_id').eq('owner_id', user.id).not('stripe_customer_id', 'is', null).single();
  if (!biz?.stripe_customer_id) return NextResponse.redirect(new URL('/business-dashboard', request.url));

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whattodogeelong.com.au';
  const session = await stripe.billingPortal.sessions.create({
    customer: biz.stripe_customer_id,
    return_url: `${origin}/business-dashboard`,
  });

  return NextResponse.redirect(session.url);
}
