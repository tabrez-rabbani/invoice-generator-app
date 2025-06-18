import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import clientPromise from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to access this endpoint' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Get all invoices for the user
    const invoices = await db
      .collection('invoices')
      .find({ userId })
      .toArray();
      
    // Calculate basic stats
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'issued' || inv.status === 'pending').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const cancelledInvoices = invoices.filter(inv => inv.status === 'cancelled').length;
    
    // Calculate total amounts
    const totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'issued' || inv.status === 'pending')
      .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    
    // Calculate monthly data for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    
    // Initialize monthly data
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      
      const monthName = month.toLocaleString('default', { month: 'short' });
      const year = month.getFullYear();
      const monthKey = `${monthName} ${year}`;
      
      monthlyData.push({
        month: monthKey,
        paid: 0,
        pending: 0,
        overdue: 0,
        total: 0
      });
    }
    
    // Fill in the monthly data
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.issueDate || invoice.createdAt);
      
      // Only consider invoices from the last 6 months
      if (invoiceDate >= sixMonthsAgo) {
        const monthName = invoiceDate.toLocaleString('default', { month: 'short' });
        const year = invoiceDate.getFullYear();
        const monthKey = `${monthName} ${year}`;
        
        const monthIndex = monthlyData.findIndex(m => m.month === monthKey);
        if (monthIndex !== -1) {
          const amount = parseFloat(invoice.total) || 0;
          monthlyData[monthIndex].total += amount;
          
          if (invoice.status === 'paid') {
            monthlyData[monthIndex].paid += amount;
          } else if (invoice.status === 'issued' || invoice.status === 'pending') {
            monthlyData[monthIndex].pending += amount;
          } else if (invoice.status === 'overdue') {
            monthlyData[monthIndex].overdue += amount;
          }
        }
      }
    });
    
    // Get top clients by invoice amount
    const clientsMap = {};
    invoices.forEach(invoice => {
      if (invoice.toDetails) {
        const clientName = invoice.toDetails.split('\n')[0] || 'Unknown Client';
        if (!clientsMap[clientName]) {
          clientsMap[clientName] = 0;
        }
        clientsMap[clientName] += parseFloat(invoice.total) || 0;
      }
    });
    
    const topClients = Object.entries(clientsMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return NextResponse.json({
      counts: {
        total: totalInvoices,
        paid: paidInvoices,
        pending: pendingInvoices,
        overdue: overdueInvoices,
        cancelled: cancelledInvoices
      },
      amounts: {
        total: totalAmount,
        paid: paidAmount,
        pending: pendingAmount,
        overdue: overdueAmount
      },
      monthlyData,
      topClients
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
