import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureDbInitialized } from '@/lib/db';

export async function GET() {
  try {
    // Ensure database is initialized
    await ensureDbInitialized();

    const result = await sql`
      SELECT id, original_filename, parsed_data, created_at
      FROM resumes
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No resume found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}
