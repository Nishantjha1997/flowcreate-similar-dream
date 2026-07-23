import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import type { ResumeData } from '@/utils/types';

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportResumeDocx(resume: ResumeData, filename: string) {
  const sections: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: resume.personal.name || 'Resume', bold: true })] }),
    new Paragraph([resume.personal.email, resume.personal.phone, resume.personal.linkedin, resume.personal.website].filter(Boolean).join(' · ')),
  ];
  if (resume.personal.summary) sections.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: 'Professional Summary' }), new Paragraph(resume.personal.summary));
  if (resume.experience.length) {
    sections.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: 'Experience' }));
    resume.experience.forEach((item) => {
      sections.push(new Paragraph({ children: [new TextRun({ text: `${item.title} — ${item.company}`, bold: true })] }), new Paragraph(`${item.startDate} – ${item.current ? 'Present' : item.endDate}`), new Paragraph(item.description));
    });
  }
  if (resume.education.length) {
    sections.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: 'Education' }));
    resume.education.forEach((item) => sections.push(new Paragraph({ children: [new TextRun({ text: `${item.degree}, ${item.school}`, bold: true })] }), new Paragraph(`${item.startDate} – ${item.endDate}`)));
  }
  if (resume.skills.length) sections.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: 'Skills' }), new Paragraph(resume.skills.join(' · ')));
  const document = new Document({ sections: [{ children: sections }] });
  save(await Packer.toBlob(document), filename);
}

export async function exportCoverLetterDocx(title: string, content: string, filename: string) {
  const paragraphs = content.split(/\n{2,}/).filter(Boolean).map((text) => new Paragraph(text));
  const document = new Document({ sections: [{ children: [new Paragraph({ heading: HeadingLevel.TITLE, text: title }), ...paragraphs] }] });
  save(await Packer.toBlob(document), filename);
}
