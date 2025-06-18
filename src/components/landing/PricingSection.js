'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PricingSection() {
  const { data: session } = useSession();
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for freelancers and small projects",
      features: [
        "5 invoices per month",
        "3 clients",
        "Basic PDF export",
        "Email support",
        "Standard templates"
      ],
      cta: "Start Free",
      popular: false,
      planId: "free"
    },
    {
      name: "Pro",
      price: "$12",
      description: "Best for growing businesses",
      features: [
        "Unlimited invoices",
        "Unlimited clients",
        "Custom branding",
        "Priority support",
        "Advanced analytics",
        "Payment tracking",
        "Multiple currencies"
      ],
      cta: "Start Free Trial",
      popular: true,
      planId: "pro"
    },
    {
      name: "Enterprise",
      price: "$39",
      description: "For teams and large businesses",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "API access",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "Advanced reporting"
      ],
      cta: "Contact Sales",
      popular: false,
      planId: "enterprise"
    }
  ];

  const handlePlanSelect = (plan) => {
    if (plan.planId === 'free') {
      // Free plan - direct signup and go to dashboard
      if (session) {
        router.push('/dashboard');
      } else {
        signIn('google', { callbackUrl: '/dashboard' });
      }
    } else if (plan.planId === 'enterprise') {
      // Enterprise - contact sales (for now just redirect to support)
      if (session) {
        router.push('/support');
      } else {
        signIn('google', { callbackUrl: '/support' });
      }
    } else {
      // Pro plan - go to checkout
      if (session) {
        router.push(`/checkout?plan=${plan.planId}`);
      } else {
        signIn('google', { callbackUrl: `/checkout?plan=${plan.planId}` });
      }
    }
  };

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. Start free, upgrade when you grow.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl shadow-lg ${
                  plan.popular
                    ? 'border-2 border-blue-500 bg-white'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== "$0" && <span className="text-gray-600">/month</span>}
                  </div>

                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`mt-8 w-full py-3 px-6 rounded-lg text-base font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Have questions about our pricing?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
} 