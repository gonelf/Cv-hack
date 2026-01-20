import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateResumePDF } from '@/lib/pdf-generator';
import { ensureDbInitialized } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();

    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Fetch the application data
    const result = await sql`
      SELECT
        id,
        job_title,
        company_name,
        tailored_resume
      FROM applications
      WHERE id = ${applicationId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const application = result.rows[0];
    const tailoredResume = application.tailored_resume;

    // Validate resume data
    if (!tailoredResume || !tailoredResume.name) {
      return NextResponse.json(
        { error: 'Invalid resume data - tailored resume is missing or incomplete' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateResumePDF(
      tailoredResume,
      application.job_title,
      application.company_name
    );

    // Create filename - sanitize but keep spaces, then properly encode
    const sanitizeName = (str: string) => str.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').substring(0, 50);
    const cleanName = sanitizeName(tailoredResume.name);
    const cleanJobTitle = sanitizeName(application.job_title || 'Resume');
    const fileName = `${cleanName}_${cleanJobTitle}.pdf`;

    // Properly encode filename for Content-Disposition header (RFC 5987)
    const encodedFileName = encodeURIComponent(fileName);

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as downloadable file with proper RFC 5987 encoding
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
