import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function POST() {
  try {
    await initDb();
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
