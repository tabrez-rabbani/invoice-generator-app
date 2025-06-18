'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PLANS } from '../../lib/plans';

function CheckoutPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const planId = searchParams.get('plan');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Get selected plan
    if (planId && PLANS[planId]) {
      setSelectedPlan(PLANS[planId]);
    } else {
      router.push('/');
    }
  }, [session, status, planId, router]);

  const handlePayment = async () => {
    if (!selectedPlan || !session) return;

    setLoading(true);
    setError('');

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || !selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white text-center">
            Complete Your Purchase
          </h1>
        </div>

        {/* Plan Details */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name} Plan</h2>
            <div className="mt-2">
              <span className="text-4xl font-bold text-blue-600">${selectedPlan.price}</span>
              <span className="text-gray-600">/month</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s included:</h3>
            <ul className="space-y-2">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Billing to:</h3>
            <p className="text-gray-700">{session.user.name}</p>
            <p className="text-gray-600">{session.user.email}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay $${selectedPlan.price}/month`
            )}
          </button>

          {/* Trial Info */}
          <p className="text-center text-sm text-gray-600 mt-4">
            7-day free trial • Cancel anytime • Secure payment with Stripe
          </p>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
} 