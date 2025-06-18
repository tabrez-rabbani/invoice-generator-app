'use client';

import { signIn } from 'next-auth/react';

export default function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to Transform Your Invoicing?
        </h2>
        <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
          Join thousands of businesses who have streamlined their billing process with InvoiceGen. 
          Start your free trial today - no credit card required.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => signIn('google')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Free Trial
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Schedule Demo
          </button>
        </div>
        
        <div className="mt-6 text-blue-100 text-sm">
          ✓ 14-day free trial • ✓ No setup fees • ✓ Cancel anytime
        </div>
      </div>
    </section>
  );
} 