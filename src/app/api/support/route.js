import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '../../../lib/mongodb';

/**
 * POST handler for submitting support requests
 */
export async function POST(request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to submit a support request' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get request body
    const supportData = await request.json();
    
    // Validate required fields
    if (!supportData.name || !supportData.email || !supportData.subject || !supportData.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Create a new support request
    const supportRequest = {
      userId,
      name: supportData.name,
      email: supportData.email,
      subject: supportData.subject,
      message: supportData.message,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the support request
    const result = await db.collection('supportRequests').insertOne(supportRequest);
    
    // In a real application, you might want to send an email notification here
    // For example, using a service like SendGrid, Mailgun, etc.
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Support request submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting support request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit support request' },
      { status: 500 }
    );
  }
}
