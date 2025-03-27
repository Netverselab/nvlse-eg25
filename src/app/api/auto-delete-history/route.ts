import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const db = await connectDB();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    await db.execute(
      'DELETE FROM search_history WHERE created_at < ?',
      [fiveDaysAgo]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auto-delete error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}