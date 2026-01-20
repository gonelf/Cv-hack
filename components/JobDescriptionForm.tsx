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
  const [jobOfferText, setJobOfferText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!jobOfferText.trim()) {
      setError('Please paste the job offer text');
      return;
    }

    setExtracting(true);
    setError(null);

    try {
      const response = await fetch('/api/job/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobOfferText,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract job details');
      }

      // Set the extracted data
      setJobTitle(result.data.jobTitle || '');
      setCompanyName(result.data.companyName || '');
      setJobDescription(result.data.jobDescription || '');
      setExtracted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  };

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
      setJobOfferText('');
      setJobTitle('');
      setCompanyName('');
      setJobDescription('');
      setExtracted(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTailoring(false);
    }
  };

  const handleReset = () => {
    setExtracted(false);
    setJobTitle('');
    setCompanyName('');
    setJobDescription('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!extracted ? (
        <>
          <div>
            <label
              htmlFor="jobOfferText"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Paste Job Offer Details *
            </label>
            <textarea
              id="jobOfferText"
              value={jobOfferText}
              onChange={(e) => setJobOfferText(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
              placeholder="Paste the entire job offer or job posting here. Include the job title, company name, description, requirements, and any other details..."
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The AI will automatically extract the job title, company name, and description from your text.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleExtract}
            disabled={extracting || !jobOfferText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {extracting ? 'Extracting Details...' : 'Extract Job Details'}
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-600 dark:text-green-400">
              Job details extracted successfully! Review and edit if needed.
            </p>
          </div>

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
              placeholder="Job description with requirements and responsibilities..."
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={tailoring}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Over
            </button>
            <button
              type="submit"
              disabled={tailoring}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tailoring ? 'Tailoring Resume...' : 'Tailor Resume'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
