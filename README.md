# AI Resume Tailor

An intelligent resume tailoring application that uses AI to optimize your resume for specific job applications. Upload your resume, paste a job description, and get an ATS-optimized, tailored resume in seconds.

## Features

- **PDF Resume Upload**: Upload your resume in PDF format
- **AI-Powered Parsing**: Automatically extract structured information from your resume using Groq's Llama 3.3 70B model
- **Job Description Analysis**: Analyze job postings to identify required skills and keywords
- **Gap Analysis**: Identify missing skills and keywords compared to job requirements
- **Intelligent Resume Tailoring**: Generate optimized resumes that highlight relevant experience and incorporate job-specific keywords
- **ATS Optimization**: Ensure your resume passes Applicant Tracking Systems
- **Application History**: Save and view all your tailored resumes
- **Download & Copy**: Easy export of tailored resumes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **AI/LLM**: Groq (Free Llama 3.3 70B model)
- **PDF Parsing**: pdf-parse
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account
- A Groq API key (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Cv-hack
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Get a free Groq API key from [https://console.groq.com](https://console.groq.com)
   - Add your Groq API key to `.env.local`

```bash
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY
```

4. Set up Vercel Postgres:
   - Create a new project on Vercel
   - Add Postgres storage to your project
   - Vercel will automatically set the database environment variables

5. Initialize the database:
   - After deploying to Vercel or setting up local Postgres
   - Make a POST request to `/api/db/init` to create tables

```bash
curl -X POST http://localhost:3000/api/db/init
# Or in production:
curl -X POST https://your-app.vercel.app/api/db/init
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

1. Push your code to GitHub

2. Import your repository in Vercel

3. Add environment variables in Vercel project settings:
   - `GROQ_API_KEY`: Your Groq API key

4. Add Vercel Postgres to your project:
   - Go to Storage tab in Vercel dashboard
   - Create a new Postgres database
   - Vercel will automatically add all required database environment variables

5. Deploy the project

6. After deployment, initialize the database:
```bash
curl -X POST https://your-app.vercel.app/api/db/init
```

## Usage

1. **Upload Your Resume**: Click to upload or drag-and-drop your PDF resume
2. **Wait for Parsing**: The AI will automatically extract information from your resume
3. **Enter Job Details**: Fill in the job title, company name, and paste the full job description
4. **Generate Tailored Resume**: Click "Tailor Resume" to generate an optimized version
5. **Review Gap Analysis**: See what skills and keywords you might be missing
6. **Download or Copy**: Export your tailored resume for your application
7. **View History**: Access all your past applications from the History page

## How It Works

1. **PDF Parsing**: When you upload a resume, the app extracts text from the PDF
2. **Resume Structuring**: Groq's Llama model parses the text into structured data (name, experience, skills, etc.)
3. **Job Analysis**: When you submit a job description, the AI analyzes requirements and keywords
4. **Gap Detection**: The system identifies missing skills and keywords
5. **Resume Optimization**: The AI rewrites your resume to:
   - Highlight relevant experience
   - Incorporate job-specific keywords
   - Optimize for ATS systems
   - Maintain truthfulness while improving presentation
6. **Storage**: All resumes and applications are saved in Vercel Postgres for future reference

## API Routes

- `POST /api/resume/upload` - Upload and parse a PDF resume
- `GET /api/resume/latest` - Get the most recently uploaded resume
- `POST /api/application/create` - Create a tailored resume for a job
- `GET /api/applications` - Get all saved applications
- `POST /api/db/init` - Initialize database tables

## Database Schema

### Resumes Table
- `id`: Serial primary key
- `original_filename`: Original PDF filename
- `parsed_data`: JSONB with structured resume data
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Applications Table
- `id`: Serial primary key
- `resume_id`: Foreign key to resumes
- `job_title`: Job title
- `company_name`: Company name (optional)
- `job_description`: Full job description
- `gap_analysis`: JSONB with missing skills, keywords, and suggestions
- `tailored_resume`: JSONB with optimized resume data
- `created_at`: Timestamp

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key for LLM access | Yes |
| `POSTGRES_URL` | Postgres connection URL | Yes (auto-set by Vercel) |
| `POSTGRES_PRISMA_URL` | Postgres Prisma URL | Yes (auto-set by Vercel) |

## Free Tier Limits

- **Groq**: 30 requests/minute, generous free tier
- **Vercel**: Free hobby plan includes hosting and serverless functions
- **Vercel Postgres**: Free tier includes 256 MB storage, 60 hours compute time/month

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
