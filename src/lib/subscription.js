import clientPromise from './mongodb';
import { PLANS } from './plans';

// Re-export PLANS for backward compatibility
export { PLANS };

// Get user subscription from database
export async function getUserSubscription(userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const subscription = await db.collection('subscriptions').findOne({
      userId: userId,
      status: 'active'
    });

    return subscription || {
      userId,
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      endDate: null,
      paymentId: null,
      amount: 0
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

// Create or update subscription
export async function createSubscription(subscriptionData) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // First, deactivate any existing subscriptions for this user
    await db.collection('subscriptions').updateMany(
      { userId: subscriptionData.userId },
      { $set: { status: 'cancelled' } }
    );

    // Create new subscription
    const result = await db.collection('subscriptions').insertOne({
      ...subscriptionData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return result;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// Check if user can perform action based on plan limits
export async function checkPlanLimits(userId, action, count = 1) {
  try {
    const subscription = await getUserSubscription(userId);
    const plan = PLANS[subscription.plan];
    
    if (!plan) return false;
    
    const limits = plan.limits;
    
    // If unlimited (-1), always allow
    if (limits[action] === -1) return true;
    
    // Check current usage against limits
    const client = await clientPromise;
    const db = client.db();
    
    let currentCount = 0;
    
    if (action === 'invoices') {
      // Count invoices for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      currentCount = await db.collection('invoices').countDocuments({
        userId: userId,
        createdAt: { $gte: startOfMonth }
      });
    } else if (action === 'clients') {
      currentCount = await db.collection('clients').countDocuments({
        userId: userId
      });
    }
    
    return (currentCount + count) <= limits[action];
  } catch (error) {
    console.error('Error checking plan limits:', error);
    return false;
  }
} 