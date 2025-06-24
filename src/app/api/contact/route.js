import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

/**
 * POST handler for submitting contact requests
 * This endpoint doesn't require authentication
 */
export async function POST(request) {
  try {
    // Get request body
    const contactData = await request.json();
    
    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Create a new contact request
    const contactRequest = {
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      message: contactData.message,
      status: 'new',
      createdAt: new Date(),
      source: 'contact_page'
    };
    
    // Insert the contact request
    const result = await db.collection('contactRequests').insertOne(contactRequest);
    
    // In a real application, you might want to send an email notification here
    // For example, using a service like SendGrid, Mailgun, etc.
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Contact request submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting contact request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit contact request' },
      { status: 500 }
    );
  }
} 