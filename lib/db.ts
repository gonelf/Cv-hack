import { sql } from '@vercel/postgres';

export async function initDb() {
  // Create resumes table
  await sql`
    CREATE TABLE IF NOT EXISTS resumes (
      id SERIAL PRIMARY KEY,
      original_filename VARCHAR(255) NOT NULL,
      parsed_data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create applications table
  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
      job_title VARCHAR(255) NOT NULL,
      company_name VARCHAR(255),
      job_description TEXT NOT NULL,
      gap_analysis JSONB,
      tailored_resume JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create index for faster lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_applications_resume_id
    ON applications(resume_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_applications_created_at
    ON applications(created_at DESC)
  `;
}

export interface Resume {
  id: number;
  original_filename: string;
  parsed_data: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    experience?: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    skills?: string[];
    [key: string]: any;
  };
  created_at: Date;
  updated_at: Date;
}

export interface Application {
  id: number;
  resume_id: number;
  job_title: string;
  company_name?: string;
  job_description: string;
  gap_analysis?: {
    missing_skills?: string[];
    missing_keywords?: string[];
    suggestions?: string[];
  };
  tailored_resume: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    experience?: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    skills?: string[];
    [key: string]: any;
  };
  created_at: Date;
}
