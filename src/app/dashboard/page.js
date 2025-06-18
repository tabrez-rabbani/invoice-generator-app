'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/Layout';

// Lazy load chart components for better performance
const MonthlyInvoiceChart = lazy(() => import('../../components/charts/MonthlyInvoiceChart'));
const InvoiceStatusChart = lazy(() => import('../../components/charts/InvoiceStatusChart'));
const TopClientsChart = lazy(() => import('../../components/charts/TopClientsChart'));

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  });
  const [chartData, setChartData] = useState({
    counts: {},
    amounts: {},
    monthlyData: [],
    topClients: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch user subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session) return;

      try {
        setSubscriptionLoading(true);
        const response = await fetch('/api/user/subscription');
        
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else {
          // If no subscription found, user is on free plan
          setSubscription({
            plan: 'free',
            status: 'active',
            hasActiveSubscription: true
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Default to free plan on error
        setSubscription({
          plan: 'free',
          status: 'active',
          hasActiveSubscription: true
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [session, status]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session) return;

      try {
        setIsLoading(true);

        // Fetch dashboard stats from API
        const response = await fetch('/api/dashboard/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();

        // Update stats state
        setStats({
          total: data.counts.total || 0,
          paid: data.counts.paid || 0,
          pending: data.counts.pending || 0,
          overdue: data.counts.overdue || 0
        });

        // Update chart data state
        setChartData({
          counts: data.counts || {},
          amounts: data.amounts || {},
          monthlyData: data.monthlyData || [],
          topClients: data.topClients || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [session, status]);

  // Show loading state while checking authentication and subscription
  if (status === 'loading' || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will be redirected)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              {session ? `Welcome, ${session.user.name}` : 'Dashboard'}
            </h1>
            {subscription && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.plan === 'free' 
                  ? 'bg-gray-100 text-gray-700' 
                  : subscription.plan === 'pro'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
              </div>
            )}
          </div>

          {/* Subscription Status Banner */}
          {subscription && subscription.plan === 'free' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      You&apos;re on the Free Plan
                    </h3>
                    <p className="text-sm text-blue-700">
                      Upgrade to Pro for unlimited invoices and advanced features
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => router.push('/#pricing')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Create New Invoice Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Create Invoice</h2>
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Create a new invoice for your clients</p>
              {subscription && subscription.plan === 'free' && stats.total >= 5 ? (
                <div className="text-gray-400">
                  <p className="text-sm">Monthly limit reached</p>
                  <button
                    onClick={() => router.push('/#pricing')}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-1"
                  >
                    Upgrade to create more invoices
                  </button>
                </div>
              ) : (
                <Link href="/invoices/new" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                  Create New Invoice
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Recent Invoices Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Recent Invoices</h2>
                <div className="bg-green-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mb-4">View and manage your recent invoices</p>
              <Link href="/invoices" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View All Invoices
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Clients Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Clients</h2>
                <div className="bg-purple-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Manage your client information</p>
              <Link href="/clients" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View All Clients
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Stats</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                    {subscription && subscription.plan === 'free' && (
                      <span className="text-sm text-gray-500 ml-1">/ 5</span>
                    )}
                  </p>
                  {subscription && subscription.plan === 'free' && stats.total >= 5 && (
                    <p className="text-xs text-red-600 mt-1">Limit reached</p>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
              </div>
            )}
          </div>

          {/* Data Visualization Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Invoice Analytics</h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm h-80 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-64 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Monthly Trends Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Suspense fallback={
                    <div className="bg-white p-4 rounded-lg shadow-sm h-80 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-64 bg-gray-200 rounded w-full"></div>
                    </div>
                  }>
                    <MonthlyInvoiceChart monthlyData={chartData.monthlyData} />
                  </Suspense>

                  <Suspense fallback={
                    <div className="bg-white p-4 rounded-lg shadow-sm h-80 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-64 bg-gray-200 rounded w-full"></div>
                    </div>
                  }>
                    <InvoiceStatusChart counts={chartData.counts} />
                  </Suspense>
                </div>

                {/* Top Clients Chart */}
                <div className="grid grid-cols-1 gap-6">
                  <Suspense fallback={
                    <div className="bg-white p-4 rounded-lg shadow-sm h-80 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-64 bg-gray-200 rounded w-full"></div>
                    </div>
                  }>
                    <TopClientsChart topClients={chartData.topClients} />
                  </Suspense>
                </div>
              </>
            )}
          </div>

          {/* Financial Summary Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Financial Summary</h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(chartData.amounts?.total || 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(chartData.amounts?.paid || 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Outstanding Amount</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((chartData.amounts?.pending || 0) + (chartData.amounts?.overdue || 0))}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
