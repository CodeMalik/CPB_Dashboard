import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Visitor from '../../../../models/Visitor';

export async function GET() {
  try {
    await connectDB();
    
    const totalVisitors = await Visitor.countDocuments();
    const withEmail = await Visitor.countDocuments({ email: { $ne: null } });
    const cookiesAccepted = await Visitor.countDocuments({ cookiesAccepted: true });

    return NextResponse.json({
      total: totalVisitors,
      withEmail: withEmail,
      cookiesAccepted: cookiesAccepted
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}