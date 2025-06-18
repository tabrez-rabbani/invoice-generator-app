import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET handler for fetching a specific invoice
export async function GET(request, { params }) {
  try {
    // Get the invoice ID from the URL - properly await params
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
    
    // Get the invoice
    const invoice = await db
      .collection('invoices')
      .findOne({ 
        _id: new ObjectId(id),
        userId 
      });
      
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PATCH handler for updating invoice status
export async function PATCH(request, { params }) {
  try {
    // Get the invoice ID from the URL - properly await params
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
    
    // Get request body
    const { status } = await request.json();
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Update the invoice
    const result = await db
      .collection('invoices')
      .updateOne(
        { _id: new ObjectId(id), userId },
        { 
          $set: { 
            status,
            updatedAt: new Date()
          } 
        }
      );
      
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting an invoice
export async function DELETE(request, { params }) {
  try {
    // Get the invoice ID from the URL - properly await params
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
    
    // Delete the invoice
    const result = await db
      .collection('invoices')
      .deleteOne({ _id: new ObjectId(id), userId });
      
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
