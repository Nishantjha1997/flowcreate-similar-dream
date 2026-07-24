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

  'modern-minimal': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#0f172a',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      borderTop: '6px solid #3b82f6',
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${A4_HEIGHT_PX}px`,
      boxSizing: 'border-box',
    },
    date: { fontSize: '12px', color: '#64748b', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    salutation: { fontSize: '14px', marginBottom: '20px', fontWeight: 600, color: '#0f172a' },
    body: { fontSize: '13.5px', lineHeight: '1.75', whiteSpace: 'pre-wrap', color: '#334155' },
    closing: { marginTop: '32px', fontSize: '14px' },
    signatureName: { fontWeight: 700, fontSize: '16px', color: '#3b82f6', marginTop: '4px' },
  },

  'bold-header': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1e1b4b',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${A4_HEIGHT_PX}px`,
      boxSizing: 'border-box',
    },
    date: { fontSize: '12px', color: '#4338ca', marginBottom: '24px', paddingBottom: '16px', borderBottom: '3px solid #4338ca', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 },
    salutation: { fontSize: '15px', marginBottom: '20px', fontWeight: 700 },
    body: { fontSize: '13.5px', lineHeight: '1.75', whiteSpace: 'pre-wrap', color: '#312e81' },
    closing: { marginTop: '32px', fontSize: '14px' },
    signatureName: { fontWeight: 800, fontSize: '18px', color: '#4338ca', marginTop: '4px' },
  },

  'classic-block': {
    container: {
      fontFamily: "'Times New Roman', Georgia, serif",
      color: '#000000',
      padding: '56px 60px',
      backgroundColor: '#ffffff',
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${A4_HEIGHT_PX}px`,
      boxSizing: 'border-box',
    },
    date: { fontSize: '13px', color: '#000000', marginBottom: '32px' },
    salutation: { fontSize: '13px', marginBottom: '20px', fontWeight: 400 },
    body: { fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#000000', textAlign: 'justify' },
    closing: { marginTop: '32px', fontSize: '13px' },
    signatureName: { fontWeight: 700, fontSize: '13px', color: '#000000', marginTop: '24px' },
  },

  'mono-tech': {
    container: {
      fontFamily: "'Courier New', 'SFMono-Regular', monospace",
      color: '#1e293b',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      borderLeft: '4px solid #0f172a',
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${A4_HEIGHT_PX}px`,
      boxSizing: 'border-box',
    },
    date: { fontSize: '11px', color: '#475569', marginBottom: '28px' },
    salutation: { fontSize: '13px', marginBottom: '20px', fontWeight: 700 },
    body: { fontSize: '12.5px', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#1e293b' },
    closing: { marginTop: '32px', fontSize: '13px' },
    signatureName: { fontWeight: 700, fontSize: '14px', color: '#0f172a', marginTop: '4px' },
  },

  'warm-terracotta': {
    container: {
      fontFamily: "'Georgia', 'Palatino Linotype', serif",
      color: '#431407',
      padding: '52px 56px',
      backgroundColor: '#fffaf5',
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${A4_HEIGHT_PX}px`,
      boxSizing: 'border-box',
    },
    date: { fontSize: '12px', color: '#c2410c', marginBottom: '28px', fontStyle: 'italic' },
    salutation: { fontSize: '14px', marginBottom: '22px', fontWeight: 500 },
    body: { fontSize: '13.5px', lineHeight: '1.85', whiteSpace: 'pre-wrap', color: '#57534e' },
    closing: { marginTop: '36px', fontSize: '14px', fontStyle: 'italic' },
    signatureName: { fontWeight: 700, fontSize: '16px', color: '#c2410c', marginTop: '6px' },
  },
};

export const coverLetterTemplateNames: Record<string, string> = {
  'clean-slate': 'Clean Slate',
  'executive-serif': 'Executive Serif',
  'split-frame': 'Split Frame',
  'modern-minimal': 'Modern Minimal',
  'bold-header': 'Bold Header',
  'classic-block': 'Classic Block',
  'mono-tech': 'Mono Tech',
  'warm-terracotta': 'Warm Terracotta',
};

export const DEFAULT_COVER_LETTER_TEMPLATE = 'clean-slate';
