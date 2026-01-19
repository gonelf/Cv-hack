import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT
        a.id,
        a.resume_id,
        a.job_title,
        a.company_name,
        a.job_description,
        a.gap_analysis,
        a.tailored_resume,
        a.created_at,
        r.original_filename
      FROM applications a
      LEFT JOIN resumes r ON a.resume_id = r.id
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      applications: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
