import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const db = await connectDB();
    
    const [rows]: any = await db.execute(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    await db.end();

    if (rows.length > 0) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}