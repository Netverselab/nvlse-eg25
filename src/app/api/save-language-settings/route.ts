import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { language, autoTranslate } = await request.json();
    
    // Here you would typically save to a database
    // For now, we'll just return success
    
    return NextResponse.json({ 
      success: true,
      message: 'Language settings saved successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save language settings' },
      { status: 500 }
    );
  }
}