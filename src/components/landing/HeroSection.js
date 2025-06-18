'use client';

import { signIn } from 'next-auth/react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-4xl">
              Create Professional 
              <span className="text-blue-600"> Invoices</span> in Minutes
            </h1>
            <p className="mt-4 text-lg text-gray-600 sm:mt-6">
              Streamline your billing process with our powerful invoice generator. 
              Create, send, and track invoices effortlessly.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => signIn('google')}
                  className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                </button>
                <button className="w-full sm:w-auto border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-sm text-gray-500 sm:text-center lg:text-left">
              <p>✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime</p>
            </div>
          </div>

          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              {/* Invoice Preview Mockup */}
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded"></div>
                    <div className="ml-2">
                      <div className="w-20 h-3 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-3 bg-gray-300 rounded mb-1"></div>
                    <div className="w-12 h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="w-12 h-2 bg-gray-400 rounded mb-2"></div>
                      <div className="w-24 h-2 bg-gray-200 rounded mb-1"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded mb-1"></div>
                      <div className="w-16 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div>
                      <div className="w-12 h-2 bg-gray-400 rounded mb-2"></div>
                      <div className="w-24 h-2 bg-gray-200 rounded mb-1"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded mb-1"></div>
                      <div className="w-16 h-2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <div className="w-32 h-2 bg-gray-300 rounded"></div>
                      <div className="w-16 h-2 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-28 h-2 bg-gray-300 rounded"></div>
                      <div className="w-16 h-2 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <div className="w-16 h-3 bg-gray-600 rounded"></div>
                      <div className="w-20 h-3 bg-blue-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 