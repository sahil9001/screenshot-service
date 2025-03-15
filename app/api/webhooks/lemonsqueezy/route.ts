import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature || !verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);
    const { data } = event;

    switch (event.meta.event_name) {
      case 'subscription_created':
      case 'subscription_updated': {
        const subscription = data.attributes;
        const userId = subscription.custom_data.user_id;
        const endDate = new Date(subscription.ends_at || subscription.renews_at);

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          lemonsqueezy_subscription_id: subscription.id,
          status: subscription.status,
          plan_id: subscription.variant_id,
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case 'subscription_cancelled': {
        const subscription = data.attributes;
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .match({ lemonsqueezy_subscription_id: subscription.id });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}