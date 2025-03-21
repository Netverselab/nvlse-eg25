import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  let db;
  try {
    const { email } = await request.json();
    db = await connectDB();
    
    // First check if email exists in users table
    const [users]: any = await db.execute(
      `SELECT * FROM ${process.env.DB_DATABASE}.users WHERE email = ?`,
      [email]
    );

    if (users.length > 0) {
      return NextResponse.json({ 
        error: 'Email already registered',
        status: 'registered' 
      });
    }

    // Check if email is already in waitlist
    const [existing]: any = await db.execute(
      `SELECT * FROM ${process.env.DB_DATABASE}.waitlist WHERE email = ?`,
      [email]
    );

    if (existing.length === 0) {
      // Add to waitlist if not present
      await db.execute(
        `INSERT INTO ${process.env.DB_DATABASE}.waitlist (email, status) VALUES (?, ?)`,
        [email, 'pending']
      );
    }

    const [waitlist]: any = await db.execute(
      `SELECT status FROM ${process.env.DB_DATABASE}.waitlist WHERE email = ?`,
      [email]
    );

    return NextResponse.json({ 
      status: waitlist[0].status 
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 400 });
  } finally {
    if (db) await db.end();
  }
}