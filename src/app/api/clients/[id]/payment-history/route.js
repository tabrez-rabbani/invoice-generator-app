import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET handler for fetching a client's payment history
export async function GET(request, { params }) {
  try {
    // Get the client ID from the URL - properly await params
    const { id } = await params;
    
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
    
    // Verify the client exists and belongs to the user
    const clientData = await db
      .collection('clients')
      .findOne({ 
        _id: new ObjectId(id),
        userId 
      });
      
    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Get all invoices for this client
    const invoices = await db
      .collection('invoices')
      .find({ 
        userId,
        clientId: id
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calculate payment statistics
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const totalPaid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const totalPending = invoices
      .filter(inv => inv.status === 'issued' || inv.status === 'pending')
      .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const totalOverdue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    
    // Calculate monthly payment data for the last 6 months
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
        invoiced: 0,
        paid: 0
      });
    }
    
    // Fill in the monthly data
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.issueDate || invoice.createdAt);
      const paymentDate = invoice.status === 'paid' && invoice.paidDate ? new Date(invoice.paidDate) : null;
      
      // Only consider invoices from the last 6 months
      if (invoiceDate >= sixMonthsAgo) {
        const monthName = invoiceDate.toLocaleString('default', { month: 'short' });
        const year = invoiceDate.getFullYear();
        const monthKey = `${monthName} ${year}`;
        
        const monthIndex = monthlyData.findIndex(m => m.month === monthKey);
        if (monthIndex !== -1) {
          const amount = parseFloat(invoice.total) || 0;
          monthlyData[monthIndex].invoiced += amount;
        }
      }
      
      // Add payment data if paid
      if (paymentDate && paymentDate >= sixMonthsAgo) {
        const monthName = paymentDate.toLocaleString('default', { month: 'short' });
        const year = paymentDate.getFullYear();
        const monthKey = `${monthName} ${year}`;
        
        const monthIndex = monthlyData.findIndex(m => m.month === monthKey);
        if (monthIndex !== -1) {
          const amount = parseFloat(invoice.total) || 0;
          monthlyData[monthIndex].paid += amount;
        }
      }
    });
    
    return NextResponse.json({
      clientId: id,
      clientName: clientData.name,
      stats: {
        totalInvoiced,
        totalPaid,
        totalPending,
        totalOverdue,
        invoiceCount: invoices.length
      },
      monthlyData,
      recentInvoices: invoices.slice(0, 5) // Return only the 5 most recent invoices
    });
  } catch (error) {
    console.error('Error fetching client payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client payment history' },
      { status: 500 }
    );
  }
}
