'use client';

import { useState, useEffect } from 'react';
import ResumeUpload from '@/components/ResumeUpload';
import JobDescriptionForm from '@/components/JobDescriptionForm';
import TailoredResumeView from '@/components/TailoredResumeView';
import Link from 'next/link';

export default function Home() {
  const [currentResume, setCurrentResume] = useState<any>(null);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load the latest resume
    fetch('/api/resume/latest')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentResume(data.resume);
        }
      })
      .catch(err => console.error('Error loading resume:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleUploadSuccess = (resume: any) => {
    setCurrentResume(resume);
    setCurrentApplication(null);
  };

  const handleTailorSuccess = (application: any) => {
    setCurrentApplication(application);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Resume Tailor
            </h1>
            <Link
              href="/history"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              View History
            </Link>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            Upload your resume and tailor it to any job description using AI
          </p>

          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              <p className="text-center text-gray-600 dark:text-gray-300">
                Loading...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                    Step 1: Upload Resume
                  </h2>
                  <ResumeUpload onUploadSuccess={handleUploadSuccess} />
                  {currentResume && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✓ Resume loaded: {currentResume.original_filename}
                      </p>
                      {currentResume.parsed_data?.name && (
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Parsed: {currentResume.parsed_data.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {currentResume && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                      Step 2: Enter Job Details
                    </h2>
                    <JobDescriptionForm
                      resumeId={currentResume.id}
                      onTailorSuccess={handleTailorSuccess}
                    />
                  </div>
                )}
              </div>

              <div>
                {currentApplication ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                    <TailoredResumeView application={currentApplication} />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                      Tailored Resume Preview
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your tailored resume will appear here after you submit a job description.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
