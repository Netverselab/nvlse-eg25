import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { enabled, days } = await request.json();
    const db = await connectDB();

    if (enabled) {
      // Delete history older than specified days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));

      await db.execute(
        'DELETE FROM search_history WHERE created_at < ?',
        [daysAgo]
      );
    }

    await db.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auto-delete error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}