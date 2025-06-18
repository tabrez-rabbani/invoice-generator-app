import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '../../../lib/mongodb';
import { checkPlanLimits } from '../../../lib/subscription';

// GET handler for fetching all clients for a user
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
    
    // Get all clients for the user
    const clients = await db
      .collection('clients')
      .find({ userId })
      .sort({ name: 1 })
      .toArray();
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new client
export async function POST(request) {
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
    
    // Check plan limits before creating client
    const canCreateClient = await checkPlanLimits(userId, 'clients', 1);
    
    if (!canCreateClient) {
      return NextResponse.json(
        { 
          error: 'Client limit reached', 
          message: 'You have reached your monthly client limit. Please upgrade your plan to add more clients.',
          code: 'LIMIT_REACHED'
        },
        { status: 403 }
      );
    }
    
    // Get request body
    const clientData = await request.json();
    
    // Validate required fields
    if (!clientData.name) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Create a new client object with metadata
    const newClient = {
      ...clientData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the client
    const result = await db.collection('clients').insertOne(newClient);
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      client: newClient
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
