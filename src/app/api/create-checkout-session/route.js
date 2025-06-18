import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PLANS } from '../../../lib/plans';
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
    const { planId, userId, userEmail } = body;

    // Validate plan
    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = PLANS[planId];

    // Don't create checkout for free plan
    if (plan.price === 0) {
      return NextResponse.json({ error: 'Free plan does not require payment' }, { status: 400 });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} Plan`,
              description: `Invoice Generator ${plan.name} Subscription`,
            },
            unit_amount: plan.price * 100, // Stripe uses cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout?plan=${planId}`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        planId: planId,
      },
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          userId: userId,
          planId: planId,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 