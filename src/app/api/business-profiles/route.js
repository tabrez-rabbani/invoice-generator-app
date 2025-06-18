import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '../../../lib/mongodb';

/**
 * GET handler for fetching all business profiles for a user
 */
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
    
    // Get all business profiles for the user
    const businessProfiles = await db
      .collection('businessProfiles')
      .find({ userId })
      .sort({ name: 1 })
      .toArray();
    
    return NextResponse.json(businessProfiles);
  } catch (error) {
    console.error('Error fetching business profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business profiles' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new business profile
 */
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
    const profileData = await request.json();
    
    // Validate required fields
    if (!profileData.name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Create a new business profile object with metadata
    const businessProfile = {
      ...profileData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the business profile
    const result = await db.collection('businessProfiles').insertOne(businessProfile);
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      businessProfile
    });
  } catch (error) {
    console.error('Error creating business profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
