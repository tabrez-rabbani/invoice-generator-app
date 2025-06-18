import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { checkPlanLimits } from '../../../lib/subscription';

// GET handler for fetching all invoices for a user
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
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new invoice
export async function POST(request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated (this should already be checked by the middleware)
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to access this endpoint' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check plan limits before creating invoice
    const canCreateInvoice = await checkPlanLimits(userId, 'invoices', 1);
    
    if (!canCreateInvoice) {
      return NextResponse.json(
        { 
          error: 'Invoice limit reached', 
          message: 'You have reached your monthly invoice limit. Please upgrade your plan to create more invoices.',
          code: 'LIMIT_REACHED'
        },
        { status: 403 }
      );
    }

    // Get request body
    const invoiceData = await request.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Create a new invoice object with metadata
    const invoice = {
      ...invoiceData,
      userId,
      status: 'issued', // Default status
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the invoice
    const result = await db.collection('invoices').insertOne(invoice);

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
