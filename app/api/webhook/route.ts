import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
    environment: Environment.sandbox
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    const signature = (req.headers.get('paddle-signature') as string) || '';
    const rawRequestBody = await req.text();
    const secretKey = process.env.WEBHOOK_SECRET_KEY || '';

    try {
        if (signature && rawRequestBody) {
            const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);

            console.log('Received webhook event:', eventData.eventType);
            console.log(JSON.stringify(eventData));

            switch (eventData.eventType) {
                case EventName.SubscriptionActivated:
                    await handleSubscriptionActivated(eventData.data);
                    break;
                case EventName.SubscriptionCanceled:
                    await handleSubscriptionCanceled(eventData.data);
                    break;
                case EventName.TransactionPaid:
                    await handleTransactionPaid(eventData.data);
                    break;
                case EventName.SubscriptionUpdated:
                    await handleSubscriptionUpdated(eventData.data);
                    break;
                default:
                    console.log('Unhandled event type:', eventData.eventType);
            }
        } else {
            console.error('Signature missing in header');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

async function handleSubscriptionActivated(data: any) {
    const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: data.customData?.app_user_id,
            email: data.customData?.app_user_email,
            subscription_id: data.id,
            customer_id: data.customerId,
            status: data.status,
            currency: data.currencyCode,
            started_at: data.startedAt,
            first_billed_at: data.firstBilledAt,
            next_billed_at: data.nextBilledAt,
            canceled_at: data.canceledAt,
            paused_at: data.pausedAt,
            billing_interval: data.billingCycle.interval,
            billing_frequency: data.billingCycle.frequency,
            product_id: data.items[0].product.id,
            price_id: data.items[0].price.id,
            amount: data.items[0].price.unitPrice.amount,
            metadata: data.items,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

    if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
        throw subscriptionError;
    }
}

async function handleSubscriptionCanceled(data: any) {
    const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            canceled_at: data.canceledAt || new Date().toISOString(), 
            updated_at: new Date().toISOString()
        })
        .eq('subscription_id', data.id);

    if (subscriptionError) {
        console.error('Error canceling subscription:', subscriptionError);
        throw subscriptionError;
    }
}


async function handleSubscriptionUpdated(data: any) {
    const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
            status: data.status,
            current_period_end: data.current_billing_period.ends_at,
            cancel_at_period_end: data.cancel_at_period_end,
            updated_at: new Date().toISOString()
        })
        .eq('subscription_id', data.id);

    if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
        throw subscriptionError;
    }
}

async function handleTransactionPaid(data: any) {
    const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            user_id: data.customData?.app_user_id,
            email: data.customData?.app_user_email,
            transaction_id: data.id,
            customer_id: data.customerId,
            status: data.status,
            currency: data.currencyCode,
            amount: data.details.totals.total,
            payment_method: data.payments?.[0]?.methodDetails?.type || null,
            last4: data.payments?.[0]?.methodDetails?.card?.last4 || null,
            billed_at: data.billedAt,
            created_at: new Date().toISOString()
        });

    if (transactionError) {
        console.error('Error recording transaction:', transactionError);
        throw transactionError;
    }
}
