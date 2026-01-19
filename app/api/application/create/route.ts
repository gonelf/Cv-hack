import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { analyzeJobAndTailorResume } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeId, jobTitle, companyName, jobDescription } = body;

    if (!resumeId || !jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the resume
    const resumeResult = await sql`
      SELECT id, parsed_data
      FROM resumes
      WHERE id = ${resumeId}
    `;

    if (resumeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    const resume = resumeResult.rows[0];

    // Analyze job and tailor resume
    const analysis = await analyzeJobAndTailorResume(
      resume.parsed_data,
      jobDescription
    );

    // Save application to database
    const result = await sql`
      INSERT INTO applications (
        resume_id,
        job_title,
        company_name,
        job_description,
        gap_analysis,
        tailored_resume
      )
      VALUES (
        ${resumeId},
        ${jobTitle},
        ${companyName || null},
        ${jobDescription},
        ${JSON.stringify(analysis.gap_analysis || {})},
        ${JSON.stringify(analysis.tailored_resume)}
      )
      RETURNING id, resume_id, job_title, company_name, job_description,
                gap_analysis, tailored_resume, created_at
    `;

    return NextResponse.json({
      success: true,
      application: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create application' },
      { status: 500 }
    );
  }
}
