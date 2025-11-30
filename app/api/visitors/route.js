import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import Visitor from '../../../models/Visitor';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    
    console.log('API: Fetching visitors with country:', country);
    
    // Build query
    let query = {};
    if (country && country !== 'all') {
      query.country = country;
    }

    // Get visitors from database
    const visitors = await Visitor.find(query)
      .sort({ visitedAt: -1 })
      .limit(1000);

    console.log('API: Found', visitors.length, 'visitors');
    
    return NextResponse.json({
      success: true,
      visitors: visitors,
      total: visitors.length
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}