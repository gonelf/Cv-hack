'use client';

import { useState } from 'react';

interface JobDescriptionFormProps {
  resumeId: number;
  onTailorSuccess: (application: any) => void;
}

export default function JobDescriptionForm({
  resumeId,
  onTailorSuccess,
}: JobDescriptionFormProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTailoring(true);
    setError(null);

    try {
      const response = await fetch('/api/application/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          jobTitle,
          companyName,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to tailor resume');
      }

      onTailorSuccess(data.application);

      // Reset form
      setJobTitle('');
      setCompanyName('');
      setJobDescription('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTailoring(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="jobTitle"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Job Title *
        </label>
        <input
          type="text"
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Senior Software Engineer"
        />
      </div>

      <div>
        <label
          htmlFor="companyName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Company Name
        </label>
        <input
          type="text"
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Tech Corp"
        />
      </div>

      <div>
        <label
          htmlFor="jobDescription"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Job Description *
        </label>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          required
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Paste the full job description here..."
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={tailoring}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {tailoring ? 'Tailoring Resume...' : 'Tailor Resume'}
      </button>
    </form>
  );
}
