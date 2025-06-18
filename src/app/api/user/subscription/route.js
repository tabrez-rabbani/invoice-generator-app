import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getUserSubscription } from '../../../../lib/subscription';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user subscription
    const subscription = await getUserSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Return subscription details
    return NextResponse.json({
      plan: subscription.plan || 'free',
      status: subscription.status || 'active',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      trialEnd: subscription.trialEnd,
      hasActiveSubscription: subscription.status === 'active'
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 