import Groq from 'groq-sdk';

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

/**
 * Safely parse JSON from LLM response, handling markdown code blocks and formatting
 */
function parseJSONSafely(content: string): any {
  if (!content || content.trim() === '') {
    return {};
  }

  let cleanedContent = content.trim();

  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, '');
  cleanedContent = cleanedContent.replace(/\s*```\s*$/, '');

  // Trim whitespace again after removing code blocks
  cleanedContent = cleanedContent.trim();

  // Try to find JSON object boundaries if there's extra text
  const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanedContent = jsonMatch[0];
  }

  try {
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Content that failed to parse:', cleanedContent.substring(0, 500));
    throw new Error(`Failed to parse LLM response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function parseResumeWithLLM(resumeText: string) {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a resume parsing assistant. Extract structured information from resumes.
Return a JSON object with the following structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "summary": "professional summary or objective",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start Date - End Date",
      "description": "Job description and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Graduation Year"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}

Extract ALL job positions and experiences from the resume, not just the most recent ones. If a field is missing, omit it or use null.`
      },
      {
        role: 'user',
        content: `Parse this resume and return structured JSON:\n\n${resumeText}`
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return parseJSONSafely(content);
}

export async function extractJobDetails(jobOfferText: string) {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a job offer parsing assistant. Extract structured information from job postings, job offers, or job descriptions.
Return a JSON object with the following structure:
{
  "jobTitle": "The job position title",
  "companyName": "The company name (if mentioned)",
  "jobDescription": "The full job description including responsibilities, requirements, qualifications, and any other relevant details"
}

Guidelines:
- Extract the job title from common sections like "Position:", "Role:", "Job Title:", or from the beginning of the text
- Extract the company name if it's mentioned anywhere in the text
- For jobDescription, include ALL the details: responsibilities, requirements, qualifications, benefits, etc.
- If company name is not found, set it to an empty string
- Be thorough in extracting the complete job description`
      },
      {
        role: 'user',
        content: `Extract the job details from this text:\n\n${jobOfferText}`
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    max_tokens: 2048,
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return parseJSONSafely(content);
}

export async function analyzeJobAndTailorResume(
  resumeData: any,
  jobDescription: string
) {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are an expert resume tailoring assistant specializing in optimizing resumes for specific job opportunities. Your task is to transform a candidate's resume to maximize their appeal for a target position.

CRITICAL INSTRUCTIONS FOR EXPERIENCE REWRITING:

1. DEEPLY ANALYZE the job description to extract:
   - Required technical skills and tools
   - Key responsibilities and expectations
   - Desired qualifications and experience levels
   - Industry-specific keywords and terminology
   - Soft skills and cultural fit indicators

2. STRATEGICALLY REWRITE each job experience by:
   - Leading with accomplishments that directly align with the target role
   - Using action verbs that match the job description's language
   - Quantifying achievements with metrics when possible (%, $, time saved, etc.)
   - Incorporating job-specific keywords naturally throughout descriptions
   - Emphasizing transferable skills relevant to the target position
   - Reordering bullet points to prioritize most relevant achievements first
   - Drawing parallels between past roles and target role responsibilities

3. ENHANCE THE PROFESSIONAL SUMMARY by:
   - Opening with a headline that mirrors the target job title or key requirement
   - Highlighting 3-4 most relevant qualifications from the job description
   - Incorporating industry keywords and specific technologies mentioned
   - Demonstrating cultural and role alignment

4. OPTIMIZE SKILLS SECTION by:
   - Prioritizing skills explicitly mentioned in the job description
   - Grouping related skills together (e.g., "Frontend: React, TypeScript, Next.js")
   - Adding closely related skills the candidate likely has based on their experience
   - Removing or deprioritizing irrelevant skills

5. MAINTAIN TRUTHFULNESS:
   - Never fabricate experiences, companies, or achievements
   - Only suggest skills the candidate could reasonably possess given their background
   - Reframe existing experiences, don't invent new ones
   - Be honest in gap analysis about missing qualifications

Return a JSON object with this structure:
{
  "gap_analysis": {
    "missing_skills": ["List specific skills mentioned in job description but not in resume"],
    "missing_keywords": ["Important keywords/phrases from job description absent in resume"],
    "suggestions": ["Actionable recommendations for addressing gaps or further improvements"]
  },
  "tailored_resume": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "summary": "Compelling 3-4 sentence summary that positions candidate as ideal fit, incorporating job keywords and highlighting most relevant qualifications",
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "duration": "Start Date - End Date",
        "description": "Bullet-pointed achievements rewritten to emphasize relevance to target role. Use \\n• for bullets. Each bullet should: start with strong action verb, incorporate job keywords naturally, quantify impact when possible, and directly relate to target role requirements."
      }
    ],
    "education": [
      {
        "degree": "Degree Name",
        "institution": "Institution Name",
        "year": "Graduation Year"
      }
    ],
    "skills": ["Prioritized array of skills with most relevant to job description first, grouped logically"]
  }
}`
      },
      {
        role: 'user',
        content: `Original Resume:
${JSON.stringify(resumeData, null, 2)}

Target Job Description:
${jobDescription}

Please analyze this job opportunity thoroughly and create a highly tailored resume that repositions this candidate as the ideal fit. Focus especially on rewriting job experiences to emphasize relevant achievements and incorporate job-specific language.`
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return parseJSONSafely(content);
}
