import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET handler for fetching a specific client
export async function GET(request, { params }) {
  try {
    // Get the client ID from the URL
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
    
    // Get the client
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
    
    // Get invoices for this client
    const invoices = await db
      .collection('invoices')
      .find({ 
        userId,
        clientId: id
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      ...clientData,
      invoices
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a client
export async function PUT(request, { params }) {
  try {
    // Get the client ID from the URL
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
    const updates = await request.json();
    
    // Validate required fields
    if (updates.name === '') {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Update the client
    const result = await db
      .collection('clients')
      .updateOne(
        { _id: new ObjectId(id), userId },
        { 
          $set: { 
            ...updates,
            updatedAt: new Date()
          } 
        }
      );
      
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a client
export async function DELETE(request, { params }) {
  try {
    // Get the client ID from the URL
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
    
    // Delete the client
    const result = await db
      .collection('clients')
      .deleteOne({ _id: new ObjectId(id), userId });
      
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
