import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const db = await connectDB();
    
    // First check if email exists in users table
    const [users]: any = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length > 0) {
      await db.end();
      return NextResponse.json({ exists: true });
    }

    // If not in users, check waitlist
    const [waitlist]: any = await db.execute(
      'SELECT * FROM waitlist WHERE email = ?',
      [email]
    );

    await db.end();

    if (waitlist.length > 0) {
      return NextResponse.json({ 
        exists: false, 
        status: 'in_waitlist',
        waitlistStatus: waitlist[0].status 
      });
    }

    return NextResponse.json({ exists: false, status: 'new_user' });
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}