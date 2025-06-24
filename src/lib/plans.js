// Subscription plans configuration (shared between client and server)
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '5 invoices per month',
      '3 clients',
      'Basic PDF export',
      'Email support',
      'Standard templates'
    ],
    limits: {
      invoices: 5,
      clients: 3
    }
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    priceId: 'price_pro', // Will be replaced with actual Stripe price ID
    features: [
      '100 invoices per month',
      '50 clients',
      'Custom branding',
      'Priority support',
      'Basic analytics',
      'Payment tracking',
      'Multiple currencies'
    ],
    limits: {
      invoices: 100,
      clients: 50
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 29.99,
    priceId: 'price_enterprise', // Will be replaced with actual Stripe price ID
    features: [
      'Unlimited invoices',
      'Unlimited clients',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'Advanced reporting'
    ],
    limits: {
      invoices: -1, // Unlimited
      clients: -1   // Unlimited
    }
  }
}; 