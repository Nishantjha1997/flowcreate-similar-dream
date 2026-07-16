import React from 'react';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '@/constants/pdfDimensions';

export interface CoverLetterTemplateStyles {
  container: React.CSSProperties;
  date: React.CSSProperties;
  salutation: React.CSSProperties;
  body: React.CSSProperties;
  closing: React.CSSProperties;
  signatureName: React.CSSProperties;
}

export const coverLetterTemplateStyles: Record<string, CoverLetterTemplateStyles> = {
  'clean-slate': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#111827',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${A4_HEIGHT_PX}px`,
      boxSizing: 'border-box',
    },
    date: { fontSize: '13px', color: '#6b7280', marginBottom: '28px' },
    salutation: { fontSize: '14px', marginBottom: '20px', fontWeight: 500 },
    body: { fontSize: '13.5px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#374151' },
    closing: { marginTop: '36px', fontSize: '14px' },
    signatureName: { fontWeight: 600, fontSize: '16px', color: '#111827', marginTop: '4px' },
  },

  'executive-serif': {
    container: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: '#1a1a2e',
      padding: '52px 56px',
      backgroundColor: '#ffffff',
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${A4_HEIGHT_PX}px`,
      boxSizing: 'border-box',
    },
    date: { fontSize: '12px', color: '#64748b', marginBottom: '32px', fontStyle: 'italic' },
    salutation: { fontSize: '14px', marginBottom: '24px', fontWeight: 400 },
    body: { fontSize: '13.5px', lineHeight: '2', whiteSpace: 'pre-wrap', color: '#334155' },
    closing: { marginTop: '40px', fontSize: '14px', fontStyle: 'italic' },
    signatureName: { fontWeight: 700, fontSize: '16px', color: '#1a1a2e', marginTop: '6px' },
  },

  'split-frame': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#111827',
      padding: '40px',
      paddingLeft: '48px',
      backgroundColor: '#ffffff',
      borderLeft: '4px solid #1e293b',
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${A4_HEIGHT_PX}px`,
      boxSizing: 'border-box',
    },
    date: { fontSize: '12px', color: '#64748b', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '1px' },
    salutation: { fontSize: '14px', marginBottom: '20px', fontWeight: 600 },
    body: { fontSize: '13.5px', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#1f2937' },
    closing: { marginTop: '36px', fontSize: '14px' },
    signatureName: { fontWeight: 700, fontSize: '17px', color: '#0f172a', marginTop: '6px' },
  },
};

export const coverLetterTemplateNames: Record<string, string> = {
  'clean-slate': 'Clean Slate',
  'executive-serif': 'Executive Serif',
  'split-frame': 'Split Frame',
};

export const DEFAULT_COVER_LETTER_TEMPLATE = 'clean-slate';
