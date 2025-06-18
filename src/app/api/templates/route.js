import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET handler for fetching all templates for a user
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
    
    // Get all templates for the user
    const templates = await db
      .collection('templates')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
      
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new template
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
    
    // Get request body
    const templateData = await request.json();
    
    // Validate required fields
    if (!templateData.name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Create a new template object with metadata
    const template = {
      ...templateData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the template
    const result = await db.collection('templates').insertOne(template);
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
