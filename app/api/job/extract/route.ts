import { NextRequest, NextResponse } from 'next/server';
import { extractJobDetails } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobOfferText } = body;

    if (!jobOfferText || jobOfferText.trim() === '') {
      return NextResponse.json(
        { error: 'Job offer text is required' },
        { status: 400 }
      );
    }

    // Extract job details using LLM
    const extractedDetails = await extractJobDetails(jobOfferText);

    return NextResponse.json({
      success: true,
      data: extractedDetails
    });
  } catch (error: any) {
    console.error('Error extracting job details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract job details' },
      { status: 500 }
    );
  }
}
