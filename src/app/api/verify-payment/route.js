import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createSubscription } from '../../../lib/subscription';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, userId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    // Check if payment was successful
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Get subscription details
    const subscriptionId = checkoutSession.subscription;
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!stripeSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 400 });
    }

    // Create subscription in our database
    const subscriptionData = {
      userId: userId,
      plan: checkoutSession.metadata.planId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(stripeSubscription.current_period_end * 1000),
      paymentId: checkoutSession.payment_intent,
      stripeSubscriptionId: subscriptionId,
      amount: stripeSubscription.items.data[0].price.unit_amount / 100, // Convert from cents
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
    };

    await createSubscription(subscriptionData);

    return NextResponse.json({ 
      success: true, 
      subscription: subscriptionData 
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 