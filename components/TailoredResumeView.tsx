'use client';

import { useState } from 'react';

interface TailoredResumeViewProps {
  application: any;
}

export default function TailoredResumeView({ application }: TailoredResumeViewProps) {
  const { gap_analysis, tailored_resume, job_title, company_name } = application;
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleDownload = () => {
    const resumeText = generateResumeText(tailored_resume);
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${job_title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/application/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Extract filename from Content-Disposition header or create a default one
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `resume-${job_title.replace(/\s+/g, '-').toLowerCase()}.pdf`;

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.message}`);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleCopy = () => {
    const resumeText = generateResumeText(tailored_resume);
    navigator.clipboard.writeText(resumeText);
    alert('Resume copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tailored Resume
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            Download TXT
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {downloadingPDF ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
          Application Details
        </h4>
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <span className="font-medium">Position:</span> {job_title}
        </p>
        {company_name && (
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <span className="font-medium">Company:</span> {company_name}
          </p>
        )}
      </div>

      {gap_analysis && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Gap Analysis
          </h4>

          {gap_analysis.missing_skills && gap_analysis.missing_skills.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Missing Skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {gap_analysis.missing_skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {gap_analysis.missing_keywords && gap_analysis.missing_keywords.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Important Keywords:
              </p>
              <div className="flex flex-wrap gap-2">
                {gap_analysis.missing_keywords.map((keyword: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {gap_analysis.suggestions && gap_analysis.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Suggestions:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {gap_analysis.suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="space-y-6">
          {tailored_resume.name && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {tailored_resume.name}
              </h2>
              {(tailored_resume.email || tailored_resume.phone) && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {tailored_resume.email} {tailored_resume.email && tailored_resume.phone && '•'} {tailored_resume.phone}
                </p>
              )}
            </div>
          )}

          {tailored_resume.summary && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Professional Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {tailored_resume.summary}
              </p>
            </div>
          )}

          {tailored_resume.skills && tailored_resume.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {tailored_resume.skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tailored_resume.experience && tailored_resume.experience.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Experience
              </h3>
              <div className="space-y-4">
                {tailored_resume.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {exp.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exp.company} • {exp.duration}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tailored_resume.education && tailored_resume.education.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Education
              </h3>
              <div className="space-y-2">
                {tailored_resume.education.map((edu: any, idx: number) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {edu.degree}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {edu.institution} • {edu.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateResumeText(resume: any): string {
  let text = '';

  if (resume.name) {
    text += `${resume.name}\n`;
    if (resume.email || resume.phone) {
      text += `${resume.email || ''} ${resume.email && resume.phone ? '• ' : ''}${resume.phone || ''}\n`;
    }
    text += '\n';
  }

  if (resume.summary) {
    text += `PROFESSIONAL SUMMARY\n${resume.summary}\n\n`;
  }

  if (resume.skills && resume.skills.length > 0) {
    text += `SKILLS\n${resume.skills.join(' • ')}\n\n`;
  }

  if (resume.experience && resume.experience.length > 0) {
    text += `EXPERIENCE\n`;
    resume.experience.forEach((exp: any) => {
      text += `\n${exp.title}\n`;
      text += `${exp.company} • ${exp.duration}\n`;
      text += `${exp.description}\n`;
    });
    text += '\n';
  }

  if (resume.education && resume.education.length > 0) {
    text += `EDUCATION\n`;
    resume.education.forEach((edu: any) => {
      text += `\n${edu.degree}\n`;
      text += `${edu.institution} • ${edu.year}\n`;
    });
  }

  return text;
}
