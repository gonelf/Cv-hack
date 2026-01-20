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
    const width = textMaxWidth !== undefined ? textMaxWidth : maxWidth;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(text, width);

    for (const line of lines) {
      checkPageBreak(fontSize / 2 + 2);
      doc.text(line, margin, yPosition);
      yPosition += fontSize / 2 + 2;
    }
  };

  // Add header with name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.name, margin, yPosition);
  yPosition += 10;

  // Add contact information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const contactInfo = `${resumeData.email} | ${resumeData.phone}`;
  doc.text(contactInfo, margin, yPosition);
  yPosition += 8;

  // Add job target if available
  if (jobTitle || companyName) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    const target = `Tailored for: ${jobTitle || 'Position'}${companyName ? ` at ${companyName}` : ''}`;
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
  if (resumeData.skills && resumeData.skills.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILLS', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const skillsText = resumeData.skills.join(' • ');
    const skillsLines = doc.splitTextToSize(skillsText, maxWidth);

    for (const line of skillsLines) {
      checkPageBreak(6);
      doc.text(line, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 5;
  }

  // Add Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', margin, yPosition);
    yPosition += 7;

    for (const exp of resumeData.experience) {
      checkPageBreak(25);

      // Job title and duration
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title, margin, yPosition);

      // Duration (right-aligned)
      doc.setFont('helvetica', 'normal');
      const durationWidth = doc.getTextWidth(exp.duration);
      doc.text(exp.duration, pageWidth - margin - durationWidth, yPosition);
      yPosition += 6;

      // Company
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text(exp.company, margin, yPosition);
      yPosition += 6;

      // Description with bullets
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Split description by newlines and bullets
      const descriptionParts = exp.description.split(/\n+/).filter(part => part.trim());

      for (const part of descriptionParts) {
        const cleanPart = part.trim().replace(/^[•\-\*]\s*/, '');
        if (cleanPart) {
          const lines = doc.splitTextToSize('• ' + cleanPart, maxWidth - 5);
          for (let i = 0; i < lines.length; i++) {
            checkPageBreak(6);
            if (i === 0) {
              doc.text(lines[i], margin + 5, yPosition);
            } else {
              doc.text(lines[i], margin + 10, yPosition);
            }
            yPosition += 5;
          }
        }
      }
      yPosition += 5;
    }
  }

  // Add Education
  if (resumeData.education && resumeData.education.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', margin, yPosition);
    yPosition += 7;

    for (const edu of resumeData.education) {
      checkPageBreak(15);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, margin, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.institution} - ${edu.year}`, margin, yPosition);
      yPosition += 6;
    }
  }

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
