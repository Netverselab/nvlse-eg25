import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'your_database_name', // Make sure this matches your Hostinger database name
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function POST(req: NextRequest) {
  if (!process.env.DB_HOST) {
    return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
  }

  try {
    const data = await req.json();
    const { searchQuery } = data;
    
    if (!searchQuery) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const remoteAddr = req.headers.get('remote-addr');
    
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 
               realIP ? realIP :
               remoteAddr ? remoteAddr :
               req.ip || 'unknown';

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const deviceId = Buffer.from(`${ip}-${userAgent}`).toString('base64');

    const connection = await pool.getConnection();
    
    try {
      await connection.execute(
        'INSERT INTO search_history (ip_address, device_id, search_query, user_agent) VALUES (?, ?, ?, ?)',
        [ip, deviceId, searchQuery, userAgent]
      );
      
      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!process.env.DB_HOST) {
    return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
  }

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const deviceId = Buffer.from(`${ip}-${userAgent}`).toString('base64');

    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT search_query, search_time FROM search_history WHERE ip_address = ? AND device_id = ? ORDER BY search_time DESC LIMIT 100',
        [ip, deviceId]
      );
      
      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}