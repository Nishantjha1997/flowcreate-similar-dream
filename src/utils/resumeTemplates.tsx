import { CSSProperties } from 'react';
import { ResumeData as TypesResumeData } from './types';
import { ResumeData, reverseAdaptResumeData } from './resumeAdapterUtils';

export type TemplateStyles = {
  container: CSSProperties;
  header: CSSProperties;
  name: CSSProperties;
  contact: CSSProperties;
  section: CSSProperties;
  sectionTitle: CSSProperties;
  sectionContent: CSSProperties;
  item: CSSProperties;
  itemTitle: CSSProperties;
  itemSubtitle: CSSProperties;
  itemDate: CSSProperties;
  itemDescription: CSSProperties;
  skillsList: CSSProperties;
  skill: CSSProperties;
  profilePhoto?: CSSProperties;
};

const applyCustomization = (
  baseStyles: TemplateStyles, 
  customization?: ResumeData['customization']
): TemplateStyles => {
  if (!customization) return baseStyles;

  const styles = {...baseStyles};
  
  if (customization.primaryColor) {
    styles.name = {...styles.name, color: customization.primaryColor};
    styles.sectionTitle = {...styles.sectionTitle, color: customization.primaryColor};
    styles.skill = {...styles.skill, backgroundColor: customization.primaryColor, color: '#fff'};
  }
  
  if (customization.secondaryColor) {
    styles.itemSubtitle = {...styles.itemSubtitle, color: customization.secondaryColor};
  }
  
  if (customization.accentColor) {
    styles.itemTitle = {...styles.itemTitle, color: customization.accentColor};
  }
  
  if (customization.textColor) {
    styles.itemDescription = {...styles.itemDescription, color: customization.textColor};
  }
  
  if (customization.backgroundColor) {
    styles.container = {...styles.container, backgroundColor: customization.backgroundColor};
  }
  
  if (customization.fontSize) {
    const fontSizeMultiplier = customization.fontSize === 'small' ? 0.9 : 
                               customization.fontSize === 'large' ? 1.1 : 1;
    
    styles.name = {...styles.name, fontSize: `${parseInt(styles.name.fontSize as string) * fontSizeMultiplier}px`};
    styles.itemTitle = {...styles.itemTitle, fontSize: `${parseInt(styles.itemTitle.fontSize as string) * fontSizeMultiplier}px`};
    styles.itemSubtitle = {...styles.itemSubtitle, fontSize: `${parseInt(styles.itemSubtitle.fontSize as string) * fontSizeMultiplier}px`};
    styles.itemDescription = {...styles.itemDescription, fontSize: `${parseInt(styles.itemDescription.fontSize as string) * fontSizeMultiplier}px`};
  }
  
  if (customization.fontFamily) {
    styles.container = {...styles.container, fontFamily: customization.fontFamily};
  }
  
  if (customization.spacing) {
    const spacingMultiplier = customization.spacing === 'compact' ? 0.8 : 
                              customization.spacing === 'spacious' ? 1.2 : 1;
    
    styles.section = {...styles.section, marginBottom: `${parseInt(styles.section.marginBottom as string) * spacingMultiplier}px`};
    styles.item = {...styles.item, marginBottom: `${parseInt(styles.item.marginBottom as string) * spacingMultiplier}px`};
  }
  
  if (customization.headingStyle) {
    styles.sectionTitle = {...styles.sectionTitle, fontWeight: customization.headingStyle === 'bold' ? 700 : 600};
  }
  
  if (customization.sectionMargins) {
    const sectionMarginsValue = parseFloat(customization.sectionMargins);
    if (!isNaN(sectionMarginsValue)) {
      styles.section = {
        ...styles.section, 
        marginTop: `${parseInt(styles.section.marginTop as string) * sectionMarginsValue}px`
      };
    }
  }
  
  if (customization.lineHeight) {
    styles.itemTitle = {...styles.itemTitle, lineHeight: customization.lineHeight};
    styles.itemSubtitle = {...styles.itemSubtitle, lineHeight: customization.lineHeight};
    styles.itemDescription = {...styles.itemDescription, lineHeight: customization.lineHeight};
  }
  
  return styles;
};

const templateStyles: Record<string, TemplateStyles> = {
  // Modern — Clean sans-serif, subtle blue accent, single column
  modern: {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1a1a1a',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '2px solid #2563eb',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    profilePhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #e5e7eb',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#111827',
      letterSpacing: '-0.01em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '14px',
      marginTop: '8px',
      color: '#4b5563',
    },
    section: { marginBottom: '22px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color: '#2563eb',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '1px solid #e5e7eb',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#374151' },
    itemDate: { fontSize: '12px', color: '#6b7280', marginBottom: '6px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', border: '1px solid #bfdbfe' },
  },

  // Classic — Serif, centered header, traditional
  classic: {
    container: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: '#1a1a1a',
      lineHeight: '1.65',
      maxWidth: '100%',
      height: '100%',
      padding: '44px 48px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center',
      marginBottom: '28px',
      borderBottom: '2px solid #1a1a1a',
      paddingBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    profilePhoto: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '12px',
      border: '2px solid #d1d5db',
    },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '6px',
      color: '#111827',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
    contact: {
      fontSize: '13px',
      textAlign: 'center',
      marginTop: '8px',
      color: '#4b5563',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '14px',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '2px',
      color: '#111827',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '1px solid #d1d5db',
      textAlign: 'center',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#374151', fontStyle: 'italic' },
    itemDate: { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.65', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '10px' },
    skill: { fontSize: '13px', color: '#374151', padding: '3px 12px', borderBottom: '1px solid #d1d5db' },
  },

  // Creative — Warm accent, rounded elements
  creative: {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: '#1a1a1a',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '36px 40px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      borderLeft: '5px solid #e11d48',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '88px',
      height: '88px',
      borderRadius: '12px',
      objectFit: 'cover',
      border: '2px solid #fecdd3',
    },
    name: {
      fontSize: '30px',
      fontWeight: 800,
      marginBottom: '4px',
      color: '#111827',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '8px',
      color: '#6b7280',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#e11d48',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '2px solid #fecdd3',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px', paddingLeft: '14px', borderLeft: '2px solid #fecdd3' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#e11d48' },
    itemDate: { fontSize: '12px', color: '#9ca3af', marginBottom: '6px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 14px', fontSize: '12px', borderRadius: '20px', backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' },
  },

  // Technical — Monospace, dark header, developer-focused
  technical: {
    container: {
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      color: '#1e293b',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '36px 40px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '24px',
      backgroundColor: '#0f172a',
      margin: '-36px -40px 24px -40px',
      padding: '28px 40px',
      color: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '72px',
      height: '72px',
      borderRadius: '8px',
      objectFit: 'cover',
      border: '2px solid #334155',
    },
    name: {
      fontSize: '26px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#f8fafc',
      letterSpacing: '0.02em',
    },
    contact: {
      fontSize: '12px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '14px',
      marginTop: '8px',
      color: '#94a3b8',
    },
    section: { marginBottom: '20px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color: '#0f172a',
      marginBottom: '10px',
      paddingBottom: '4px',
      borderBottom: '2px solid #0f172a',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13px', fontWeight: 500, color: '#475569' },
    itemDate: { fontSize: '12px', color: '#64748b', marginBottom: '5px' },
    itemDescription: { fontSize: '13px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '3px 10px', fontSize: '11px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '3px', border: '1px solid #cbd5e1', fontFamily: "'JetBrains Mono', monospace" },
  },

  // Professional — Navy accent, left border, corporate
  professional: {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#1e293b',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
      borderLeft: '6px solid #1e3a5f',
    },
    header: {
      marginBottom: '28px',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '22px',
    },
    profilePhoto: {
      width: '84px',
      height: '84px',
      borderRadius: '6px',
      objectFit: 'cover',
      border: '2px solid #1e3a5f',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#1e3a5f',
      letterSpacing: '-0.01em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '14px',
      marginTop: '8px',
      color: '#64748b',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color: '#1e3a5f',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '2px solid #1e3a5f',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '3px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#1e3a5f' },
    itemDate: { fontSize: '13px', color: '#64748b', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
    skill: { padding: '5px 14px', fontSize: '13px', backgroundColor: '#1e3a5f', color: '#ffffff', borderRadius: '3px' },
  },

  // Minimalist — Ultra clean, light, airy
  minimalist: {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: '#374151',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '44px 48px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '24px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '18px',
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
    },
    profilePhoto: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1px solid #e5e7eb',
    },
    name: {
      fontSize: '24px',
      fontWeight: 600,
      marginBottom: '4px',
      color: '#111827',
    },
    contact: {
      fontSize: '12px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '6px',
      color: '#9ca3af',
    },
    section: { marginBottom: '18px' },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '2px',
      color: '#9ca3af',
      marginBottom: '10px',
      paddingBottom: '4px',
      borderBottom: '1px solid #f3f4f6',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13px', fontWeight: 400, color: '#6b7280' },
    itemDate: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px' },
    itemDescription: { fontSize: '13px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#6b7280' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '3px 10px', fontSize: '11px', backgroundColor: '#f9fafb', color: '#6b7280', borderRadius: '3px', border: '1px solid #e5e7eb' },
  },

  // Executive — Authoritative serif, dark accents
  executive: {
    container: {
      fontFamily: "'Georgia', 'Garamond', serif",
      color: '#1a1a1a',
      lineHeight: '1.65',
      maxWidth: '100%',
      height: '100%',
      padding: '44px 48px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
      borderTop: '5px solid #0f172a',
    },
    header: {
      marginBottom: '28px',
      borderBottom: '2px solid #0f172a',
      paddingBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    profilePhoto: {
      width: '100px',
      height: '100px',
      borderRadius: '0',
      objectFit: 'cover',
      border: '2px solid #0f172a',
    },
    name: {
      fontSize: '32px',
      fontWeight: 700,
      marginBottom: '6px',
      color: '#0f172a',
      letterSpacing: '0.5px',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginTop: '10px',
      color: '#475569',
    },
    section: { marginBottom: '26px' },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '2.5px',
      color: '#0f172a',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '1px solid #94a3b8',
    },
    sectionContent: { marginTop: '12px' },
    item: { marginBottom: '20px' },
    itemTitle: { fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' },
    itemSubtitle: { fontSize: '15px', fontWeight: 500, color: '#334155' },
    itemDate: { fontSize: '14px', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' },
    itemDescription: { fontSize: '15px', whiteSpace: 'pre-line', lineHeight: '1.7', color: '#1e293b' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' },
    skill: { padding: '5px 14px', fontSize: '13px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '2px', border: '1px solid #cbd5e1' },
  },

  // Elegant — Light serif, rose accents, centered titles
  elegant: {
    container: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      color: '#374151',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '28px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '22px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    profilePhoto: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #fecdd3',
      marginBottom: '12px',
    },
    name: {
      fontSize: '30px',
      fontWeight: 600,
      marginBottom: '6px',
      color: '#111827',
      letterSpacing: '0.5px',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '14px',
      marginTop: '8px',
      color: '#6b7280',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: 600,
      textAlign: 'center',
      color: '#9f1239',
      marginBottom: '14px',
      paddingBottom: '8px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '3px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#6b7280', fontStyle: 'italic' },
    itemDate: { fontSize: '13px', color: '#9ca3af', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.65', color: '#4b5563' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' },
    skill: { padding: '4px 14px', fontSize: '13px', border: '1px solid #fecdd3', borderRadius: '20px', color: '#9f1239' },
  },

  // Bold — Strong red accent, impactful
  bold: {
    container: {
      fontFamily: "'Inter', 'Arial Black', sans-serif",
      color: '#1a1a1a',
      backgroundColor: '#fff',
      padding: '36px 40px',
      maxWidth: '100%',
      height: '100%',
      boxSizing: 'border-box',
      borderTop: '6px solid #dc2626',
    },
    header: {
      marginBottom: '24px',
      paddingBottom: '18px',
      borderBottom: '2px solid #1a1a1a',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '8px',
      objectFit: 'cover',
      border: '2px solid #dc2626',
    },
    name: { fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' },
    contact: { fontSize: '12px', color: '#4b5563', display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' },
    section: { marginBottom: '22px' },
    sectionTitle: { fontSize: '13px', fontWeight: 800, color: '#dc2626', marginBottom: '10px', borderBottom: '2px solid #fecaca', paddingBottom: '4px', textTransform: 'uppercase', letterSpacing: '1.5px' },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13px', color: '#4b5563' },
    itemDate: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
    itemDescription: { fontSize: '13px', color: '#374151', lineHeight: '1.55', whiteSpace: 'pre-line' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '12px', backgroundColor: '#dc2626', color: '#fff', borderRadius: '3px' },
  },

  // Medical — Teal accents, healthcare professional
  medical: {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#1e293b',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
      borderTop: '4px solid #0d9488',
    },
    header: {
      marginBottom: '24px',
      paddingBottom: '18px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #99f6e4' },
    name: { fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: '#134e4a' },
    contact: { fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', color: '#4b5563' },
    section: { marginBottom: '22px' },
    sectionTitle: { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0d9488', marginBottom: '10px', paddingBottom: '5px', borderBottom: '2px solid #ccfbf1' },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#0d9488' },
    itemDate: { fontSize: '12px', color: '#6b7280', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '12px', backgroundColor: '#f0fdfa', color: '#0f766e', borderRadius: '4px', border: '1px solid #99f6e4' },
  },

  // Academic — Indigo, scholarly serif
  academic: {
    container: {
      fontFamily: "'Georgia', 'Garamond', serif",
      color: '#1e293b',
      lineHeight: '1.65',
      maxWidth: '100%',
      height: '100%',
      padding: '44px 48px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
      borderBottom: '3px solid #4338ca',
    },
    header: {
      textAlign: 'center',
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: { fontSize: '30px', fontWeight: 700, marginBottom: '6px', color: '#312e81', letterSpacing: '0.5px' },
    contact: { fontSize: '13px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px', marginTop: '8px', color: '#6b7280' },
    section: { marginBottom: '24px' },
    sectionTitle: { fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#4338ca', marginBottom: '12px', paddingBottom: '5px', borderBottom: '1px solid #c7d2fe', textAlign: 'center' },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#4338ca', fontStyle: 'italic' },
    itemDate: { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.65', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' },
    skill: { padding: '4px 12px', fontSize: '13px', border: '1px solid #c7d2fe', color: '#4338ca', borderRadius: '3px' },
  },

  // ATS Classic — Ultra clean serif, no graphics
  'ats-classic': {
    container: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: '#1a1a1a',
      lineHeight: '1.65',
      maxWidth: '100%',
      height: '100%',
      padding: '36px 40px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '24px',
      borderBottom: '2px solid #1a1a1a',
      paddingBottom: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: { fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: '#1a1a1a', letterSpacing: '0.5px' },
    contact: { fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', color: '#4b5563' },
    section: { marginBottom: '22px' },
    sectionTitle: { fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#1a1a1a', marginBottom: '10px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#4b5563' },
    itemDate: { fontSize: '13px', color: '#6b7280', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.65', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '3px 10px', fontSize: '13px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '2px', border: '1px solid #e5e7eb' },
  },

  // ATS Modern — Blue accent, clean sans
  'ats-modern': {
    container: {
      fontFamily: "'Calibri', 'Helvetica Neue', Arial, sans-serif",
      color: '#1e293b',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '32px 36px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      borderTop: '4px solid #2563eb',
    },
    header: {
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: { fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '4px' },
    contact: { fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', color: '#4b5563' },
    section: { marginBottom: '22px' },
    sectionTitle: { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#2563eb', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid #dbeafe' },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#374151' },
    itemDate: { fontSize: '13px', color: '#6b7280', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.65', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '13px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '3px', border: '1px solid #bfdbfe' },
  },

  // ATS Executive — Authoritative, senior
  'ats-executive': {
    container: {
      fontFamily: "'Garamond', 'Georgia', serif",
      color: '#1a1a1a',
      lineHeight: '1.7',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      borderLeft: '5px solid #0f172a',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '2px solid #0f172a',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: { fontSize: '32px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', letterSpacing: '1px' },
    contact: { fontSize: '14px', display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '10px', color: '#475569' },
    section: { marginBottom: '26px' },
    sectionTitle: { fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid #94a3b8' },
    sectionContent: { marginTop: '12px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' },
    itemSubtitle: { fontSize: '15px', fontWeight: 500, color: '#334155' },
    itemDate: { fontSize: '14px', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' },
    itemDescription: { fontSize: '15px', whiteSpace: 'pre-line', lineHeight: '1.7', color: '#1e293b' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' },
    skill: { padding: '5px 14px', fontSize: '14px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '2px', border: '1px solid #cbd5e1' },
  },

  // ATS Tech — Developer-friendly, green accent
  'ats-tech': {
    container: {
      fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif",
      color: '#1e293b',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '30px 34px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      borderTop: '3px solid #059669',
    },
    header: {
      marginBottom: '22px',
      paddingBottom: '14px',
      borderBottom: '1px solid #d1d5db',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: { fontSize: '28px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' },
    contact: { fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', color: '#4b5563' },
    section: { marginBottom: '20px' },
    sectionTitle: { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#059669', marginBottom: '10px', paddingBottom: '4px', borderBottom: '2px solid #d1fae5' },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#374151' },
    itemDate: { fontSize: '13px', color: '#6b7280', marginBottom: '5px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '3px 10px', fontSize: '12px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '3px', border: '1px solid #a7f3d0' },
  },

  // ATS Minimal — Zero distractions
  'ats-minimal': {
    container: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      color: '#1a1a1a',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '32px 36px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: { fontSize: '26px', fontWeight: 700, color: '#000', marginBottom: '4px' },
    contact: { fontSize: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', color: '#555' },
    section: { marginBottom: '18px' },
    sectionTitle: { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#333', marginBottom: '8px', paddingBottom: '3px', borderBottom: '1px solid #e5e5e5' },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13px', fontWeight: 500, color: '#444' },
    itemDate: { fontSize: '12px', color: '#666', marginBottom: '4px' },
    itemDescription: { fontSize: '13px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#333' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '2px 8px', fontSize: '12px', backgroundColor: '#f5f5f5', color: '#333', borderRadius: '2px' },
  },

  // ATS Corporate — Polished corporate, blue
  'ats-corporate': {
    container: {
      fontFamily: "'Cambria', 'Georgia', serif",
      color: '#1e293b',
      lineHeight: '1.65',
      maxWidth: '100%',
      height: '100%',
      padding: '36px 40px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      borderTop: '5px solid #1e40af',
      borderBottom: '2px solid #1e40af',
    },
    header: {
      marginBottom: '26px',
      paddingBottom: '18px',
      borderBottom: '1px solid #dbeafe',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center',
      alignItems: 'center',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: { fontSize: '30px', fontWeight: 700, color: '#1e3a5f', marginBottom: '6px', letterSpacing: '0.5px' },
    contact: { fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px', color: '#475569', justifyContent: 'center' },
    section: { marginBottom: '24px' },
    sectionTitle: { fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#1e40af', marginBottom: '10px', paddingBottom: '5px', borderBottom: '2px solid #93c5fd', textAlign: 'center' },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '3px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#334155' },
    itemDate: { fontSize: '13px', color: '#64748b', marginBottom: '6px', fontStyle: 'italic' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.65', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', justifyContent: 'center' },
    skill: { padding: '4px 12px', fontSize: '13px', backgroundColor: '#eff6ff', color: '#1e40af', borderRadius: '3px', border: '1px solid #93c5fd' },
  },

  // Data Scientist — Purple accent
  'data-scientist': {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#1e293b',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '36px 40px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      borderTop: '4px solid #7c3aed',
    },
    header: {
      marginBottom: '24px',
      paddingBottom: '18px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c4b5fd' },
    name: { fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: '#4c1d95' },
    contact: { fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', color: '#6b7280' },
    section: { marginBottom: '22px' },
    sectionTitle: { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#7c3aed', marginBottom: '10px', paddingBottom: '5px', borderBottom: '2px solid #ede9fe' },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#7c3aed' },
    itemDate: { fontSize: '12px', color: '#6b7280', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '12px', backgroundColor: '#f5f3ff', color: '#6d28d9', borderRadius: '4px', border: '1px solid #c4b5fd' },
  },

  // Developer — Dark header, emerald
  developer: {
    container: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      color: '#1e293b',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '36px 40px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '24px',
      backgroundColor: '#064e3b',
      margin: '-36px -40px 24px -40px',
      padding: '24px 40px',
      color: '#d1fae5',
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
    },
    profilePhoto: { width: '68px', height: '68px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #34d399' },
    name: { fontSize: '26px', fontWeight: 700, marginBottom: '4px', color: '#ecfdf5' },
    contact: { fontSize: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px', color: '#a7f3d0' },
    section: { marginBottom: '20px' },
    sectionTitle: { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#064e3b', marginBottom: '10px', paddingBottom: '4px', borderBottom: '2px solid #d1fae5' },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13px', fontWeight: 500, color: '#059669' },
    itemDate: { fontSize: '12px', color: '#6b7280', marginBottom: '5px' },
    itemDescription: { fontSize: '13px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' },
    skill: { padding: '3px 10px', fontSize: '11px', backgroundColor: '#ecfdf5', color: '#064e3b', borderRadius: '3px', border: '1px solid #a7f3d0' },
  },

  // ATS Pro — Clean, optimized
  'ats-pro': {
    container: {
      fontFamily: "'Inter', 'Arial', sans-serif",
      color: '#1a1a1a',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '34px 38px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '22px',
      paddingBottom: '14px',
      borderBottom: '2px solid #374151',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: { fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '4px' },
    contact: { fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px', color: '#4b5563' },
    section: { marginBottom: '20px' },
    sectionTitle: { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#374151', marginBottom: '10px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#374151' },
    itemDate: { fontSize: '12px', color: '#6b7280', marginBottom: '5px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '12px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '3px', border: '1px solid #e5e7eb' },
  },

  // Apple — Clean SF Pro inspired, pure white, ultra-minimal with precision spacing
  apple: {
    container: {
      fontFamily: "'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', sans-serif",
      color: '#1d1d1f',
      lineHeight: '1.5',
      maxWidth: '100%',
      height: '100%',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '1px solid #d2d2d7',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    profilePhoto: {
      width: '72px',
      height: '72px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1px solid #d2d2d7',
    },
    name: {
      fontSize: '32px',
      fontWeight: 600,
      marginBottom: '4px',
      color: '#1d1d1f',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginTop: '8px',
      color: '#86868b',
    },
    section: { marginBottom: '28px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
      color: '#86868b',
      marginBottom: '14px',
      paddingBottom: '6px',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '20px' },
    itemTitle: { fontSize: '16px', fontWeight: 600, color: '#1d1d1f', marginBottom: '2px', letterSpacing: '-0.01em' },
    itemSubtitle: { fontSize: '14px', fontWeight: 400, color: '#424245' },
    itemDate: { fontSize: '12px', color: '#86868b', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#424245' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
    skill: { padding: '5px 14px', fontSize: '12px', backgroundColor: '#f5f5f7', color: '#1d1d1f', borderRadius: '20px', border: 'none' },
  },

  // Apple Dark — Dark mode Apple aesthetic
  'apple-dark': {
    container: {
      fontFamily: "'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', sans-serif",
      color: '#f5f5f7',
      lineHeight: '1.5',
      maxWidth: '100%',
      height: '100%',
      padding: '48px 52px',
      backgroundColor: '#1d1d1f',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '1px solid #424245',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    profilePhoto: {
      width: '72px',
      height: '72px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1px solid #424245',
    },
    name: {
      fontSize: '32px',
      fontWeight: 600,
      marginBottom: '4px',
      color: '#f5f5f7',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginTop: '8px',
      color: '#86868b',
    },
    section: { marginBottom: '28px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
      color: '#86868b',
      marginBottom: '14px',
      paddingBottom: '6px',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '20px' },
    itemTitle: { fontSize: '16px', fontWeight: 600, color: '#f5f5f7', marginBottom: '2px', letterSpacing: '-0.01em' },
    itemSubtitle: { fontSize: '14px', fontWeight: 400, color: '#a1a1a6' },
    itemDate: { fontSize: '12px', color: '#86868b', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#a1a1a6' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
    skill: { padding: '5px 14px', fontSize: '12px', backgroundColor: '#2d2d30', color: '#f5f5f7', borderRadius: '20px', border: 'none' },
  },

  // Facebook / Meta — Clean blue corporate, modern sans-serif
  facebook: {
    container: {
      fontFamily: "'Segoe UI', 'Helvetica', Arial, sans-serif",
      color: '#1c1e21',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      borderTop: '4px solid #1877f2',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '1px solid #dadde1',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #1877f2',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#1c1e21',
      letterSpacing: '-0.01em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '14px',
      marginTop: '8px',
      color: '#65676b',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#1877f2',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '2px solid #e4e6eb',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px', paddingLeft: '14px', borderLeft: '3px solid #1877f2' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#1c1e21', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#1877f2' },
    itemDate: { fontSize: '12px', color: '#65676b', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#050505' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
    skill: { padding: '5px 14px', fontSize: '12px', backgroundColor: '#e7f3ff', color: '#1877f2', borderRadius: '20px', border: 'none' },
  },

  // Meta — Modern Meta rebrand aesthetic, gradient accent
  meta: {
    container: {
      fontFamily: "'Optimistic Display', 'Segoe UI', sans-serif",
      color: '#1c1e21',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '24px',
      borderBottom: '2px solid transparent',
      borderImage: 'linear-gradient(90deg, #0668E1, #1877F2, #00C2FF) 1',
      display: 'flex',
      alignItems: 'center',
      gap: '22px',
    },
    profilePhoto: {
      width: '76px',
      height: '76px',
      borderRadius: '16px',
      objectFit: 'cover',
      border: '2px solid #e4e6eb',
    },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#1c1e21',
      letterSpacing: '-0.015em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '14px',
      marginTop: '8px',
      color: '#65676b',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
      color: '#0668E1',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '1px solid #e4e6eb',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '16px', fontWeight: 600, color: '#1c1e21', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#0668E1' },
    itemDate: { fontSize: '12px', color: '#65676b', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#1c1e21' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
    skill: { padding: '5px 16px', fontSize: '12px', backgroundColor: '#f0f2f5', color: '#0668E1', borderRadius: '8px', border: '1px solid #e4e6eb' },
  },
};

// elegant is already defined in templateStyles above

export const templateMockData: Record<string, ResumeData> = {
  modern: {
    personal: {
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St, San Francisco, CA',
      summary: 'Product-focused software engineer with 6+ years building modern user experiences.',
      website: 'alexjohnson.dev',
      linkedin: 'linkedin.com/in/alexjohnson',
      profileImage: '',
    },
    experience: [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'Tech Dynamix',
        location: 'Remote',
        startDate: 'Apr 2020',
        endDate: '',
        current: true,
        description: 'Lead React/TypeScript projects; mentoring 8 engineers; designed authentication and cloud integrations.'
      },
      {
        id: 2,
        title: 'Frontend Developer',
        company: 'Pixel Rocket',
        location: 'San Jose, CA',
        startDate: 'Jan 2018',
        endDate: 'Mar 2020',
        current: false,
        description: 'Developed robust web interfaces for SaaS platform used by Fortune 500 partners.'
      }
    ],
    education: [
      {
        id: 1,
        school: 'UC Berkeley',
        degree: 'B.Sc.',
        field: 'Computer Science',
        startDate: '2014',
        endDate: '2017',
        description: 'Graduated with honors in advanced computing topics and research'
      }
    ],
    skills: ['JavaScript', 'React', 'TypeScript', 'User Experience', 'Cloud', 'REST APIs'],
    projects: [
      {
        id: 1,
        title: 'Realtime Collaboration App',
        description: 'An in-browser team editor with live presence and versioning.',
        technologies: ['React', 'Socket.IO', 'AWS'],
        link: 'https://github.com/alexjohnson/realtime-collab'
      },
    ],
    customization: {
      primaryColor: '#2563eb',
      secondaryColor: '#6b7280',
      fontSize: 'medium',
      spacing: 'normal'
    }
  },
  elegant: {
    personal: {
      name: 'Charlotte Evans',
      email: 'charlotte.evans@example.com',
      phone: '+44 7123 456789',
      address: 'London, UK',
      summary: 'Marketing strategist & campaign manager with a creative eye for branding.',
      website: 'charlotte-evans.com',
      linkedin: 'linkedin.com/in/charlotteevans',
      profileImage: '',
    },
    experience: [
      {
        id: 1,
        title: 'Lead Marketing Strategist',
        company: 'Visionary Brands',
        location: 'London',
        startDate: '2019',
        endDate: '',
        current: true,
        description: "Increased conversions by 40% with integrated digital campaigns targeting UK retail sector."
      }
    ],
    education: [
      {
        id: 1,
        school: 'University of Oxford',
        degree: 'MA',
        field: 'Marketing',
        startDate: '2015',
        endDate: '2018',
        description: 'Dissertation on social branding trends'
      }
    ],
    skills: ['Digital Marketing', 'Copywriting', 'Brand Development', 'Team Leadership'],
    projects: [
      {
        id: 1,
        title: 'Brand Relaunch for XCORP',
        description: 'Rebranded a national franchise – new logo, website, and social assets.',
        technologies: ['Branding', 'Graphic Design', 'UX'],
        link: ''
      },
    ],
    customization: {
      primaryColor: '#748ca6',
      secondaryColor: '#353535',
      fontSize: 'large',
      spacing: 'spacious'
    }
  },
  bold: {
    personal: {
      name: 'Maya Patel',
      email: 'maya.patel@mail.com',
      phone: '+1 (785) 888-2468',
      address: 'Austin, TX',
      summary: 'Direct and driven sales leader with consistent multi-million targets exceeded.',
      website: 'mayapatel.io',
      linkedin: 'linkedin.com/in/mayapatel',
      profileImage: '',
    },
    experience: [
      {
        id: 1,
        title: 'Director of Sales',
        company: 'SkyLine Telecom',
        location: 'Austin, TX',
        startDate: '2020',
        endDate: '',
        current: true,
        description: 'Managed 20+ member sales team and expanded regional revenue by 82%.'
      },
      {
        id: 2,
        title: 'Sales Executive',
        company: 'WaveConnect',
        location: 'Houston, TX',
        startDate: '2017',
        endDate: '2020',
        current: false,
        description: 'Ranked top 1% zone performer for 2 consecutive years.'
      }
    ],
    education: [
      {
        id: 1,
        school: 'Texas A&M University',
        degree: 'MBA',
        field: 'Business Administration',
        startDate: '2011',
        endDate: '2015',
        description: ''
      }
    ],
    skills: ['Negotiation', 'Team Building', 'B2B Sales', 'Customer Retention'],
    projects: [],
    customization: {
      primaryColor: '#c1121f',
      secondaryColor: '#e63946',
      fontSize: 'medium',
      spacing: 'normal'
    }
  },

  'ats-classic': {
    personal: {
      name: 'Robert Chen',
      email: 'robert.chen@email.com',
      phone: '(555) 234-5678',
      address: 'Chicago, IL',
      summary: 'Results-driven operations manager with 10+ years of experience in supply chain optimization, process improvement, and team leadership across Fortune 500 companies.',
      website: '',
      linkedin: 'linkedin.com/in/robertchen',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Senior Operations Manager', company: 'Global Logistics Corp', location: 'Chicago, IL', startDate: 'Jan 2019', endDate: '', current: true, description: 'Optimized supply chain processes reducing costs by 23%. Managed team of 45 across 3 distribution centers.' },
      { id: 2, title: 'Operations Analyst', company: 'Midwest Manufacturing Inc', location: 'Milwaukee, WI', startDate: 'Mar 2015', endDate: 'Dec 2018', current: false, description: 'Implemented Lean Six Sigma methodologies resulting in 15% efficiency improvement.' },
    ],
    education: [{ id: 1, school: 'Northwestern University', degree: 'MBA', field: 'Operations Management', startDate: '2013', endDate: '2015', description: '' }],
    skills: ['Supply Chain Management', 'Lean Six Sigma', 'Project Management', 'Data Analysis', 'SAP', 'Team Leadership'],
    projects: [],
    customization: { primaryColor: '#1a1a1a', fontSize: 'medium', spacing: 'normal' },
  },

  'ats-modern': {
    personal: {
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '(555) 345-6789',
      address: 'Seattle, WA',
      summary: 'Full-stack software engineer specializing in cloud-native applications, microservices architecture, and DevOps practices. Passionate about building scalable, maintainable systems.',
      website: 'sarahmitchell.dev',
      linkedin: 'linkedin.com/in/sarahmitchell',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Staff Software Engineer', company: 'CloudScale Technologies', location: 'Seattle, WA', startDate: 'Jun 2021', endDate: '', current: true, description: 'Architected microservices platform handling 2M+ daily requests. Led migration from monolith reducing deployment time by 80%.' },
      { id: 2, title: 'Senior Developer', company: 'DataFlow Systems', location: 'Portland, OR', startDate: 'Aug 2018', endDate: 'May 2021', current: false, description: 'Built real-time data processing pipelines using Kafka and Spark. Mentored 5 junior developers.' },
    ],
    education: [{ id: 1, school: 'University of Washington', degree: 'B.S.', field: 'Computer Science', startDate: '2014', endDate: '2018', description: '' }],
    skills: ['Python', 'Go', 'Kubernetes', 'AWS', 'PostgreSQL', 'Terraform', 'CI/CD', 'System Design'],
    projects: [{ id: 1, title: 'Open Source API Gateway', description: 'High-performance API gateway with rate limiting and auth. 2K+ GitHub stars.', technologies: ['Go', 'Redis'], link: '' }],
    customization: { primaryColor: '#2563eb', fontSize: 'medium', spacing: 'normal' },
  },

  'ats-executive': {
    personal: {
      name: 'James Wellington III',
      email: 'j.wellington@email.com',
      phone: '(555) 456-7890',
      address: 'New York, NY',
      summary: 'C-suite executive with 20+ years driving P&L growth across technology and financial services. Track record of building high-performing organizations and executing transformational strategies.',
      website: '',
      linkedin: 'linkedin.com/in/jameswellington',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Chief Operating Officer', company: 'Pinnacle Financial Group', location: 'New York, NY', startDate: 'Jan 2020', endDate: '', current: true, description: 'Oversee $2.4B revenue operations with 1,200+ employees. Drove 34% YoY growth through strategic M&A and operational excellence.' },
      { id: 2, title: 'SVP of Strategy', company: 'Atlantic Capital Partners', location: 'Boston, MA', startDate: 'Mar 2015', endDate: 'Dec 2019', current: false, description: 'Led corporate strategy team. Executed 3 major acquisitions totaling $850M.' },
    ],
    education: [{ id: 1, school: 'Harvard Business School', degree: 'MBA', field: 'Finance & Strategy', startDate: '2008', endDate: '2010', description: '' }],
    skills: ['Strategic Planning', 'P&L Management', 'M&A', 'Board Relations', 'Change Management', 'Executive Leadership'],
    projects: [],
    customization: { primaryColor: '#0f172a', fontSize: 'large', spacing: 'spacious' },
  },

  'ats-tech': {
    personal: {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '(555) 567-8901',
      address: 'Austin, TX',
      summary: 'DevOps engineer and site reliability expert with deep expertise in Kubernetes, cloud infrastructure, and automation. Reduced infrastructure costs by 40% while improving uptime to 99.99%.',
      website: 'priyasharma.io',
      linkedin: 'linkedin.com/in/priyasharma',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Senior DevOps Engineer', company: 'ScaleUp Cloud', location: 'Austin, TX', startDate: 'Apr 2020', endDate: '', current: true, description: 'Architected multi-region Kubernetes clusters serving 50M+ users. Built GitOps pipelines reducing deploy time from hours to minutes.' },
      { id: 2, title: 'Cloud Engineer', company: 'TechBridge Solutions', location: 'Dallas, TX', startDate: 'Jun 2017', endDate: 'Mar 2020', current: false, description: 'Migrated legacy infrastructure to AWS, achieving 40% cost reduction. Implemented monitoring with Prometheus and Grafana.' },
    ],
    education: [{ id: 1, school: 'UT Austin', degree: 'B.S.', field: 'Computer Engineering', startDate: '2013', endDate: '2017', description: '' }],
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'Python', 'Prometheus', 'ArgoCD', 'Linux'],
    projects: [],
    customization: { primaryColor: '#059669', fontSize: 'medium', spacing: 'normal' },
  },

  'ats-minimal': {
    personal: {
      name: 'Emma Larsson',
      email: 'emma.larsson@email.com',
      phone: '(555) 678-9012',
      address: 'San Francisco, CA',
      summary: 'Product designer with 7 years crafting user-centered digital experiences for SaaS products. Expert in design systems, user research, and cross-functional collaboration.',
      website: 'emmalarsson.design',
      linkedin: 'linkedin.com/in/emmalarsson',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Lead Product Designer', company: 'Notion Labs', location: 'San Francisco, CA', startDate: 'Sep 2021', endDate: '', current: true, description: 'Lead design for core product features used by 30M+ users. Built and maintained design system with 200+ components.' },
      { id: 2, title: 'Senior UX Designer', company: 'Figma', location: 'San Francisco, CA', startDate: 'Jan 2019', endDate: 'Aug 2021', current: false, description: 'Designed collaboration features that increased user engagement by 45%.' },
    ],
    education: [{ id: 1, school: 'Rhode Island School of Design', degree: 'BFA', field: 'Graphic Design', startDate: '2013', endDate: '2017', description: '' }],
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility', 'HTML/CSS'],
    projects: [],
    customization: { primaryColor: '#333', fontSize: 'medium', spacing: 'compact' },
  },

  'ats-corporate': {
    personal: {
      name: 'Michael Torres',
      email: 'michael.torres@email.com',
      phone: '(555) 789-0123',
      address: 'Washington, DC',
      summary: 'Strategic management consultant with 12 years advising Fortune 100 companies on digital transformation, organizational restructuring, and growth strategy.',
      website: '',
      linkedin: 'linkedin.com/in/michaeltorres',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Principal Consultant', company: 'McKinsey & Company', location: 'Washington, DC', startDate: 'Feb 2019', endDate: '', current: true, description: 'Lead engagement teams of 8-12 consultants on $5M+ transformation projects for federal and private sector clients.' },
      { id: 2, title: 'Senior Associate', company: 'Deloitte Consulting', location: 'New York, NY', startDate: 'Jul 2014', endDate: 'Jan 2019', current: false, description: 'Delivered strategy and operations engagements generating $30M+ in client value.' },
    ],
    education: [{ id: 1, school: 'Georgetown University', degree: 'MBA', field: 'Strategy & Finance', startDate: '2012', endDate: '2014', description: '' }],
    skills: ['Strategy Consulting', 'Digital Transformation', 'Change Management', 'Stakeholder Management', 'Financial Modeling', 'Executive Presentations'],
    projects: [],
    customization: { primaryColor: '#1e40af', fontSize: 'medium', spacing: 'normal' },
  },
};

const ResumeTemplate = ({
  data,
  templateName = 'modern',
  sectionOrder,
  hiddenSections,
}: {
  data: ResumeData | TypesResumeData;
  templateName?: string;
  sectionOrder?: string[];
  hiddenSections?: string[];
}) => {
  const isTypesResumeData = 'education' in data && Array.isArray(data.education) && 
    data.education.length > 0 && 'institution' in data.education[0];
  
  const resumeData = isTypesResumeData ? reverseAdaptResumeData(data as TypesResumeData) as ResumeData : data as ResumeData;
  const baseStyles = templateStyles[templateName] || templateStyles.modern;
  const styles = applyCustomization(baseStyles, resumeData.customization);

  const headerContent = (
    <>
      {resumeData.personal.profileImage && styles.profilePhoto && (
        <img 
          src={resumeData.personal.profileImage} 
          alt={`${resumeData.personal.name || 'Profile'}`}
          style={styles.profilePhoto}
        />
      )}
      <div>
        <div style={styles.name}>{resumeData.personal.name || 'Your Name'}</div>
        <div style={styles.contact}>
          {resumeData.personal.email && (
            <span>{resumeData.personal.email}</span>
          )}
          {resumeData.personal.phone && (
            <span>{resumeData.personal.phone}</span>
          )}
          {resumeData.personal.address && (
            <span>{resumeData.personal.address}</span>
          )}
          {resumeData.personal.website && (
            <span>{resumeData.personal.website}</span>
          )}
          {resumeData.personal.linkedin && (
            <span>{resumeData.personal.linkedin}</span>
          )}
        </div>
      </div>
    </>
  );

  const renderSection = (key: string) => {
    if (hiddenSections && hiddenSections.includes(key)) return null;
    switch (key) {
      case "summary":
        if (resumeData.personal.summary) {
          return (
            <div style={styles.section} key="summary">
              <div style={styles.sectionTitle}>Summary</div>
              <div style={styles.itemDescription}>{resumeData.personal.summary}</div>
            </div>
          );
        }
        break;
      case "experience":
        if (resumeData.experience && resumeData.experience.length > 0) {
          return (
            <div style={styles.section} key="experience">
              <div style={styles.sectionTitle}>Experience</div>
              <div style={styles.sectionContent}>
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} style={styles.item}>
                    <div style={styles.itemTitle}>{exp.title}</div>
                    <div style={styles.itemSubtitle}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                    <div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                    <div style={styles.itemDescription}>{exp.description}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        break;
      case "education":
        if (resumeData.education && resumeData.education.length > 0) {
          return (
            <div style={styles.section} key="education">
              <div style={styles.sectionTitle}>Education</div>
              <div style={styles.sectionContent}>
                {resumeData.education.map((edu) => (
                  <div key={edu.id} style={styles.item}>
                    <div style={styles.itemTitle}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                    <div style={styles.itemSubtitle}>{edu.school}</div>
                    <div style={styles.itemDate}>{edu.startDate} - {edu.endDate}</div>
                    {edu.description && <div style={styles.itemDescription}>{edu.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        break;
      case "skills":
        if (resumeData.skills && resumeData.skills.length > 0) {
          return (
            <div style={styles.section} key="skills">
              <div style={styles.sectionTitle}>Skills</div>
              <div style={styles.skillsList}>
                {resumeData.skills.map((skill, index) => (
                  <div key={index} style={styles.skill}>{skill}</div>
                ))}
              </div>
            </div>
          );
        }
        break;
      case "projects":
        if (resumeData.projects && resumeData.projects.length > 0) {
          return (
            <div style={styles.section} key="projects">
              <div style={styles.sectionTitle}>Projects</div>
              <div style={styles.sectionContent}>
                {resumeData.projects.map((project) => (
                  <div key={project.id} style={styles.item}>
                    <div style={styles.itemTitle}>
                      {project.title}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', fontSize: '14px' }}>
                          Link
                        </a>
                      )}
                    </div>
                    <div style={styles.itemDescription}>{project.description}</div>
                    {project.technologies && project.technologies.length > 0 && (
                      <div style={{ ...styles.skillsList, marginTop: '5px' }}>
                        {project.technologies.map((tech, i) => (
                          <div key={i} style={{ ...styles.skill, fontSize: '12px' }}>{tech}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const defaultOrder = [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
  ];
  const useOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {headerContent}
      </div>
      {useOrder.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
};

export default ResumeTemplate;
