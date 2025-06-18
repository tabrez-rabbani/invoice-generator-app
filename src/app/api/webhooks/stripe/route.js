import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import clientPromise from '../../../../lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        
        // Update subscription in database
        await db.collection('subscriptions').updateOne(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              status: subscription.status,
              endDate: new Date(subscription.current_period_end * 1000),
              trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
              updatedAt: new Date(),
            },
          }
        );
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        
        // Mark subscription as cancelled
        await db.collection('subscriptions').updateOne(
          { stripeSubscriptionId: deletedSubscription.id },
          {
            $set: {
              status: 'cancelled',
              updatedAt: new Date(),
            },
          }
        );
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        
        // Log successful payment
        console.log('Payment succeeded for subscription:', invoice.subscription);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        
        // Handle failed payment
        console.log('Payment failed for subscription:', failedInvoice.subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 