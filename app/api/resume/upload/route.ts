import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import pdf from 'pdf-parse';
import { parseResumeWithLLM } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    const pdfData = await pdf(buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    // Parse resume with LLM
    const parsedData = await parseResumeWithLLM(resumeText);

    // Save to database
    const result = await sql`
      INSERT INTO resumes (original_filename, parsed_data)
      VALUES (${file.name}, ${JSON.stringify(parsedData)})
      RETURNING id, original_filename, parsed_data, created_at
    `;

    return NextResponse.json({
      success: true,
      resume: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process resume' },
      { status: 500 }
    );
  }
}
