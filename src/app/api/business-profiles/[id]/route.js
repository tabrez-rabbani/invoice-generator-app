import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET handler for fetching a specific business profile
 */
export async function GET(request, { params }) {
  try {
    // Get the business profile ID from the URL
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
    
    // Get the business profile
    const businessProfile = await db
      .collection('businessProfiles')
      .findOne({ 
        _id: new ObjectId(id),
        userId 
      });
      
    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(businessProfile);
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a business profile
 */
export async function PUT(request, { params }) {
  try {
    // Get the business profile ID from the URL
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
    if (!updates.name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Check if the business profile exists and belongs to the user
    const existingProfile = await db
      .collection('businessProfiles')
      .findOne({ 
        _id: new ObjectId(id),
        userId 
      });
      
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }
    
    // Update the business profile
    const result = await db
      .collection('businessProfiles')
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
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }
    
    // Get the updated business profile
    const updatedProfile = await db
      .collection('businessProfiles')
      .findOne({ _id: new ObjectId(id), userId });
    
    return NextResponse.json({ 
      success: true,
      businessProfile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating business profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a business profile
 */
export async function DELETE(request, { params }) {
  try {
    // Get the business profile ID from the URL
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
    
    // Delete the business profile
    const result = await db
      .collection('businessProfiles')
      .deleteOne({ _id: new ObjectId(id), userId });
      
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting business profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
