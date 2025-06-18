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
    price: 12,
    priceId: 'price_pro', // Will be replaced with actual Stripe price ID
    features: [
      'Unlimited invoices',
      'Unlimited clients',
      'Custom branding',
      'Priority support',
      'Advanced analytics',
      'Payment tracking',
      'Multiple currencies'
    ],
    limits: {
      invoices: -1, // Unlimited
      clients: -1   // Unlimited
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 39,
    priceId: 'price_enterprise', // Will be replaced with actual Stripe price ID
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'Advanced reporting'
    ],
    limits: {
      invoices: -1, // Unlimited
      clients: -1   // Unlimited
    }
  }
}; 