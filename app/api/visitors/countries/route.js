import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Visitor from '../../../../models/Visitor';

export async function GET() {
  try {
    await connectDB();
    
    // Get distinct countries from visitors collection
    const countries = await Visitor.distinct('country', { 
      country: { $ne: 'Unknown', $exists: true } 
    });
    
    return NextResponse.json({
      countries: countries.sort()
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}