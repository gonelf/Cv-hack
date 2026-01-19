import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function parseResumeWithLLM(resumeText: string) {
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

Extract all information available. If a field is missing, omit it or use null.`
      },
      {
        role: 'user',
        content: `Parse this resume and return structured JSON:\n\n${resumeText}`
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    max_tokens: 2048,
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

export async function analyzeJobAndTailorResume(
  resumeData: any,
  jobDescription: string
) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are an expert resume tailoring assistant. Your job is to:
1. Analyze the job description to identify required skills, keywords, and qualifications
2. Compare the candidate's resume with the job requirements
3. Identify gaps and missing elements
4. Generate an optimized, tailored resume that:
   - Highlights relevant experience and skills
   - Incorporates job-specific keywords for ATS optimization
   - Reframes existing experience to match job requirements
   - Adds suggested skills/experiences that could be developed or emphasized
   - Maintains truthfulness while optimizing presentation

Return a JSON object with this structure:
{
  "gap_analysis": {
    "missing_skills": ["skill1", "skill2"],
    "missing_keywords": ["keyword1", "keyword2"],
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "tailored_resume": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "summary": "Tailored professional summary highlighting relevant experience for this role",
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "duration": "Start Date - End Date",
        "description": "Reframed description emphasizing relevant achievements and using job keywords"
      }
    ],
    "education": [...],
    "skills": ["Prioritized and expanded skills list matching job requirements"]
  }
}`
      },
      {
        role: 'user',
        content: `Original Resume:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription}

Analyze the job requirements and create a tailored resume that optimizes for this specific position while maintaining accuracy.`
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}
