import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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

// Helper to safely convert values to strings and handle nulls
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export function generateResumePDF(resumeData: ResumeData, jobTitle?: string, companyName?: string): Promise<Buffer> {
  console.log('Generating PDF with PDFKit, data:', JSON.stringify(resumeData, null, 2));

  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('PDFKit generation complete, buffer size:', pdfBuffer.length);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Helper function to add text with wrapping
      const addText = (text: string, options: any = {}) => {
        const safeText = safeString(text);
        if (!safeText) return;
        doc.text(safeText, options);
      };

      // Add header with name
      const name = safeString(resumeData.name);
      if (name) {
        doc.fontSize(24).font('Helvetica-Bold').text(name, { align: 'left' });
        doc.moveDown(0.5);
      }

      // Add contact information
      const email = safeString(resumeData.email);
      const phone = safeString(resumeData.phone);
      if (email || phone) {
        const contactParts = [];
        if (email) contactParts.push(email);
        if (phone) contactParts.push(phone);
        const contactInfo = contactParts.join(' | ');
        doc.fontSize(10).font('Helvetica').text(contactInfo);
        doc.moveDown(0.3);
      }

      // Add job target if available
      if (jobTitle || companyName) {
        const target = `Tailored for: ${safeString(jobTitle) || 'Position'}${companyName ? ` at ${safeString(companyName)}` : ''}`;
        doc.fontSize(11).font('Helvetica-Oblique').text(target);
        doc.moveDown(0.5);
      }

      // Add horizontal line
      doc.moveTo(50, doc.y)
         .lineTo(562, doc.y)
         .stroke();
      doc.moveDown();

      // Add Professional Summary
      const summary = safeString(resumeData.summary);
      if (summary) {
        doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(summary, { align: 'left' });
        doc.moveDown();
      }

      // Add Skills
      if (resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
        const validSkills = resumeData.skills.map(s => safeString(s)).filter(s => s.trim());
        if (validSkills.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('SKILLS');
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica').text(validSkills.join(' • '), { align: 'left' });
          doc.moveDown();
        }
      }

      // Add Experience
      if (resumeData.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL EXPERIENCE');
        doc.moveDown(0.5);

        for (const exp of resumeData.experience) {
          const title = safeString(exp.title);
          const company = safeString(exp.company);
          const duration = safeString(exp.duration);
          const description = safeString(exp.description);

          if (!title && !company) continue;

          // Job title and duration on same line
          if (title) {
            doc.fontSize(12).font('Helvetica-Bold');
            const titleWidth = doc.widthOfString(title);
            doc.text(title, { continued: false });

            // Duration (right-aligned)
            if (duration) {
              const currentY = doc.y - 12; // Go back up to align with title
              doc.text(duration, 562 - doc.widthOfString(duration), currentY);
            }
          }

          // Company
          if (company) {
            doc.fontSize(11).font('Helvetica-Oblique').text(company);
          }

          // Description with bullets
          if (description) {
            doc.fontSize(10).font('Helvetica');
            doc.moveDown(0.3);

            // Split description by newlines and bullets
            const descriptionParts = description.split(/\n+/).filter(part => part.trim());

            for (const part of descriptionParts) {
              const cleanPart = part.trim().replace(/^[•\-\*]\s*/, '');
              if (cleanPart) {
                doc.text('• ' + cleanPart, { indent: 20, width: 462 });
              }
            }
          }

          doc.moveDown();
        }
      }

      // Add Education
      if (resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('EDUCATION');
        doc.moveDown(0.5);

        for (const edu of resumeData.education) {
          const degree = safeString(edu.degree);
          const institution = safeString(edu.institution);
          const year = safeString(edu.year);

          // If there's no degree but there's an institution, use institution as the title
          const displayTitle = degree || institution;
          if (!displayTitle) continue;

          doc.fontSize(11).font('Helvetica-Bold').text(displayTitle);

          // Only show institution line if it's not the title
          if (institution && institution !== displayTitle) {
            const parts = [];
            if (institution) parts.push(institution);
            if (year) parts.push(year);
            const eduInfo = parts.join(' - ');
            if (eduInfo.trim()) {
              doc.fontSize(10).font('Helvetica').text(eduInfo);
            }
          } else if (year && !institution) {
            doc.fontSize(10).font('Helvetica').text(year);
          }

          doc.moveDown(0.5);
        }
      }

      // Finalize the PDF
      doc.end();

    } catch (error) {
      console.error('Error in PDF generation:', error);
      reject(error);
    }
  });
}
