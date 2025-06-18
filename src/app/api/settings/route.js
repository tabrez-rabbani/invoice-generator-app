import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '../../../lib/mongodb';

/**
 * GET handler for fetching user settings
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
    
    // Get user settings
    const settings = await db
      .collection('userSettings')
      .findOne({ userId });
    
    // If no settings found, return default settings
    if (!settings) {
      return NextResponse.json({
        defaultCurrency: 'USD',
        defaultTaxRate: 0,
        defaultTaxName: '',
        pdfStyling: {
          primaryColor: '#3b82f6', // Blue
          secondaryColor: '#f3f4f6', // Light gray
          fontFamily: 'Helvetica',
          fontSize: 10,
          logoPosition: 'right',
          showBankDetails: true,
          showFooter: true,
          footerText: 'Thank you for your business!'
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for updating user settings
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
    const settingsData = await request.json();
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Update or create user settings
    const result = await db
      .collection('userSettings')
      .updateOne(
        { userId },
        { 
          $set: {
            ...settingsData,
            updatedAt: new Date()
          },
          $setOnInsert: {
            userId,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    
    return NextResponse.json({ 
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
