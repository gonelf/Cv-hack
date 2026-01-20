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
    if (!text) return;
    const width = textMaxWidth !== undefined ? textMaxWidth : maxWidth;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(String(text), width);

    // lines is an array of strings
    for (let i = 0; i < lines.length; i++) {
      checkPageBreak(fontSize / 2 + 2);
      doc.text(String(lines[i]), margin, yPosition);
      yPosition += fontSize / 2 + 2;
    }
  };

  // Add header with name
  if (resumeData.name) {
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(String(resumeData.name), margin, yPosition);
    yPosition += 10;
  }

  // Add contact information
  if (resumeData.email || resumeData.phone) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactParts = [];
    if (resumeData.email) contactParts.push(String(resumeData.email));
    if (resumeData.phone) contactParts.push(String(resumeData.phone));
    const contactInfo = contactParts.join(' | ');
    doc.text(contactInfo, margin, yPosition);
    yPosition += 8;
  }

  // Add job target if available
  if (jobTitle || companyName) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    const target = `Tailored for: ${jobTitle || 'Position'}${companyName ? ` at ${companyName}` : ''}`;
    doc.text(String(target), margin, yPosition);
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
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILLS', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const skillsText = resumeData.skills.map(s => String(s)).join(' • ');
    const skillsLines = doc.splitTextToSize(skillsText, maxWidth);

    for (let i = 0; i < skillsLines.length; i++) {
      checkPageBreak(6);
      doc.text(String(skillsLines[i]), margin, yPosition);
      yPosition += 5;
    }
    yPosition += 5;
  }

  // Add Experience
  if (resumeData.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', margin, yPosition);
    yPosition += 7;

    for (const exp of resumeData.experience) {
      if (!exp.title && !exp.company) continue;

      checkPageBreak(25);

      // Job title and duration
      if (exp.title) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(String(exp.title), margin, yPosition);
      }

      // Duration (right-aligned)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal');
        const durationStr = String(exp.duration);
        const durationWidth = doc.getTextWidth(durationStr);
        doc.text(durationStr, pageWidth - margin - durationWidth, yPosition);
      }
      yPosition += 6;

      // Company
      if (exp.company) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.text(String(exp.company), margin, yPosition);
        yPosition += 6;
      }

      // Description with bullets
      if (exp.description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Split description by newlines and bullets
        const descriptionParts = String(exp.description).split(/\n+/).filter(part => part.trim());

        for (const part of descriptionParts) {
          const cleanPart = part.trim().replace(/^[•\-\*]\s*/, '');
          if (cleanPart) {
            const lines = doc.splitTextToSize('• ' + cleanPart, maxWidth - 5);
            for (let i = 0; i < lines.length; i++) {
              checkPageBreak(6);
              if (i === 0) {
                doc.text(String(lines[i]), margin + 5, yPosition);
              } else {
                doc.text(String(lines[i]), margin + 10, yPosition);
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
      if (!edu.degree) continue;

      checkPageBreak(15);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(String(edu.degree), margin, yPosition);
      yPosition += 6;

      if (edu.institution || edu.year) {
        doc.setFont('helvetica', 'normal');
        const eduInfo = `${edu.institution || ''} ${edu.institution && edu.year ? '-' : ''} ${edu.year || ''}`.trim();
        doc.text(eduInfo, margin, yPosition);
        yPosition += 6;
      }
    }
  }

  console.log('PDF generation complete');

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
