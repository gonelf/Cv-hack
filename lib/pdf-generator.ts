import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

export async function generateResumePDF(
  resumeData: ResumeData,
  jobTitle?: string,
  companyName?: string
): Promise<Buffer> {
  try {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]); // US Letter size

    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const { width, height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;

    // Helper function to draw text
    const drawText = (
      text: string,
      x: number,
      y: number,
      fontSize: number,
      font: any,
      color = rgb(0, 0, 0)
    ) => {
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color,
      });
    };

    // Helper function to check if we need a new page
    const checkNewPage = () => {
      if (yPosition < 100) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - margin;
      }
    };

    // Helper function to draw wrapped text
    const drawWrappedText = (
      text: string,
      x: number,
      y: number,
      fontSize: number,
      font: any,
      maxWidth: number
    ): number => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth && line) {
          if (currentY < 100) {
            page = pdfDoc.addPage([612, 792]);
            currentY = height - margin;
          }
          drawText(line, x, currentY, fontSize, font);
          currentY -= fontSize + 4;
          line = word;
        } else {
          line = testLine;
        }
      }

      if (line) {
        if (currentY < 100) {
          page = pdfDoc.addPage([612, 792]);
          currentY = height - margin;
        }
        drawText(line, x, currentY, fontSize, font);
        currentY -= fontSize + 4;
      }

      return currentY;
    };

    // Add header with name
    const name = safeString(resumeData.name);
    if (name) {
      drawText(name, margin, yPosition, 24, boldFont);
      yPosition -= 32;
    }

    // Add contact information
    const email = safeString(resumeData.email);
    const phone = safeString(resumeData.phone);
    if (email || phone) {
      const contactParts = [];
      if (email) contactParts.push(email);
      if (phone) contactParts.push(phone);
      const contactInfo = contactParts.join(' | ');
      drawText(contactInfo, margin, yPosition, 10, regularFont);
      yPosition -= 16;
    }

    // Add job target if available
    if (jobTitle || companyName) {
      const target = `Tailored for: ${safeString(jobTitle) || 'Position'}${
        companyName ? ` at ${safeString(companyName)}` : ''
      }`;
      drawText(target, margin, yPosition, 11, italicFont);
      yPosition -= 18;
    }

    // Add horizontal line
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 20;

    // Add Professional Summary
    const summary = safeString(resumeData.summary);
    if (summary) {
      drawText('PROFESSIONAL SUMMARY', margin, yPosition, 14, boldFont);
      yPosition -= 20;
      yPosition = drawWrappedText(summary, margin, yPosition, 10, regularFont, width - 2 * margin);
      yPosition -= 12;
    }

    // Add Skills
    if (resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
      const validSkills = resumeData.skills.map((s) => safeString(s)).filter((s) => s.trim());
      if (validSkills.length > 0) {
        drawText('SKILLS', margin, yPosition, 14, boldFont);
        yPosition -= 20;
        const skillsText = validSkills.join(' • ');
        yPosition = drawWrappedText(skillsText, margin, yPosition, 10, regularFont, width - 2 * margin);
        yPosition -= 12;
      }
    }

    // Add Experience
    if (resumeData.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
      checkNewPage();
      drawText('PROFESSIONAL EXPERIENCE', margin, yPosition, 14, boldFont);
      yPosition -= 20;

      for (const exp of resumeData.experience) {
        const title = safeString(exp.title);
        const company = safeString(exp.company);
        const duration = safeString(exp.duration);
        const description = safeString(exp.description);

        if (!title && !company) continue;

        // Check if we need a new page
        checkNewPage();

        // Job title
        if (title) {
          drawText(title, margin, yPosition, 12, boldFont);

          // Duration (right-aligned)
          if (duration) {
            const durationWidth = boldFont.widthOfTextAtSize(duration, 10);
            drawText(duration, width - margin - durationWidth, yPosition, 10, regularFont);
          }
          yPosition -= 16;
        }

        // Company
        if (company) {
          drawText(company, margin, yPosition, 11, italicFont);
          yPosition -= 16;
        }

        // Description with bullets
        if (description) {
          const descriptionParts = description.split(/\n+/).filter((part) => part.trim());

          for (const part of descriptionParts) {
            const cleanPart = part.trim().replace(/^[•\-\*]\s*/, '');
            if (cleanPart) {
              checkNewPage();
              const bulletText = '• ' + cleanPart;
              yPosition = drawWrappedText(
                bulletText,
                margin + 10,
                yPosition,
                10,
                regularFont,
                width - 2 * margin - 10
              );
            }
          }
        }

        yPosition -= 12;
      }
    }

    // Add Education
    if (resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
      // Check if we need a new page
      checkNewPage();

      drawText('EDUCATION', margin, yPosition, 14, boldFont);
      yPosition -= 20;

      for (const edu of resumeData.education) {
        const degree = safeString(edu.degree);
        const institution = safeString(edu.institution);
        const year = safeString(edu.year);

        // If there's no degree but there's an institution, use institution as the title
        const displayTitle = degree || institution;
        if (!displayTitle) continue;

        checkNewPage();
        drawText(displayTitle, margin, yPosition, 11, boldFont);
        yPosition -= 14;

        // Only show institution line if it's not the title
        if (institution && institution !== displayTitle) {
          const parts = [];
          if (institution) parts.push(institution);
          if (year) parts.push(year);
          const eduInfo = parts.join(' - ');
          if (eduInfo.trim()) {
            drawText(eduInfo, margin, yPosition, 10, regularFont);
            yPosition -= 14;
          }
        } else if (year && !institution) {
          drawText(year, margin, yPosition, 10, regularFont);
          yPosition -= 14;
        }
      }
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return pdfBuffer;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw error;
  }
}
