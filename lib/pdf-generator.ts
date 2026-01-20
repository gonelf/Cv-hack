import { jsPDF } from 'jspdf';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
}

export function generateResumePDF(resumeData: ResumeData, jobTitle?: string, companyName?: string): Buffer {
  console.log('Generating PDF with data:', JSON.stringify(resumeData, null, 2));

  // Helper to safely convert values to strings and handle nulls
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal', textMaxWidth?: number) => {
    const safeText = safeString(text);
    if (!safeText) return;
    const width = textMaxWidth !== undefined ? textMaxWidth : maxWidth;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(safeText, width);

    // lines is an array of strings
    for (let i = 0; i < lines.length; i++) {
      checkPageBreak(fontSize / 2 + 2);
      doc.text(safeString(lines[i]), margin, yPosition);
      yPosition += fontSize / 2 + 2;
    }
  };

  // Add header with name
  const name = safeString(resumeData.name);
  if (name) {
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(name, margin, yPosition);
    yPosition += 10;
  }

  // Add contact information
  const email = safeString(resumeData.email);
  const phone = safeString(resumeData.phone);
  if (email || phone) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactParts = [];
    if (email) contactParts.push(email);
    if (phone) contactParts.push(phone);
    const contactInfo = contactParts.join(' | ');
    if (contactInfo.trim()) {
      doc.text(contactInfo, margin, yPosition);
      yPosition += 8;
    }
  }

  // Add job target if available
  if (jobTitle || companyName) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    const target = `Tailored for: ${safeString(jobTitle) || 'Position'}${companyName ? ` at ${safeString(companyName)}` : ''}`;
    doc.text(target, margin, yPosition);
    yPosition += 8;
  }

  // Add horizontal line
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Add Professional Summary
  if (resumeData.summary) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL SUMMARY', margin, yPosition);
    yPosition += 7;

    addWrappedText(resumeData.summary, 10);
    yPosition += 5;
  }

  // Add Skills
  if (resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    const validSkills = resumeData.skills.map(s => safeString(s)).filter(s => s.trim());
    if (validSkills.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillsText = validSkills.join(' • ');
      const skillsLines = doc.splitTextToSize(skillsText, maxWidth);

      for (let i = 0; i < skillsLines.length; i++) {
        checkPageBreak(6);
        doc.text(safeString(skillsLines[i]), margin, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    }
  }

  // Add Experience
  if (resumeData.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', margin, yPosition);
    yPosition += 7;

    for (const exp of resumeData.experience) {
      const title = safeString(exp.title);
      const company = safeString(exp.company);
      const duration = safeString(exp.duration);
      const description = safeString(exp.description);

      if (!title && !company) continue;

      checkPageBreak(25);

      // Job title and duration
      if (title) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPosition);
      }

      // Duration (right-aligned)
      if (duration) {
        doc.setFont('helvetica', 'normal');
        const durationWidth = doc.getTextWidth(duration);
        doc.text(duration, pageWidth - margin - durationWidth, yPosition);
      }
      yPosition += 6;

      // Company
      if (company) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.text(company, margin, yPosition);
        yPosition += 6;
      }

      // Description with bullets
      if (description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Split description by newlines and bullets
        const descriptionParts = description.split(/\n+/).filter(part => part.trim());

        for (const part of descriptionParts) {
          const cleanPart = part.trim().replace(/^[•\-\*]\s*/, '');
          if (cleanPart) {
            const lines = doc.splitTextToSize('• ' + cleanPart, maxWidth - 5);
            for (let i = 0; i < lines.length; i++) {
              checkPageBreak(6);
              if (i === 0) {
                doc.text(safeString(lines[i]), margin + 5, yPosition);
              } else {
                doc.text(safeString(lines[i]), margin + 10, yPosition);
              }
              yPosition += 5;
            }
          }
        }
      }
      yPosition += 5;
    }
  }

  // Add Education
  if (resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', margin, yPosition);
    yPosition += 7;

    for (const edu of resumeData.education) {
      const degree = safeString(edu.degree);
      const institution = safeString(edu.institution);
      const year = safeString(edu.year);

      // If there's no degree but there's an institution, use institution as the title
      const displayTitle = degree || institution;
      if (!displayTitle) continue;

      checkPageBreak(15);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(displayTitle, margin, yPosition);
      yPosition += 6;

      // Only show institution line if it's not the title
      if (institution && institution !== displayTitle) {
        doc.setFont('helvetica', 'normal');
        const parts = [];
        if (institution) parts.push(institution);
        if (year) parts.push(year);
        const eduInfo = parts.join(' - ');
        if (eduInfo.trim()) {
          doc.text(eduInfo, margin, yPosition);
          yPosition += 6;
        }
      } else if (year && !institution) {
        // Just show year if we only have that
        doc.setFont('helvetica', 'normal');
        doc.text(year, margin, yPosition);
        yPosition += 6;
      }
    }
  }

  console.log('PDF generation complete');

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
