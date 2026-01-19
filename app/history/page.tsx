'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TailoredResumeView from '@/components/TailoredResumeView';

export default function HistoryPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setApplications(data.applications);
        }
      })
      .catch(err => console.error('Error loading applications:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Application History
            </h1>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              New Application
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              <p className="text-center text-gray-600 dark:text-gray-400">
                No applications yet. Create your first tailored resume!
              </p>
            </div>
          ) : selectedApplication ? (
            <div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                ← Back to List
              </button>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                <TailoredResumeView application={selectedApplication} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedApplication(app)}
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {app.job_title}
                  </h3>
                  {app.company_name && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {app.company_name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                    {new Date(app.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>

                  {app.gap_analysis?.missing_skills && app.gap_analysis.missing_skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Key Skills:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {app.gap_analysis.missing_skills.slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {app.gap_analysis.missing_skills.length > 3 && (
                          <span className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">
                            +{app.gap_analysis.missing_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(app);
                    }}
                  >
                    View Resume
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
