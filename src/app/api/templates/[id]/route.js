import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET handler for fetching a specific template
export async function GET(request, { params }) {
  try {
    // Get the template ID from the URL - properly await params
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
    
    // Get the template
    const template = await db
      .collection('templates')
      .findOne({ 
        _id: new ObjectId(id),
        userId 
      });
      
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a template
export async function PUT(request, { params }) {
  try {
    // Get the template ID from the URL - properly await params
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
        { error: 'Template name is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Update the template
    const result = await db
      .collection('templates')
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
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a template
export async function DELETE(request, { params }) {
  try {
    // Get the template ID from the URL - properly await params
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
    
    // Delete the template
    const result = await db
      .collection('templates')
      .deleteOne({ _id: new ObjectId(id), userId });
      
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
