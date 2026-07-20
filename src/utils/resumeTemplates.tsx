import { CSSProperties } from 'react';
import { ResumeData as TypesResumeData } from './types';
import { ResumeData, reverseAdaptResumeData } from './resumeAdapterUtils';
import { TEMPLATE_REGISTRY, resolveTemplateKey, getTemplate } from '@/templates/registry';

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
  sidebar?: CSSProperties;
  mainContent?: CSSProperties;
  // Optional override for section titles rendered inside a sidebar (e.g. a
  // dark aside where the shared sectionTitle color would be unreadable).
  sidebarSectionTitle?: CSSProperties;
};

export const applyCustomization = (
  baseStyles: TemplateStyles, 
  customization?: ResumeData['customization']
): TemplateStyles => {
  if (!customization) return baseStyles;

  // Deep clone to prevent modifying template definitions
  const styles: TemplateStyles = JSON.parse(JSON.stringify(baseStyles));
  
  if (customization.primaryColor) {
    if (styles.name) styles.name.color = customization.primaryColor;
    if (styles.sectionTitle) styles.sectionTitle.color = customization.primaryColor;
    if (styles.sidebarSectionTitle) styles.sidebarSectionTitle.color = customization.primaryColor;
    if (styles.skill) {
      if (styles.skill.backgroundColor && styles.skill.backgroundColor !== 'transparent') {
        styles.skill.backgroundColor = customization.primaryColor;
        styles.skill.color = '#fff';
      } else {
        styles.skill.borderColor = customization.primaryColor;
        styles.skill.color = customization.primaryColor;
      }
    }
  }
  
  if (customization.secondaryColor) {
    if (styles.itemSubtitle) styles.itemSubtitle.color = customization.secondaryColor;
  }
  
  if (customization.accentColor) {
    if (styles.sectionTitle) styles.sectionTitle.borderBottomColor = customization.accentColor;
    if (styles.sidebarSectionTitle) styles.sidebarSectionTitle.borderBottomColor = customization.accentColor;
  }
  
  if (customization.textColor) {
    if (styles.itemDescription) styles.itemDescription.color = customization.textColor;
    if (styles.contact) styles.contact.color = customization.textColor;
  }
  
  if (customization.backgroundColor) {
    if (styles.container) styles.container.backgroundColor = customization.backgroundColor;
  }
  
  if (customization.fontSize) {
    const m = customization.fontSize === 'small' ? 0.9 : customization.fontSize === 'large' ? 1.1 : 1;
    const getNewFontSize = (val: string | number | undefined, multiplier: number, fallback: number): string => {
      if (!val) return `${parseFloat((fallback * multiplier).toFixed(1))}px`;
      const num = parseFloat(String(val));
      if (isNaN(num)) return `${parseFloat((fallback * multiplier).toFixed(1))}px`;
      return `${parseFloat((num * multiplier).toFixed(1))}px`;
    };
    if (styles.name) styles.name.fontSize = getNewFontSize(styles.name.fontSize, m, 28);
    if (styles.itemTitle) styles.itemTitle.fontSize = getNewFontSize(styles.itemTitle.fontSize, m, 14);
    if (styles.itemSubtitle) styles.itemSubtitle.fontSize = getNewFontSize(styles.itemSubtitle.fontSize, m, 12);
    if (styles.itemDescription) styles.itemDescription.fontSize = getNewFontSize(styles.itemDescription.fontSize, m, 12);
  }
  
  if (customization.headingFont) {
    if (styles.name) styles.name.fontFamily = customization.headingFont;
    if (styles.sectionTitle) styles.sectionTitle.fontFamily = customization.headingFont;
    if (styles.itemTitle) styles.itemTitle.fontFamily = customization.headingFont;
  }

  if (customization.bodyFont) {
    if (styles.container) styles.container.fontFamily = customization.bodyFont;
  } else if (customization.fontFamily && customization.fontFamily !== 'default') {
    if (styles.container) styles.container.fontFamily = customization.fontFamily;
  }
  
  if (customization.spacing) {
    const m = customization.spacing === 'compact' ? 0.75 : customization.spacing === 'spacious' ? 1.25 : 1;
    const getNewSpacing = (val: string | number | undefined, multiplier: number, fallback: number): string => {
      if (!val) return `${parseFloat((fallback * multiplier).toFixed(1))}px`;
      const num = parseFloat(String(val));
      if (isNaN(num)) return `${parseFloat((fallback * multiplier).toFixed(1))}px`;
      return `${parseFloat((num * multiplier).toFixed(1))}px`;
    };
    if (styles.section) styles.section.marginBottom = getNewSpacing(styles.section.marginBottom, m, 24);
    if (styles.item) styles.item.marginBottom = getNewSpacing(styles.item.marginBottom, m, 16);
  }

  if (customization.lineHeight) {
    const lhMap: Record<string, string> = {
      tight: '1.4',
      normal: '1.6',
      relaxed: '1.8',
      '1.4': '1.4',
      '1.6': '1.6',
      '1.8': '1.8',
    };
    const mappedLh = lhMap[customization.lineHeight] || customization.lineHeight;
    if (styles.itemDescription) styles.itemDescription.lineHeight = mappedLh;
  }
  
  if (customization.showPhoto === false) {
    if (styles.profilePhoto) {
      styles.profilePhoto.display = 'none';
    }
  } else if (customization.photoShape) {
    if (styles.profilePhoto) {
      const shapeMap: Record<string, string> = {
        circle: '50%',
        rounded: '12px',
        square: '0px',
      };
      styles.profilePhoto.borderRadius = shapeMap[customization.photoShape] || styles.profilePhoto.borderRadius;
    }
  }

  // ─── Layout Type ─────────────────────────────────────────
  if (customization.layoutType) {
    if (styles.container) {
      // Multi-column and header-band templates must keep their full-bleed
      // outer shell. Change only the content region so a density preset never
      // creates a white frame around a sidebar or colored header.
      const contentTarget = styles.mainContent || styles.container;
      if (customization.layoutType === 'compact') {
        contentTarget.padding = '28px 32px';
      } else if (customization.layoutType === 'minimal') {
        if (styles.container.borderTop) delete styles.container.borderTop;
        if (styles.container.borderLeft) delete styles.container.borderLeft;
        contentTarget.padding = '48px 54px';
      } else if (customization.layoutType === 'creative') {
        styles.container.borderRadius = '12px';
        contentTarget.padding = '42px 46px';
      }
    }
  }

  // ─── Heading Style ────────────────────────────────────────
  if (customization.headingStyle && styles.sectionTitle) {
    if (customization.headingStyle === 'bold') {
      styles.sectionTitle.fontWeight = 800;
    } else if (customization.headingStyle === 'underlined') {
      styles.sectionTitle.borderBottom = '2px solid ' + (styles.sectionTitle.color || '#000');
      styles.sectionTitle.paddingBottom = '4px';
    } else if (customization.headingStyle === 'capitalized') {
      styles.sectionTitle.textTransform = 'uppercase';
    } else if (customization.headingStyle === 'minimal') {
      styles.sectionTitle.fontSize = '11px';
      styles.sectionTitle.fontWeight = 500;
      styles.sectionTitle.color = styles.sectionTitle.color ? styles.sectionTitle.color + '99' : '#999';
    }
  }

  // ─── Section Margins ──────────────────────────────────────
  if (customization.sectionMargins && styles.section) {
    const sm = customization.sectionMargins === 'small' ? 0.7 : customization.sectionMargins === 'large' ? 1.3 : 1;
    const getMs = (val: string | number | undefined, fallback: number): string => {
      if (!val) return `${parseFloat((fallback * sm).toFixed(1))}px`;
      const n = parseFloat(String(val));
      return isNaN(n) ? `${parseFloat((fallback * sm).toFixed(1))}px` : `${parseFloat((n * sm).toFixed(1))}px`;
    };
    styles.section.marginBottom = getMs(styles.section.marginBottom, 24);
    if (styles.item) styles.item.marginBottom = getMs(styles.item.marginBottom, 16);
  }

  // ─── Paper Type ───────────────────────────────────────────
  if (customization.paperType && styles.container) {
    if (customization.paperType === 'textured') {
      styles.container.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")';
    } else if (customization.paperType === 'minimal') {
      if (styles.container.boxShadow) delete styles.container.boxShadow;
      if (styles.container.border) delete styles.container.border;
    }
  }

  // ─── Text Density ─────────────────────────────────────────
  if (customization.textDensity && typeof customization.textDensity === 'number') {
    const d = 0.85 + (customization.textDensity / 10) * 0.3; // 0.85x to 1.15x
    const fs = (val: string | number | undefined, fallback: number): string => {
      if (!val) return `${parseFloat((fallback * d).toFixed(1))}px`;
      const n = parseFloat(String(val));
      return isNaN(n) ? `${parseFloat((fallback * d).toFixed(1))}px` : `${parseFloat((n * d).toFixed(1))}px`;
    };
    if (styles.itemDescription) {
      styles.itemDescription.fontSize = fs(styles.itemDescription.fontSize, 12);
      styles.itemDescription.lineHeight = String(1.4 + (customization.textDensity / 10) * 0.4);
    }
    if (styles.sectionTitle) styles.sectionTitle.fontSize = fs(styles.sectionTitle.fontSize, 13);
    if (styles.itemTitle) styles.itemTitle.fontSize = fs(styles.itemTitle.fontSize, 14);
    if (styles.itemSubtitle) styles.itemSubtitle.fontSize = fs(styles.itemSubtitle.fontSize, 12);
  }

  // ─── Section Titles (custom names) ────────────────────────
  // Passed through to renderer via sectionTitles; applied in renderSection switch
  // No style changes needed here — handled in the ResumeTemplate component

  return styles;
};

// ═══════════════════════════════════════════════════════════════
// 7 PREMIUM ATS-OPTIMIZED TEMPLATES
// Each is visually distinct with unique layout approach
// ═══════════════════════════════════════════════════════════════

export const templateStyles: Record<string, TemplateStyles> = {

  // ─── 1. CLEAN SLATE ─────────────────────────────────────────
  // Ultra-minimal single column. Thin top accent line. 
  // Maximum white space, system sans-serif.
  'clean-slate': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1a1a2e',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
      borderTop: '3px solid #2563eb',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '32px',
      fontWeight: 700,
      marginBottom: '6px',
      color: '#111827',
      letterSpacing: '-0.025em',
    },
    contact: {
      fontSize: '12.5px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      marginTop: '8px',
      color: '#6b7280',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2.5px',
      color: '#2563eb',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '1.5px solid #dbeafe',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#374151' },
    itemDate: { fontSize: '12px', color: '#9ca3af', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.65', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '11.5px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', border: '1px solid #bfdbfe' },
  },

  // ─── 2. EXECUTIVE SERIF ──────────────────────────────────────
  // Prestigious serif font, centered header, thick bottom borders.
  // Ideal for senior/C-level professionals.
  'executive-serif': {
    container: {
      fontFamily: "'Georgia', 'Garamond', 'Times New Roman', serif",
      color: '#1a1a1a',
      lineHeight: '1.7',
      maxWidth: '100%',
      height: '100%',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '3px double #1a1a1a',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '34px',
      fontWeight: 700,
      marginBottom: '6px',
      color: '#0f172a',
      letterSpacing: '2px',
      textTransform: 'uppercase' as const,
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
      gap: '20px',
      marginTop: '10px',
      color: '#475569',
    },
    section: { marginBottom: '28px' },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '3px',
      color: '#0f172a',
      marginBottom: '14px',
      paddingBottom: '8px',
      borderBottom: '2px solid #0f172a',
      textAlign: 'center' as const,
    },
    sectionContent: { marginTop: '12px' },
    item: { marginBottom: '22px' },
    itemTitle: { fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' },
    itemSubtitle: { fontSize: '15px', fontWeight: 500, color: '#334155', fontStyle: 'italic' as const },
    itemDate: { fontSize: '13px', color: '#64748b', fontStyle: 'italic' as const, marginBottom: '8px' },
    itemDescription: { fontSize: '14.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.75', color: '#1e293b' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '10px', justifyContent: 'center', marginTop: '10px' },
    skill: { padding: '5px 16px', fontSize: '13px', backgroundColor: 'transparent', color: '#0f172a', borderRadius: '0px', border: '1.5px solid #334155' },
  },

  // ─── 3. SIDEBAR MODERN ───────────────────────────────────────
  // Two-column layout with left accent bar. Contact on left side implied
  // through the accent border. Clean geometric feel.
  'sidebar-modern': {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#1e293b',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
      borderLeft: '6px solid #7c3aed',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '72px',
      height: '72px',
      borderRadius: '12px',
      objectFit: 'cover' as const,
      border: '2px solid #c4b5fd',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#7c3aed',
      letterSpacing: '-0.01em',
    },
    contact: {
      fontSize: '12.5px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#64748b',
    },
    section: { marginBottom: '22px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#7c3aed',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '2px solid #ede9fe',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px', paddingLeft: '14px', borderLeft: '2px solid #ede9fe' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#7c3aed' },
    itemDate: { fontSize: '12px', color: '#9ca3af', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 14px', fontSize: '11.5px', backgroundColor: '#f5f3ff', color: '#6d28d9', borderRadius: '20px', border: '1px solid #ddd6fe' },
  },

  // ─── 4. TECH ENGINEER ────────────────────────────────────────
  // Dark header band, monospace touches, green accent.
  // Developer/engineer focused with terminal aesthetic.
  'tech-engineer': {
    container: {
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      color: '#1e293b',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '0',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '0',
      backgroundColor: '#0f172a',
      padding: '32px 40px',
      color: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '64px',
      height: '64px',
      borderRadius: '6px',
      objectFit: 'cover' as const,
      border: '2px solid #22d3ee',
    },
    name: {
      fontSize: '26px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#22d3ee',
      letterSpacing: '0.02em',
    },
    contact: {
      fontSize: '12px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#94a3b8',
    },
    section: { marginBottom: '20px', padding: '0 40px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      color: '#0f172a',
      marginBottom: '10px',
      marginTop: '24px',
      paddingBottom: '4px',
      borderBottom: '2px solid #0f172a',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13px', fontWeight: 500, color: '#475569' },
    itemDate: { fontSize: '11.5px', color: '#64748b', marginBottom: '5px', fontFamily: "'JetBrains Mono', monospace" },
    itemDescription: { fontSize: '13px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '5px', marginTop: '8px' },
    skill: { padding: '3px 10px', fontSize: '11px', backgroundColor: '#0f172a', color: '#22d3ee', borderRadius: '3px', border: '1px solid #1e293b', fontFamily: "'JetBrains Mono', monospace" },
  },

  // ─── 5. CORAL CREATIVE ───────────────────────────────────────
  // Warm coral/rose accent, rounded elements, modern creative feel.
  // Great for designers, marketers, creatives.
  'coral-creative': {
    container: {
      fontFamily: "'Poppins', 'Inter', sans-serif",
      color: '#1a1a1a',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '44px 48px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '24px',
      borderBottom: '1px solid #fecdd3',
      display: 'flex',
      alignItems: 'center',
      gap: '22px',
    },
    profilePhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover' as const,
      border: '3px solid #fb7185',
    },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#e11d48',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#6b7280',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      color: '#e11d48',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '2px solid #fecdd3',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px', paddingLeft: '14px', borderLeft: '3px solid #fecdd3' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#e11d48' },
    itemDate: { fontSize: '12px', color: '#9ca3af', marginBottom: '6px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.65', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '5px 14px', fontSize: '12px', backgroundColor: '#fff1f2', color: '#be123c', borderRadius: '20px', border: '1px solid #fecdd3' },
  },

  // ─── 6. NAVY PROFESSIONAL ────────────────────────────────────
  // Navy/dark blue accent, strong borders, corporate authority.
  // For finance, consulting, management professionals.
  'navy-professional': {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#1e293b',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '44px 48px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
      borderTop: '5px solid #1e3a5f',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#1e3a5f',
      letterSpacing: '-0.01em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      marginTop: '8px',
      color: '#64748b',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#1e3a5f',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: '2.5px solid #1e3a5f',
    },
    sectionContent: { marginTop: '10px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '3px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#1e3a5f' },
    itemDate: { fontSize: '13px', color: '#64748b', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line' as const, lineHeight: '1.65', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '10px' },
    skill: { padding: '5px 14px', fontSize: '12.5px', backgroundColor: '#1e3a5f', color: '#ffffff', borderRadius: '3px', border: 'none' },
  },

  // ─── 7. EMERALD MINIMAL ──────────────────────────────────────
  // Earthy emerald/teal tones, ultra-light, generous whitespace.
  // Great for healthcare, sustainability, education.
  'emerald-minimal': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: '#374151',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
      borderLeft: '4px solid #059669',
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '1px solid #d1fae5',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '28px',
      fontWeight: 600,
      marginBottom: '4px',
      color: '#064e3b',
      letterSpacing: '-0.01em',
    },
    contact: {
      fontSize: '12.5px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#6b7280',
    },
    section: { marginBottom: '22px' },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2.5px',
      color: '#059669',
      marginBottom: '10px',
      paddingBottom: '5px',
      borderBottom: '1.5px solid #a7f3d0',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#059669' },
    itemDate: { fontSize: '12px', color: '#9ca3af', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#4b5563' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '11.5px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '4px', border: '1px solid #a7f3d0' },
  },

  // ─── 8. SPLIT FRAME (premium) ────────────────────────────────
  // True two-column: dark slate left sidebar (photo, contact, skills),
  // clean white main column with sky-blue accents.
  'split-frame': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#111827',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    sidebar: {
      width: '32%',
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      padding: '40px 24px',
      boxSizing: 'border-box' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    mainContent: {
      flex: 1,
      padding: '40px 36px',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '22px',
      paddingBottom: '14px',
      borderBottom: '2px solid #38bdf8',
    },
    profilePhoto: { width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover' as const, border: '3px solid #38bdf8', marginBottom: '6px' },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '2px',
      color: '#0f172a',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '12px',
      color: '#cbd5e1',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2px',
      marginTop: '4px',
      wordBreak: 'break-word' as const,
    },
    section: { marginBottom: '20px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#0369a1',
      marginBottom: '10px',
      paddingBottom: '5px',
      borderBottom: '1.5px solid #bae6fd',
    },
    sidebarSectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#38bdf8',
      marginBottom: '10px',
      paddingBottom: '5px',
      borderBottom: '1.5px solid #334155',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#0369a1' },
    itemDate: { fontSize: '12px', color: '#64748b', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 10px', fontSize: '11.5px', backgroundColor: '#334155', color: '#e2e8f0', borderRadius: '4px', border: '1px solid #475569' },
  },

  // ─── 9. TIMELINE DOT (free) ──────────────────────────────────
  // Single column; experience/education items sit on a teal timeline
  // rule with accented dates. Approachable and modern.
  'timeline-dot': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '46px 50px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '26px',
      paddingBottom: '18px',
      borderBottom: '2px solid #14b8a6',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#0f766e',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#6b7280',
    },
    section: { marginBottom: '22px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#0f766e',
      marginBottom: '10px',
    },
    sectionContent: { marginTop: '8px' },
    item: {
      marginBottom: '16px',
      paddingLeft: '16px',
      borderLeft: '2px solid #99f6e4',
    },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#0d9488' },
    itemDate: { fontSize: '12px', fontWeight: 600, color: '#14b8a6', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '11.5px', backgroundColor: '#f0fdfa', color: '#0f766e', borderRadius: '9999px', border: '1px solid #99f6e4' },
  },

  // ─── 10. HEADER BAND (premium) ───────────────────────────────
  // Full-width indigo header band with white name/contact and photo;
  // clean single-column body below.
  'header-band': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '0px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      backgroundColor: '#4f46e5',
      padding: '36px 48px',
      display: 'flex',
      flexDirection: 'row-reverse' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px',
    },
    mainContent: {
      padding: '32px 48px',
      boxSizing: 'border-box' as const,
    },
    profilePhoto: { width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover' as const, border: '3px solid #c7d2fe', flexShrink: 0 },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#ffffff',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '12.5px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#e0e7ff',
    },
    section: { marginBottom: '22px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#4f46e5',
      marginBottom: '10px',
      paddingBottom: '5px',
      borderBottom: '1.5px solid #e0e7ff',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#4f46e5' },
    itemDate: { fontSize: '12px', color: '#6b7280', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '11.5px', backgroundColor: '#eef2ff', color: '#4338ca', borderRadius: '6px', border: '1px solid #c7d2fe' },
  },

  // ─── 11. SWISS GRID (premium) ────────────────────────────────
  // International Typographic Style: oversized uppercase name, red
  // accents, strict left alignment, zero decoration.
  'swiss-grid': {
    container: {
      fontFamily: "Helvetica, Arial, sans-serif",
      color: '#111111',
      lineHeight: '1.5',
      maxWidth: '100%',
      height: '100%',
      padding: '48px 52px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '32px',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '40px',
      fontWeight: 800,
      marginBottom: '6px',
      color: '#111111',
      letterSpacing: '-0.03em',
      textTransform: 'uppercase' as const,
      lineHeight: '1.05',
    },
    contact: {
      fontSize: '12.5px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      marginTop: '10px',
      color: '#525252',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      color: '#dc2626',
      marginBottom: '10px',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 700, color: '#111111', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#404040' },
    itemDate: { fontSize: '12px', color: '#737373', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.55', color: '#262626' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '8px' },
    skill: { padding: '3px 0px', fontSize: '12.5px', backgroundColor: 'transparent', color: '#111111', fontWeight: 600, border: 'none', borderBottom: '2px solid #dc2626' },
  },

  // ─── 12. WARM HUMANIST (premium) ─────────────────────────────
  // Warm serif typography, terracotta accents, italic subtitles,
  // generous 1.7 line-height. Inviting and personable.
  'warm-humanist': {
    container: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      color: '#292524',
      lineHeight: '1.7',
      maxWidth: '100%',
      height: '100%',
      padding: '50px 54px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '18px',
      borderBottom: '1px solid #fed7aa',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '32px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#7c2d12',
      letterSpacing: '0em',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#78716c',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#ea580c',
      marginBottom: '10px',
      paddingBottom: '6px',
      borderBottom: '1px solid #fed7aa',
      letterSpacing: '0.05em',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '18px' },
    itemTitle: { fontSize: '16px', fontWeight: 700, color: '#292524', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontStyle: 'italic' as const, color: '#9a3412' },
    itemDate: { fontSize: '12.5px', color: '#a8a29e', marginBottom: '6px' },
    itemDescription: { fontSize: '14px', whiteSpace: 'pre-line' as const, lineHeight: '1.7', color: '#44403c' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '8px' },
    skill: { padding: '4px 14px', fontSize: '12px', backgroundColor: '#fff7ed', color: '#9a3412', borderRadius: '3px', border: '1px solid #fed7aa' },
  },

  // ─── 13. COMPACT ATS (free) ──────────────────────────────────
  // Maximum single-page density and parser compatibility: Arial,
  // bold-only hierarchy, zero color, comma-style plain skills.
  'compact-ats': {
    container: {
      fontFamily: "Arial, Helvetica, sans-serif",
      color: '#111827',
      lineHeight: '1.45',
      maxWidth: '100%',
      height: '100%',
      padding: '24px 28px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '14px',
      paddingBottom: '10px',
      borderBottom: '1px solid #111827',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '22px',
      fontWeight: 700,
      marginBottom: '2px',
      color: '#000000',
      letterSpacing: '0em',
    },
    contact: {
      fontSize: '11px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '10px',
      marginTop: '4px',
      color: '#374151',
    },
    section: { marginBottom: '14px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      color: '#000000',
      marginBottom: '6px',
    },
    sectionContent: { marginTop: '4px' },
    item: { marginBottom: '10px' },
    itemTitle: { fontSize: '13px', fontWeight: 700, color: '#000000', marginBottom: '1px' },
    itemSubtitle: { fontSize: '12px', fontWeight: 400, color: '#374151' },
    itemDate: { fontSize: '11px', color: '#4b5563', marginBottom: '3px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line' as const, lineHeight: '1.45', color: '#1f2937' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginTop: '4px' },
    skill: { padding: '0px 6px 0px 0px', fontSize: '12px', backgroundColor: 'transparent', color: '#1f2937', border: 'none' },
  },

  // ─── 14. ELEGANT CONTRAST (premium) ──────────────────────────
  // Serif display name over sans body, thin gold hairline rules,
  // small-caps section titles. Understated luxury.
  'elegant-contrast': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#292524',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '50px 56px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid #d6b26e',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: '34px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#1c1917',
      letterSpacing: '0.01em',
    },
    contact: {
      fontSize: '12.5px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      marginTop: '10px',
      color: '#78716c',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.18em',
      color: '#b45309',
      marginBottom: '10px',
      paddingBottom: '6px',
      borderBottom: '1px solid #e7d3a8',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '17px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#1c1917', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#92400e' },
    itemDate: { fontSize: '12px', color: '#a8a29e', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.62', color: '#44403c' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '11.5px', backgroundColor: 'transparent', color: '#92400e', borderRadius: '0px', border: '1px solid #d6b26e' },
  },

  // ─── 15. DUO TONE (premium) ──────────────────────────────────
  // Light-gray right rail (contact, skills), sky-blue accents in the
  // white main column on the left.
  'duo-tone': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#0f172a',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    sidebar: {
      width: '30%',
      backgroundColor: '#f1f5f9',
      color: '#334155',
      padding: '40px 22px',
      boxSizing: 'border-box' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      borderLeft: '1px solid #e2e8f0',
    },
    mainContent: {
      flex: 1,
      padding: '40px 34px',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '22px',
      paddingBottom: '14px',
      borderBottom: '2px solid #0ea5e9',
    },
    profilePhoto: { width: '88px', height: '88px', borderRadius: '12px', objectFit: 'cover' as const, border: '2px solid #bae6fd', marginBottom: '6px' },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '2px',
      color: '#0ea5e9',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '12px',
      color: '#475569',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2px',
      marginTop: '4px',
      wordBreak: 'break-word' as const,
    },
    section: { marginBottom: '20px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#0284c7',
      marginBottom: '10px',
      paddingBottom: '5px',
      borderBottom: '1.5px solid #bae6fd',
    },
    sidebarSectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#0284c7',
      marginBottom: '10px',
      paddingBottom: '5px',
      borderBottom: '1.5px solid #cbd5e1',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#0284c7' },
    itemDate: { fontSize: '12px', color: '#64748b', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 10px', fontSize: '11.5px', backgroundColor: '#ffffff', color: '#0369a1', borderRadius: '6px', border: '1px solid #bae6fd' },
  },

  // ─── 16. BOLD HEADLINE (premium) ─────────────────────────────
  // Oversized 800-weight name over a thick amber underline block;
  // chunky uppercase section titles. Confident and modern.
  'bold-headline': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '46px 50px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '28px',
      paddingBottom: '18px',
      borderBottom: '6px solid #f59e0b',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '44px',
      fontWeight: 800,
      marginBottom: '4px',
      color: '#111827',
      letterSpacing: '-0.03em',
      lineHeight: '1.05',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      marginTop: '10px',
      color: '#6b7280',
    },
    section: { marginBottom: '24px' },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      color: '#111827',
      marginBottom: '10px',
      paddingBottom: '4px',
      borderBottom: '3px solid #f59e0b',
      display: 'inline-block',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '17px' },
    itemTitle: { fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '14px', fontWeight: 500, color: '#b45309' },
    itemDate: { fontSize: '12.5px', color: '#9ca3af', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '7px', marginTop: '8px' },
    skill: { padding: '5px 13px', fontSize: '12px', fontWeight: 600, backgroundColor: '#fffbeb', color: '#92400e', borderRadius: '4px', border: '1.5px solid #fcd34d' },
  },

  // ─── 17. SOFT CARDS (premium) ────────────────────────────────
  // Every section sits in a soft slate card with rounded corners and
  // a hairline border. Calm, contemporary, app-like.
  'soft-cards': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#334155',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '40px 44px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '20px',
      padding: '22px 24px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#6366f1',
      letterSpacing: '-0.02em',
    },
    contact: {
      fontSize: '12.5px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#64748b',
    },
    section: {
      marginBottom: '16px',
      padding: '18px 20px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      color: '#6366f1',
      marginBottom: '10px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#4f46e5' },
    itemDate: { fontSize: '12px', color: '#94a3b8', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#475569' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '6px' },
    skill: { padding: '4px 12px', fontSize: '11.5px', backgroundColor: '#ffffff', color: '#4f46e5', borderRadius: '8px', border: '1px solid #c7d2fe' },
  },

  // ─── 18. AZURE CLASSIC (premium) ─────────────────────────────
  // Conservative corporate: centered name over a thin double rule,
  // azure section titles, right-aligned-feel dates. Safe everywhere.
  'azure-classic': {
    container: {
      fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.55',
      maxWidth: '100%',
      height: '100%',
      padding: '44px 50px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '26px',
      paddingBottom: '16px',
      borderBottom: '3px double #1d4ed8',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#1e3a8a',
      letterSpacing: '0.02em',
    },
    contact: {
      fontSize: '12.5px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#4b5563',
      justifyContent: 'center',
    },
    section: { marginBottom: '22px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      color: '#1d4ed8',
      marginBottom: '10px',
      paddingBottom: '4px',
      borderBottom: '1px solid #bfdbfe',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontWeight: 500, color: '#1d4ed8' },
    itemDate: { fontSize: '12px', fontStyle: 'italic' as const, color: '#6b7280', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.55', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginTop: '8px' },
    skill: { padding: '4px 12px', fontSize: '11.5px', backgroundColor: '#eff6ff', color: '#1e40af', borderRadius: '3px', border: '1px solid #bfdbfe' },
  },

  // ─── 19. INK SERIF (premium) ─────────────────────────────────
  // Monochrome print look: small-caps serif name, hairline rules,
  // justified body text. Timeless, ink-on-paper feel.
  'ink-serif': {
    container: {
      fontFamily: "'Times New Roman', Georgia, serif",
      color: '#1f2937',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '50px 56px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    },
    header: {
      marginBottom: '26px',
      paddingBottom: '16px',
      borderBottom: '1px solid #111111',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '30px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#111111',
      letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '14px',
      marginTop: '8px',
      color: '#525252',
    },
    section: { marginBottom: '22px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.14em',
      color: '#111111',
      marginBottom: '10px',
      paddingBottom: '5px',
      borderBottom: '1px solid #d4d4d4',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '16px' },
    itemTitle: { fontSize: '15px', fontWeight: 700, color: '#111111', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13.5px', fontStyle: 'italic' as const, color: '#404040' },
    itemDate: { fontSize: '12.5px', color: '#737373', marginBottom: '5px' },
    itemDescription: { fontSize: '13.5px', whiteSpace: 'pre-line' as const, lineHeight: '1.6', color: '#262626', textAlign: 'justify' as const },
    skillsList: { display: 'flex', flexWrap: 'wrap' as const, gap: '10px', marginTop: '8px' },
    skill: { padding: '2px 0px', fontSize: '13px', backgroundColor: 'transparent', color: '#111111', border: 'none', borderBottom: '1px solid #a3a3a3' },
  },

  // ─── 1. ATLANTIC BLUE ─────────────────────────────────────────
  'atlantic-blue': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1e293b',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    sidebar: {
      width: '35%',
      backgroundColor: '#1e293b',
      color: '#f8fafc',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
    },
    mainContent: {
      width: '65%',
      padding: '40px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '15px',
      border: '3px solid #3b82f6',
    },
    name: {
      fontSize: '24px',
      fontWeight: 800,
      color: '#ffffff',
      marginBottom: '4px',
      letterSpacing: '-0.025em',
    },
    contact: {
      fontSize: '11px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      color: '#94a3b8',
    },
    section: { marginBottom: '16px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#1e293b',
      borderBottom: '2.5px solid #3b82f6',
      paddingBottom: '4px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sidebarSectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#3b82f6',
      borderBottom: '1px solid #475569',
      paddingBottom: '4px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '12.5px', fontWeight: 500, color: '#3b82f6' },
    itemDate: { fontSize: '11px', color: '#64748b', marginBottom: '4px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', lineHeight: '1.5', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#f1f5f9', color: '#1e293b', borderRadius: '4px', border: '1px solid #e2e8f0' },
  },

  // ─── 2. MERCURY FLOW ─────────────────────────────────────────
  'mercury-flow': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      padding: '50px 60px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    profilePhoto: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '12px',
    },
    name: {
      fontSize: '32px',
      fontWeight: 700,
      fontFamily: 'Georgia, serif',
      color: '#111827',
      marginBottom: '6px',
    },
    contact: {
      fontSize: '12px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '12px',
      color: '#6b7280',
    },
    section: { marginBottom: '20px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#14b8a6',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '4px',
      marginBottom: '12px',
      letterSpacing: '1.5px',
      textAlign: 'center',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '14px', display: 'flex', gap: '15px' },
    itemTitle: { fontSize: '14px', fontWeight: 700, color: '#111827' },
    itemSubtitle: { fontSize: '13px', color: '#4b5563' },
    itemDate: { fontSize: '11px', color: '#9ca3af', width: '120px', flexShrink: 0 },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', lineHeight: '1.5', color: '#4b5563' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#f3f4f6', color: '#1f2937', borderRadius: '4px' },
  },

  // ─── 3. STEADY FORM ─────────────────────────────────────────
  'steady-form': {
    container: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      color: '#111827',
      lineHeight: '1.6',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      padding: '50px 60px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '35px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      objectFit: 'cover',
      position: 'absolute',
      right: '0px',
      top: '0px',
      border: '1px solid #d1d5db',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#111827',
      marginBottom: '6px',
    },
    contact: {
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      color: '#4b5563',
      maxWidth: '75%',
    },
    section: { marginBottom: '22px' },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#111827',
      borderBottom: '1px solid #111827',
      paddingBottom: '3px',
      marginBottom: '12px',
      letterSpacing: '1px',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14.5px', fontWeight: 700, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '13px', fontStyle: 'italic', color: '#374151' },
    itemDate: { fontSize: '11px', color: '#6b7280', marginBottom: '3px' },
    itemDescription: { fontSize: '12.5px', whiteSpace: 'pre-line', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' },
    skill: { padding: '2px 0px', fontSize: '12.5px', color: '#111827', borderBottom: '1px dashed #9ca3af' },
  },

  // ─── 4. CLASSIC CLEAR ─────────────────────────────────────────
  'classic-clear': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      padding: '45px 50px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '28px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '34px',
      fontWeight: 800,
      color: '#111827',
      marginBottom: '6px',
      letterSpacing: '-0.025em',
    },
    contact: {
      fontSize: '12px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '14px',
      color: '#4b5563',
    },
    section: { marginBottom: '20px' },
    sectionTitle: {
      fontSize: '12.5px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#111827',
      borderBottom: '3px solid #2563eb',
      paddingBottom: '3px',
      marginBottom: '12px',
      letterSpacing: '1px',
    },
    sectionContent: { marginTop: '8px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 700, color: '#111827' },
    itemSubtitle: { fontSize: '13px', fontWeight: 500, color: '#2563eb' },
    itemDate: { fontSize: '11.5px', color: '#6b7280', marginBottom: '3px' },
    itemDescription: { fontSize: '12.5px', whiteSpace: 'pre-line', color: '#4b5563' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', border: '1px solid #d1d5db', color: '#374151', borderRadius: '4px' },
  },

  // ─── 5. EDITORIAL RULE ─────────────────────────────────────────
  'editorial-rule': {
    container: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      color: '#262626',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      padding: '45px 55px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '26px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#171717',
      marginBottom: '4px',
      letterSpacing: '0.5px',
    },
    contact: {
      fontSize: '11.5px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '12px',
      color: '#525252',
    },
    section: { marginBottom: '18px' },
    sectionTitle: {
      fontSize: '11.5px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#171717',
      borderBottom: '1px solid #262626',
      paddingBottom: '2px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '12px' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#171717' },
    itemSubtitle: { fontSize: '12.5px', color: '#404040' },
    itemDate: { fontSize: '11px', color: '#737373', marginBottom: '2px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', color: '#404040' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' },
    skill: { padding: '2px 0px', fontSize: '12px', color: '#262626' },
  },

  // ─── 6. HUNTER GREEN ─────────────────────────────────────────
  'hunter-green': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1e293b',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    sidebar: {
      width: '35%',
      backgroundColor: '#166534',
      color: '#ffffff',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
    },
    mainContent: {
      width: '65%',
      padding: '40px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#166534',
      marginBottom: '4px',
      letterSpacing: '-0.025em',
    },
    contact: {
      fontSize: '11px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      color: '#94a3b8',
    },
    section: { marginBottom: '16px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#166534',
      borderBottom: '2.5px solid #166534',
      paddingBottom: '4px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sidebarSectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#ffffff',
      borderBottom: '1px solid #15803d',
      paddingBottom: '4px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '12.5px', fontWeight: 500, color: '#166534' },
    itemDate: { fontSize: '11px', color: '#64748b', marginBottom: '4px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', lineHeight: '1.5', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#15803d', color: '#ffffff', borderRadius: '4px' },
  },

  // ─── 7. COBALT EDGE ─────────────────────────────────────────
  'cobalt-edge': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1e293b',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      backgroundColor: '#1e3a8a',
      color: '#ffffff',
      padding: '35px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sidebar: {
      width: '30%',
      backgroundColor: '#f3f4f6',
      color: '#1f2937',
      padding: '25px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box',
    },
    mainContent: {
      width: '70%',
      padding: '35px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box',
    },
    profilePhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #ffffff',
    },
    name: {
      fontSize: '28px',
      fontWeight: 800,
      color: '#ffffff',
      marginBottom: '4px',
    },
    contact: {
      fontSize: '11.5px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      color: '#93c5fd',
    },
    section: { marginBottom: '18px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#1e3a8a',
      borderBottom: '2px solid #1e3a8a',
      paddingBottom: '4px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sidebarSectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#1f2937',
      borderBottom: '1px solid #d1d5db',
      paddingBottom: '4px',
      marginBottom: '10px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '12px' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#0f172a' },
    itemSubtitle: { fontSize: '12px', color: '#1e3a8a' },
    itemDate: { fontSize: '11px', color: '#64748b', marginBottom: '2px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#e5e7eb', color: '#1f2937', borderRadius: '4px' },
  },

  // ─── 8. BLUE NEON ─────────────────────────────────────────
  'blue-neon': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.55',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      padding: '40px 45px',
      borderLeft: '8px solid #2563eb',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    profilePhoto: {
      width: '85px',
      height: '85px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #2563eb',
    },
    name: {
      fontSize: '30px',
      fontWeight: 800,
      color: '#111827',
      letterSpacing: '-0.03em',
      marginBottom: '4px',
    },
    contact: {
      fontSize: '11.5px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      color: '#4b5563',
    },
    section: { marginBottom: '18px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#2563eb',
      letterSpacing: '1px',
      marginBottom: '10px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '12px' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#111827' },
    itemSubtitle: { fontSize: '12.5px', color: '#2563eb' },
    itemDate: { fontSize: '11px', color: '#6b7280', marginBottom: '2px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', color: '#4b5563' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '4px' },
  },

  // ─── 9. PRECISION LINE ─────────────────────────────────────────
  'precision-line': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      padding: '35px 40px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '15px',
    },
    profilePhoto: {
      width: '75px',
      height: '75px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    name: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#111827',
      marginBottom: '2px',
    },
    contact: {
      fontSize: '11px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      color: '#4b5563',
      textAlign: 'right' as const,
    },
    section: { marginBottom: '16px' },
    sectionTitle: {
      fontSize: '11.5px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#111827',
      borderBottom: '1.5px solid #111827',
      paddingBottom: '3px',
      marginBottom: '8px',
    },
    sectionContent: { marginTop: '4px' },
    item: { marginBottom: '10px' },
    itemTitle: { fontSize: '13px', fontWeight: 700, color: '#111827' },
    itemSubtitle: { fontSize: '12px', fontWeight: 500, color: '#374151' },
    itemDate: { fontSize: '10.5px', color: '#6b7280', marginBottom: '1px' },
    itemDescription: { fontSize: '11.5px', whiteSpace: 'pre-line', color: '#4b5563' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' },
    skill: { padding: '2px 6px', fontSize: '10.5px', border: '1px solid #d1d5db', color: '#374151', borderRadius: '3px' },
  },

  // ─── 10. SAFFRON LINE ─────────────────────────────────────────
  'saffron-line': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#2d3748',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      padding: '40px 45px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    profilePhoto: { width: '0px', height: '0px', display: 'none' },
    name: {
      fontSize: '32px',
      fontWeight: 800,
      color: '#1a202c',
      marginBottom: '4px',
    },
    contact: {
      fontSize: '11.5px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '12px',
      color: '#718096',
    },
    section: { marginBottom: '18px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#d97706',
      borderLeft: '4px solid #d97706',
      paddingLeft: '8px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '12px' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#1a202c' },
    itemSubtitle: { fontSize: '12px', color: '#d97706' },
    itemDate: { fontSize: '11px', color: '#718096', marginBottom: '2px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', color: '#4a5568' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '4px' },
  },

  // ─── 11. CHARCOAL GLOW ─────────────────────────────────────────
  'charcoal-glow': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1e293b',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    header: {
      backgroundColor: '#1f2937',
      color: '#ffffff',
      padding: '35px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sidebar: {
      width: '30%',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      padding: '25px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box',
    },
    mainContent: {
      width: '70%',
      padding: '35px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box',
    },
    profilePhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #ffffff',
    },
    name: {
      fontSize: '28px',
      fontWeight: 800,
      color: '#ffffff',
      marginBottom: '4px',
    },
    contact: {
      fontSize: '11.5px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      color: '#cbd5e1',
    },
    section: { marginBottom: '18px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#1f2937',
      borderBottom: '2px solid #1f2937',
      paddingBottom: '4px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sidebarSectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#1e293b',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '4px',
      marginBottom: '10px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '12px' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#0f172a' },
    itemSubtitle: { fontSize: '12px', color: '#4b5563' },
    itemDate: { fontSize: '11px', color: '#64748b', marginBottom: '2px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#e2e8f0', color: '#1e293b', borderRadius: '4px' },
  },

  // ─── 12. QUICKSILVER ─────────────────────────────────────────
  'quicksilver': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1f2937',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    sidebar: {
      width: '35%',
      backgroundColor: '#e5e7eb',
      color: '#111827',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
    },
    mainContent: {
      width: '65%',
      padding: '40px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '15px',
      border: '2px solid #9ca3af',
    },
    name: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#111827',
      marginBottom: '4px',
      letterSpacing: '-0.025em',
    },
    contact: {
      fontSize: '11.5px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      color: '#4b5563',
    },
    section: { marginBottom: '16px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#111827',
      borderBottom: '2.5px solid #111827',
      paddingBottom: '4px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sidebarSectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#111827',
      borderBottom: '1px solid #d1d5db',
      paddingBottom: '4px',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px' },
    itemSubtitle: { fontSize: '12.5px', fontWeight: 500, color: '#4b5563' },
    itemDate: { fontSize: '11px', color: '#6b7280', marginBottom: '4px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', lineHeight: '1.5', color: '#374151' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#f3f4f6', color: '#1f2937', borderRadius: '4px' },
  },

  // ─── 13. ALMOST BLACK ─────────────────────────────────────────
  'almost-black': {
    container: {
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#e2e8f0',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#0f172a',
      padding: '45px 50px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #334155',
      paddingBottom: '15px',
    },
    profilePhoto: {
      width: '85px',
      height: '85px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #38bdf8',
    },
    name: {
      fontSize: '32px',
      fontWeight: 800,
      color: '#f8fafc',
      marginBottom: '4px',
      letterSpacing: '-0.025em',
    },
    contact: {
      fontSize: '11.5px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      color: '#94a3b8',
    },
    section: { marginBottom: '18px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#38bdf8',
      letterSpacing: '1px',
      marginBottom: '10px',
      borderBottom: '1px solid #334155',
      paddingBottom: '4px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '12px' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#f8fafc' },
    itemSubtitle: { fontSize: '12.5px', color: '#38bdf8' },
    itemDate: { fontSize: '11px', color: '#94a3b8', marginBottom: '2px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', color: '#cbd5e1' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '3px 8px', fontSize: '11px', backgroundColor: '#1e293b', color: '#38bdf8', borderRadius: '4px', border: '1px solid #334155' },
  },

  // ─── 14. TYPEWRITER PHOTO ─────────────────────────────────────────
  'typewriter-photo': {
    container: {
      fontFamily: "'Courier New', Courier, monospace",
      color: '#1a1a1a',
      lineHeight: '1.5',
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    },
    sidebar: {
      width: '35%',
      backgroundColor: '#242424',
      backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 9px)',
      color: '#ffffff',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
    },
    mainContent: {
      width: '65%',
      padding: '40px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column',
    },
    profilePhoto: {
      width: '92px',
      height: '92px',
      borderRadius: '8px',
      objectFit: 'cover',
      border: '3px solid rgba(255,255,255,0.85)',
      marginBottom: '6px',
    },
    name: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#ffffff',
      marginBottom: '4px',
    },
    contact: {
      fontSize: '11px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      color: '#e2e8f0',
    },
    section: { marginBottom: '16px' },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#1a1a1a',
      borderBottom: '1px solid #1a1a1a',
      paddingBottom: '4px',
      marginBottom: '10px',
    },
    sidebarSectionTitle: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#ffffff',
      borderBottom: '1px solid #ffffff',
      paddingBottom: '4px',
      marginBottom: '10px',
    },
    sectionContent: { marginTop: '6px' },
    item: { marginBottom: '14px' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' },
    itemSubtitle: { fontSize: '12px', fontStyle: 'italic', color: '#4a4a4a' },
    itemDate: { fontSize: '11px', color: '#666666', marginBottom: '4px' },
    itemDescription: { fontSize: '12px', whiteSpace: 'pre-line', lineHeight: '1.5', color: '#1a1a1a' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' },
    skill: { padding: '2px 0px', fontSize: '11px', color: '#ffffff', borderBottom: '1px dashed #ffffff' },
  },

  // ─── HARBOR SERIF ─────────────────────────────────────────
  // Original editorial single-column design with strong scan hierarchy.
  'harbor-serif': {
    container: {
      fontFamily: "'Inter', Arial, sans-serif",
      color: '#172033',
      lineHeight: '1.55',
      width: '794px',
      minHeight: '1123px',
      padding: '50px 58px',
      backgroundColor: '#ffffff',
      borderTop: '10px solid #164e63',
      boxSizing: 'border-box',
    },
    header: { marginBottom: '28px', paddingBottom: '18px', borderBottom: '1px solid #cbd5e1' },
    name: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '34px', fontWeight: 700, color: '#164e63', letterSpacing: '-0.5px', marginBottom: '8px' },
    contact: { display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: '11.5px', color: '#475569' },
    section: { marginBottom: '22px' },
    sectionTitle: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '15px', fontWeight: 700, color: '#164e63', borderBottom: '2px solid #99f6e4', paddingBottom: '5px', marginBottom: '11px' },
    sectionContent: { marginTop: '4px' },
    item: { marginBottom: '15px', breakInside: 'avoid' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#172033' },
    itemSubtitle: { fontSize: '12px', fontWeight: 600, color: '#0f766e' },
    itemDate: { fontSize: '10.5px', color: '#64748b', marginBottom: '4px' },
    itemDescription: { fontSize: '11.5px', lineHeight: '1.55', whiteSpace: 'pre-line', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px 10px' },
    skill: { fontSize: '11px', padding: '3px 8px', border: '1px solid #99f6e4', borderRadius: '3px', color: '#164e63', backgroundColor: 'transparent' },
    profilePhoto: { display: 'none' },
  },

  // ─── COLUMN LEDGER ────────────────────────────────────────
  // Light right rail with dense executive content on the left.
  'column-ledger': {
    container: { fontFamily: "'Inter', Arial, sans-serif", color: '#292524', lineHeight: '1.5', width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', boxSizing: 'border-box' },
    sidebar: { width: '31%', padding: '42px 24px', backgroundColor: '#f5f0e8', color: '#292524', boxSizing: 'border-box' },
    mainContent: { width: '69%', padding: '46px 40px', boxSizing: 'border-box' },
    header: { marginBottom: '18px' },
    name: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '29px', lineHeight: '1.05', fontWeight: 700, color: '#292524', marginBottom: '14px' },
    contact: { display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '10.5px', color: '#57534e' },
    section: { marginBottom: '19px' },
    sectionTitle: { fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.4px', color: '#9a3412', borderBottom: '1px solid #d6d3d1', paddingBottom: '5px', marginBottom: '10px' },
    sidebarSectionTitle: { fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#9a3412', borderBottom: '1px solid #d6d3d1', paddingBottom: '5px', marginBottom: '9px' },
    sectionContent: { marginTop: '4px' },
    item: { marginBottom: '14px', breakInside: 'avoid' },
    itemTitle: { fontSize: '13px', fontWeight: 700, color: '#292524' },
    itemSubtitle: { fontSize: '11.5px', color: '#9a3412', fontWeight: 600 },
    itemDate: { fontSize: '10px', color: '#78716c', marginBottom: '4px' },
    itemDescription: { fontSize: '11.25px', lineHeight: '1.5', whiteSpace: 'pre-line', color: '#44403c' },
    skillsList: { display: 'flex', flexDirection: 'column', gap: '5px' },
    skill: { fontSize: '10.5px', color: '#44403c', paddingBottom: '3px', borderBottom: '1px dotted #d6d3d1', backgroundColor: 'transparent' },
    profilePhoto: { width: '78px', height: '78px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px', border: '2px solid #9a3412' },
  },

  // ─── GRADUATE FOCUS ───────────────────────────────────────
  // Friendly header band and clean ATS-safe body for early-career users.
  'graduate-focus': {
    container: { fontFamily: "'Inter', Arial, sans-serif", color: '#1e293b', lineHeight: '1.55', width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', boxSizing: 'border-box' },
    header: { backgroundColor: '#1d4ed8', color: '#ffffff', padding: '34px 52px 30px', marginBottom: '0' },
    mainContent: { padding: '38px 52px 48px', boxSizing: 'border-box' },
    name: { fontSize: '32px', lineHeight: '1.1', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '8px' },
    contact: { display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: '11px', color: '#dbeafe' },
    section: { marginBottom: '21px' },
    sectionTitle: { fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.6px', color: '#1d4ed8', borderBottom: '2px solid #bfdbfe', paddingBottom: '5px', marginBottom: '10px' },
    sectionContent: { marginTop: '4px' },
    item: { marginBottom: '14px', breakInside: 'avoid' },
    itemTitle: { fontSize: '13.5px', fontWeight: 700, color: '#172554' },
    itemSubtitle: { fontSize: '11.75px', color: '#2563eb', fontWeight: 600 },
    itemDate: { fontSize: '10.5px', color: '#64748b', marginBottom: '4px' },
    itemDescription: { fontSize: '11.5px', lineHeight: '1.55', whiteSpace: 'pre-line', color: '#334155' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    skill: { fontSize: '10.5px', padding: '3px 8px', borderRadius: '999px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    profilePhoto: { display: 'none' },
  },

  // ─── STUDIO GRID ──────────────────────────────────────────
  // Original monochrome portfolio layout with a compact dark rail.
  'studio-grid': {
    container: { fontFamily: "'Inter', Arial, sans-serif", color: '#18181b', lineHeight: '1.48', width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', boxSizing: 'border-box' },
    sidebar: { width: '32%', padding: '38px 25px', backgroundColor: '#27272a', color: '#fafafa', boxSizing: 'border-box' },
    mainContent: { width: '68%', padding: '42px 38px', boxSizing: 'border-box' },
    header: { marginBottom: '18px' },
    name: { fontSize: '27px', lineHeight: '1.05', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '12px' },
    contact: { display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '10.5px', color: '#d4d4d8' },
    section: { marginBottom: '18px' },
    sectionTitle: { fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.4px', color: '#18181b', borderLeft: '4px solid #f97316', paddingLeft: '8px', marginBottom: '10px' },
    sidebarSectionTitle: { fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.3px', color: '#fb923c', borderBottom: '1px solid #52525b', paddingBottom: '5px', marginBottom: '9px' },
    sectionContent: { marginTop: '4px' },
    item: { marginBottom: '14px', breakInside: 'avoid' },
    itemTitle: { fontSize: '13px', fontWeight: 750, color: '#18181b' },
    itemSubtitle: { fontSize: '11.5px', color: '#c2410c', fontWeight: 600 },
    itemDate: { fontSize: '10px', color: '#71717a', marginBottom: '4px' },
    itemDescription: { fontSize: '11.25px', lineHeight: '1.5', whiteSpace: 'pre-line', color: '#3f3f46' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
    skill: { fontSize: '10px', padding: '3px 6px', color: '#fafafa', border: '1px solid #71717a', backgroundColor: 'transparent' },
    profilePhoto: { width: '86px', height: '86px', borderRadius: '4px', objectFit: 'cover', marginBottom: '16px' },
  },
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA FOR TEMPLATE PREVIEWS
// ═══════════════════════════════════════════════════════════════

export const templateMockData: Record<string, ResumeData> = {
  'clean-slate': {
    personal: {
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '(555) 123-4567',
      address: 'San Francisco, CA',
      summary: 'Product-focused software engineer with 6+ years building modern user experiences and scalable systems.',
      website: 'alexjohnson.dev',
      linkedin: 'linkedin.com/in/alexjohnson',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Senior Software Engineer', company: 'Tech Dynamix', location: 'Remote', startDate: 'Apr 2020', endDate: '', current: true, description: 'Lead React/TypeScript projects; mentoring 8 engineers; designed authentication and cloud integrations.' },
      { id: 2, title: 'Frontend Developer', company: 'Pixel Rocket', location: 'San Jose, CA', startDate: 'Jan 2018', endDate: 'Mar 2020', current: false, description: 'Developed robust web interfaces for SaaS platform used by Fortune 500 partners.' },
    ],
    education: [{ id: 1, school: 'UC Berkeley', degree: 'B.Sc.', field: 'Computer Science', startDate: '2014', endDate: '2017', description: '' }],
    skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Cloud', 'REST APIs'],
    projects: [{ id: 1, title: 'Realtime Collaboration App', description: 'In-browser team editor with live presence.', technologies: ['React', 'Socket.IO', 'AWS'], link: '' }],
    customization: { primaryColor: '#2563eb', fontSize: 'medium', spacing: 'normal' },
  },
  'executive-serif': {
    personal: {
      name: 'James Wellington III',
      email: 'j.wellington@email.com',
      phone: '(555) 456-7890',
      address: 'New York, NY',
      summary: 'C-suite executive with 20+ years driving P&L growth across technology and financial services.',
      linkedin: 'linkedin.com/in/jameswellington',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Chief Operating Officer', company: 'Pinnacle Financial Group', location: 'New York, NY', startDate: 'Jan 2020', endDate: '', current: true, description: 'Oversee $2.4B revenue operations with 1,200+ employees. Drove 34% YoY growth.' },
      { id: 2, title: 'SVP of Strategy', company: 'Atlantic Capital Partners', location: 'Boston, MA', startDate: 'Mar 2015', endDate: 'Dec 2019', current: false, description: 'Led corporate strategy. Executed 3 major acquisitions totaling $850M.' },
    ],
    education: [{ id: 1, school: 'Harvard Business School', degree: 'MBA', field: 'Finance & Strategy', startDate: '2008', endDate: '2010', description: '' }],
    skills: ['Strategic Planning', 'P&L Management', 'M&A', 'Board Relations', 'Executive Leadership'],
    projects: [],
    customization: { primaryColor: '#0f172a', fontSize: 'large', spacing: 'spacious' },
  },
  'sidebar-modern': {
    personal: {
      name: 'Charlotte Evans',
      email: 'charlotte.evans@example.com',
      phone: '+44 7123 456789',
      address: 'London, UK',
      summary: 'Marketing strategist with a creative eye for branding and 7 years of campaign management experience.',
      website: 'charlotte-evans.com',
      linkedin: 'linkedin.com/in/charlotteevans',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Lead Marketing Strategist', company: 'Visionary Brands', location: 'London', startDate: '2019', endDate: '', current: true, description: 'Increased conversions by 40% with integrated digital campaigns targeting UK retail sector.' },
    ],
    education: [{ id: 1, school: 'University of Oxford', degree: 'MA', field: 'Marketing', startDate: '2015', endDate: '2018', description: '' }],
    skills: ['Digital Marketing', 'Copywriting', 'Brand Development', 'Team Leadership'],
    projects: [{ id: 1, title: 'Brand Relaunch for XCORP', description: 'Rebranded a national franchise.', technologies: ['Branding', 'UX'], link: '' }],
    customization: { primaryColor: '#7c3aed', fontSize: 'medium', spacing: 'normal' },
  },
  'tech-engineer': {
    personal: {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '(555) 567-8901',
      address: 'Austin, TX',
      summary: 'DevOps engineer and SRE with deep Kubernetes expertise. Reduced infra costs 40% while improving uptime to 99.99%.',
      website: 'priyasharma.io',
      linkedin: 'linkedin.com/in/priyasharma',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Senior DevOps Engineer', company: 'ScaleUp Cloud', location: 'Austin, TX', startDate: 'Apr 2020', endDate: '', current: true, description: 'Architected multi-region K8s clusters serving 50M+ users. Built GitOps pipelines.' },
      { id: 2, title: 'Cloud Engineer', company: 'TechBridge Solutions', location: 'Dallas, TX', startDate: 'Jun 2017', endDate: 'Mar 2020', current: false, description: 'Migrated legacy infrastructure to AWS, achieving 40% cost reduction.' },
    ],
    education: [{ id: 1, school: 'UT Austin', degree: 'B.S.', field: 'Computer Engineering', startDate: '2013', endDate: '2017', description: '' }],
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'Python', 'Prometheus', 'ArgoCD'],
    projects: [],
    customization: { primaryColor: '#22d3ee', fontSize: 'medium', spacing: 'normal' },
  },
  'coral-creative': {
    personal: {
      name: 'Taylor Rodriguez',
      email: 'taylor.rodriguez@example.com',
      phone: '(555) 456-7890',
      address: 'Austin, TX',
      summary: 'Creative designer specializing in UI/UX, brand identity, and digital media with 6 years of agency experience.',
      website: 'taylor-design.co',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Senior UX Designer', company: 'CreativeSpace Agency', location: 'Austin, TX', startDate: 'Mar 2022', endDate: '', current: true, description: 'Led the redesign of client flagship product, increasing user engagement by 40%.' },
      { id: 2, title: 'UI Designer', company: 'Digital Innovations', location: 'Houston, TX', startDate: 'Jun 2019', endDate: 'Feb 2022', current: false, description: 'Designed user interfaces for web and mobile applications.' },
    ],
    education: [{ id: 1, school: 'RISD', degree: "Bachelor's", field: 'Graphic Design', startDate: '2015', endDate: '2019', description: '' }],
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Wireframing', 'Prototyping', 'User Research'],
    projects: [{ id: 1, title: 'Fitness App Redesign', description: 'Complete redesign focusing on usability and visual appeal.', technologies: ['Figma', 'Photoshop'], link: '' }],
    customization: { primaryColor: '#e11d48', fontSize: 'medium', spacing: 'normal' },
  },
  'navy-professional': {
    personal: {
      name: 'Michael Torres',
      email: 'michael.torres@email.com',
      phone: '(555) 789-0123',
      address: 'Washington, DC',
      summary: 'Strategic management consultant with 12 years advising Fortune 100 companies on digital transformation.',
      linkedin: 'linkedin.com/in/michaeltorres',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Principal Consultant', company: 'McKinsey & Company', location: 'Washington, DC', startDate: 'Feb 2019', endDate: '', current: true, description: 'Lead engagement teams on $5M+ transformation projects for federal and private sector clients.' },
      { id: 2, title: 'Senior Associate', company: 'Deloitte Consulting', location: 'New York, NY', startDate: 'Jul 2014', endDate: 'Jan 2019', current: false, description: 'Delivered strategy engagements generating $30M+ in client value.' },
    ],
    education: [{ id: 1, school: 'Georgetown University', degree: 'MBA', field: 'Strategy & Finance', startDate: '2012', endDate: '2014', description: '' }],
    skills: ['Strategy Consulting', 'Digital Transformation', 'Change Management', 'Financial Modeling', 'Executive Presentations'],
    projects: [],
    customization: { primaryColor: '#1e3a5f', fontSize: 'medium', spacing: 'normal' },
  },
  'emerald-minimal': {
    personal: {
      name: 'Emma Larsson',
      email: 'emma.larsson@email.com',
      phone: '(555) 678-9012',
      address: 'San Francisco, CA',
      summary: 'Product designer with 7 years crafting user-centered digital experiences for SaaS products.',
      website: 'emmalarsson.design',
      linkedin: 'linkedin.com/in/emmalarsson',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Lead Product Designer', company: 'Notion Labs', location: 'San Francisco, CA', startDate: 'Sep 2021', endDate: '', current: true, description: 'Lead design for core features used by 30M+ users. Built design system with 200+ components.' },
      { id: 2, title: 'Senior UX Designer', company: 'Figma', location: 'San Francisco, CA', startDate: 'Jan 2019', endDate: 'Aug 2021', current: false, description: 'Designed collaboration features increasing user engagement by 45%.' },
    ],
    education: [{ id: 1, school: 'RISD', degree: 'BFA', field: 'Graphic Design', startDate: '2013', endDate: '2017', description: '' }],
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility', 'HTML/CSS'],
    projects: [],
    customization: { primaryColor: '#059669', fontSize: 'medium', spacing: 'normal' },
  },

  // ─── FlowCreate Studio collection mock data ───────────────────

  'atlantic-blue': {
    personal: {
      name: 'Marcus Chen',
      email: 'marcus.chen@email.com',
      phone: '(415) 555-0192',
      address: 'Seattle, WA',
      summary: 'Solutions architect with 10+ years designing cloud-native systems for enterprise clients across finance and healthcare sectors.',
      linkedin: 'linkedin.com/in/marcuschen',
      website: 'marcuschen.dev',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Principal Solutions Architect', company: 'Amazon Web Services', location: 'Seattle, WA', startDate: 'Jan 2020', endDate: '', current: true, description: 'Architected multi-cloud platforms for Fortune 500 clients. Led 12-person engineering team delivering $40M in infrastructure savings.' },
      { id: 2, title: 'Senior Cloud Engineer', company: 'Microsoft Azure', location: 'Redmond, WA', startDate: 'Jun 2016', endDate: 'Dec 2019', current: false, description: 'Built highly available distributed systems serving 10M+ daily active users across 3 regions.' },
    ],
    education: [{ id: 1, school: 'University of Washington', degree: 'M.S.', field: 'Computer Science', startDate: '2010', endDate: '2012', description: '' }],
    skills: ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'Python', 'System Design', 'gRPC'],
    projects: [],
    customization: { primaryColor: '#3b82f6', fontSize: 'medium', spacing: 'normal' },
  },
  'mercury-flow': {
    personal: {
      name: 'Sophie Andersson',
      email: 'sophie.andersson@email.com',
      phone: '+46 70 123 4567',
      address: 'Stockholm, Sweden',
      summary: 'Product manager bridging design and engineering to launch data-driven features at scale. 8 years in SaaS, B2B, and fintech.',
      linkedin: 'linkedin.com/in/sophieandersson',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Senior Product Manager', company: 'Spotify', location: 'Stockholm', startDate: 'Mar 2021', endDate: '', current: true, description: 'Own the Discover Weekly recommendation product. Grew weekly engaged users by 22% in 18 months.' },
      { id: 2, title: 'Product Manager', company: 'Klarna', location: 'Stockholm', startDate: 'Jan 2018', endDate: 'Feb 2021', current: false, description: 'Led checkout flow redesign reducing drop-off by 18% and adding €12M annual revenue.' },
    ],
    education: [{ id: 1, school: 'Stockholm School of Economics', degree: 'M.Sc.', field: 'Business & Technology', startDate: '2013', endDate: '2015', description: '' }],
    skills: ['Product Strategy', 'A/B Testing', 'SQL', 'Figma', 'Roadmapping', 'Agile'],
    projects: [],
    customization: { primaryColor: '#14b8a6', fontSize: 'medium', spacing: 'normal' },
  },
  'steady-form': {
    personal: {
      name: 'Dr. Lena Fischer',
      email: 'l.fischer@university.edu',
      phone: '+49 89 1234 5678',
      address: 'Munich, Germany',
      summary: 'Research scientist and lecturer specializing in machine learning applications for biomedical imaging. Published 40+ peer-reviewed papers.',
      linkedin: 'linkedin.com/in/lenafischer',
      website: 'lenafischer.research.de',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Associate Professor', company: 'Technical University of Munich', location: 'Munich, DE', startDate: 'Sep 2019', endDate: '', current: true, description: 'Lead ML for Healthcare lab with 15 PhD students. Secured €3.2M in DFG research grants.' },
      { id: 2, title: 'Postdoctoral Researcher', company: 'ETH Zürich', location: 'Zürich, CH', startDate: 'Jan 2016', endDate: 'Aug 2019', current: false, description: 'Developed neural architectures for 3D MRI segmentation. Best Paper Award at MICCAI 2018.' },
    ],
    education: [{ id: 1, school: 'University of Heidelberg', degree: 'Ph.D.', field: 'Computer Science', startDate: '2012', endDate: '2015', description: 'Thesis: Deep Learning Approaches for Medical Image Analysis' }],
    skills: ['Python', 'PyTorch', 'Medical Imaging', 'Research', 'Statistics', 'Grant Writing'],
    projects: [],
    customization: { primaryColor: '#111827', fontSize: 'medium', spacing: 'normal' },
  },
  'classic-clear': {
    personal: {
      name: 'Daniel Park',
      email: 'daniel.park@email.com',
      phone: '(213) 555-9834',
      address: 'Los Angeles, CA',
      summary: 'Financial analyst and investment strategist with expertise in equity research and portfolio management across tech and consumer sectors.',
      linkedin: 'linkedin.com/in/danielpark',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Vice President — Equity Research', company: 'Goldman Sachs', location: 'Los Angeles, CA', startDate: 'Jul 2019', endDate: '', current: true, description: 'Cover technology sector ($2T+ market cap). Top-ranked analyst for three consecutive years by Institutional Investor.' },
      { id: 2, title: 'Analyst', company: 'JPMorgan Chase', location: 'New York, NY', startDate: 'Aug 2015', endDate: 'Jun 2019', current: false, description: 'Built financial models and DCF valuations for M&A transactions totaling $18B.' },
    ],
    education: [{ id: 1, school: 'Wharton School, UPenn', degree: 'MBA', field: 'Finance', startDate: '2013', endDate: '2015', description: '' }],
    skills: ['Financial Modeling', 'DCF Valuation', 'Bloomberg Terminal', 'Equity Research', 'Python', 'Excel VBA'],
    projects: [],
    customization: { primaryColor: '#2563eb', fontSize: 'medium', spacing: 'normal' },
  },
  'editorial-rule': {
    personal: {
      name: 'Catherine Moreau',
      email: 'c.moreau@writersmail.com',
      phone: '+33 6 12 34 56 78',
      address: 'Paris, France',
      summary: 'Investigative journalist and editorial director with 15 years covering global politics, technology policy, and climate change for leading European publications.',
      website: 'catherinemoreau.press',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Editorial Director', company: 'Le Monde', location: 'Paris, FR', startDate: 'Jan 2020', endDate: '', current: true, description: 'Oversee team of 45 journalists and editors. Launched digital investigative desk winning 2 Prix de la Presse awards.' },
      { id: 2, title: 'Senior Correspondent', company: 'Reuters', location: 'Brussels, BE', startDate: 'Mar 2014', endDate: 'Dec 2019', current: false, description: 'Covered EU politics and tech regulation. Broke multiple stories on data privacy legislation.' },
    ],
    education: [{ id: 1, school: 'Sciences Po Paris', degree: 'Master', field: 'Journalism & Political Science', startDate: '2007', endDate: '2009', description: '' }],
    skills: ['Investigative Reporting', 'Editorial Leadership', 'EU Policy', 'French', 'English', 'Spanish', 'Data Journalism'],
    projects: [],
    customization: { primaryColor: '#111827', fontSize: 'medium', spacing: 'normal' },
  },
  'hunter-green': {
    personal: {
      name: 'Oliver Nduka',
      email: 'oliver.nduka@email.com',
      phone: '+44 20 7946 0958',
      address: 'London, UK',
      summary: 'Environmental consultant and sustainability strategist helping FTSE 100 companies achieve net-zero commitments and ESG reporting compliance.',
      linkedin: 'linkedin.com/in/olivernduka',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Director, Sustainability Advisory', company: 'Deloitte', location: 'London, UK', startDate: 'Feb 2020', endDate: '', current: true, description: 'Led ESG transformation programs for 20+ major corporations. Designed carbon accounting frameworks saving clients £50M in potential fines.' },
      { id: 2, title: 'Senior Environmental Consultant', company: 'WWF UK', location: 'London, UK', startDate: 'May 2015', endDate: 'Jan 2020', current: false, description: 'Developed science-based targets for UK corporate partners. Managed £8M programme portfolio.' },
    ],
    education: [{ id: 1, school: 'Imperial College London', degree: 'M.Sc.', field: 'Environmental Technology', startDate: '2012', endDate: '2013', description: '' }],
    skills: ['ESG Strategy', 'Carbon Accounting', 'TCFD Reporting', 'Stakeholder Engagement', 'GHG Protocol', 'CDP'],
    projects: [],
    customization: { primaryColor: '#166534', fontSize: 'medium', spacing: 'normal' },
  },
  'cobalt-edge': {
    personal: {
      name: 'Aria Williams',
      email: 'aria.williams@email.com',
      phone: '(202) 555-4782',
      address: 'Washington, DC',
      summary: 'Cybersecurity engineer and policy advisor with Top Secret clearance. Expert in zero-trust architecture and federal compliance frameworks.',
      linkedin: 'linkedin.com/in/ariawilliams',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Senior Cybersecurity Engineer', company: 'CISA', location: 'Washington, DC', startDate: 'Jun 2020', endDate: '', current: true, description: 'Architected zero-trust network for critical infrastructure protecting 500+ federal agencies. Led incident response for 3 nation-state attacks.' },
      { id: 2, title: 'Security Analyst', company: 'Booz Allen Hamilton', location: 'McLean, VA', startDate: 'Jul 2016', endDate: 'May 2020', current: false, description: 'Performed red team assessments and penetration testing for DoD clients.' },
    ],
    education: [{ id: 1, school: 'Georgetown University', degree: 'M.S.', field: 'Cybersecurity Policy', startDate: '2014', endDate: '2016', description: '' }],
    skills: ['Zero Trust', 'NIST Framework', 'Penetration Testing', 'SIEM', 'Python', 'FedRAMP', 'FISMA'],
    projects: [],
    customization: { primaryColor: '#1e3a8a', fontSize: 'medium', spacing: 'normal' },
  },
  'blue-neon': {
    personal: {
      name: 'Kai Tanaka',
      email: 'kai.tanaka@email.com',
      phone: '(510) 555-3021',
      address: 'Oakland, CA',
      summary: 'Full-stack engineer and startup founder with a passion for developer tooling, open-source, and building products that scale from 0 to 1M users.',
      website: 'kaitanaka.io',
      linkedin: 'linkedin.com/in/kaitanaka',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Co-Founder & CTO', company: 'Devflow', location: 'San Francisco, CA', startDate: 'Jan 2022', endDate: '', current: true, description: 'Built CI/CD developer platform from ground up. Grew to 15K users, $1.2M ARR. Stack: Next.js, Go, Postgres, K8s.' },
      { id: 2, title: 'Staff Engineer', company: 'Vercel', location: 'Remote', startDate: 'Mar 2019', endDate: 'Dec 2021', current: false, description: 'Contributed to edge runtime and deployment infrastructure serving 100B+ requests/month.' },
    ],
    education: [{ id: 1, school: 'UC San Diego', degree: 'B.S.', field: 'Computer Science', startDate: '2013', endDate: '2017', description: '' }],
    skills: ['TypeScript', 'Go', 'React', 'Next.js', 'PostgreSQL', 'Kubernetes', 'AWS', 'System Design'],
    projects: [{ id: 1, title: 'open-ci', description: 'Open-source CI pipeline runner. 4.2K GitHub stars.', technologies: ['Go', 'Docker', 'gRPC'], link: 'github.com/kaitanaka/open-ci' }],
    customization: { primaryColor: '#2563eb', fontSize: 'medium', spacing: 'normal' },
  },
  'precision-line': {
    personal: {
      name: 'Nadia Okonkwo',
      email: 'nadia.okonkwo@email.com',
      phone: '(312) 555-7741',
      address: 'Chicago, IL',
      summary: 'Data scientist and ML engineer specializing in NLP and recommendation systems. Experienced in production ML pipelines at scale.',
      linkedin: 'linkedin.com/in/nadiaokonkwo',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Senior Data Scientist', company: 'Grubhub', location: 'Chicago, IL', startDate: 'May 2021', endDate: '', current: true, description: 'Built personalization engine improving order conversion by 14%. Deployed 6 production ML models serving 30M+ users.' },
      { id: 2, title: 'Data Scientist', company: 'Nielsen', location: 'Chicago, IL', startDate: 'Aug 2018', endDate: 'Apr 2021', current: false, description: 'Developed audience segmentation models for media clients with $1B+ ad spend.' },
    ],
    education: [{ id: 1, school: 'University of Chicago', degree: 'M.S.', field: 'Statistics', startDate: '2016', endDate: '2018', description: '' }],
    skills: ['Python', 'PyTorch', 'Spark', 'SQL', 'NLP', 'Scikit-learn', 'Airflow', 'Databricks', 'A/B Testing'],
    projects: [],
    customization: { primaryColor: '#111827', fontSize: 'medium', spacing: 'normal' },
  },
  'saffron-line': {
    personal: {
      name: 'Ravi Krishnamurthy',
      email: 'ravi.k@email.com',
      phone: '(408) 555-2983',
      address: 'San Jose, CA',
      summary: 'UX researcher and interaction designer crafting accessible, evidence-based digital experiences for enterprise software and consumer apps.',
      linkedin: 'linkedin.com/in/ravikrishna',
      website: 'raviux.design',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Principal UX Researcher', company: 'Adobe', location: 'San Jose, CA', startDate: 'Oct 2020', endDate: '', current: true, description: 'Lead mixed-methods research for Creative Cloud suite. Insights drove 3 major product pivots reaching 26M subscribers.' },
      { id: 2, title: 'Senior UX Designer', company: 'Intuit', location: 'Mountain View, CA', startDate: 'Jul 2017', endDate: 'Sep 2020', current: false, description: 'Redesigned TurboTax onboarding reducing time-to-file by 28% for first-time users.' },
    ],
    education: [{ id: 1, school: 'Carnegie Mellon University', degree: 'M.HCI', field: 'Human-Computer Interaction', startDate: '2015', endDate: '2017', description: '' }],
    skills: ['User Research', 'Figma', 'Usability Testing', 'Journey Mapping', 'Accessibility (WCAG)', 'Prototyping'],
    projects: [],
    customization: { primaryColor: '#d97706', fontSize: 'medium', spacing: 'normal' },
  },
  'charcoal-glow': {
    personal: {
      name: 'Isabella Romano',
      email: 'isabella.romano@email.com',
      phone: '+39 02 1234 5678',
      address: 'Milan, Italy',
      summary: 'Fashion industry executive with 18 years leading brand strategy, product development, and global licensing for luxury and premium fashion houses.',
      linkedin: 'linkedin.com/in/isabellaromano',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Chief Brand Officer', company: 'Moncler Group', location: 'Milan, IT', startDate: 'Mar 2019', endDate: '', current: true, description: 'Spearhead global brand strategy for €2.1B luxury brand. Launched Genius collaboration platform generating €220M incremental revenue.' },
      { id: 2, title: 'VP Brand & Creative', company: 'Versace', location: 'Milan, IT', startDate: 'Jan 2013', endDate: 'Feb 2019', current: false, description: 'Directed creative positioning and rebranding during Capri Holdings acquisition. Managed €80M brand budget.' },
    ],
    education: [{ id: 1, school: 'Bocconi University', degree: 'MBA', field: 'Luxury Brand Management', startDate: '2008', endDate: '2010', description: '' }],
    skills: ['Brand Strategy', 'Luxury Marketing', 'P&L Management', 'Creative Direction', 'Licensing', 'Italian', 'French'],
    projects: [],
    customization: { primaryColor: '#1f2937', fontSize: 'medium', spacing: 'normal' },
  },
  'quicksilver': {
    personal: {
      name: 'Noah Bennett',
      email: 'noah.bennett@email.com',
      phone: '(647) 555-8834',
      address: 'Toronto, ON',
      summary: 'Operations manager and supply chain specialist with expertise in lean manufacturing, inventory optimization, and cross-border logistics.',
      linkedin: 'linkedin.com/in/noahbennett',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Director of Operations', company: 'Shopify Logistics', location: 'Toronto, ON', startDate: 'Nov 2020', endDate: '', current: true, description: 'Oversee fulfillment network of 20 warehouses across North America. Reduced average delivery time by 31% and costs by 18%.' },
      { id: 2, title: 'Senior Operations Manager', company: 'Amazon Canada', location: 'Mississauga, ON', startDate: 'Jun 2016', endDate: 'Oct 2020', current: false, description: 'Managed 600-person fulfillment center. Achieved highest on-time delivery rate (99.2%) in Canadian network.' },
    ],
    education: [{ id: 1, school: 'University of Toronto', degree: 'B.Com.', field: 'Operations Management', startDate: '2011', endDate: '2015', description: '' }],
    skills: ['Supply Chain', 'Lean Six Sigma', 'SAP', 'Inventory Management', 'P&L', 'Team Leadership', 'Logistics'],
    projects: [],
    customization: { primaryColor: '#374151', fontSize: 'medium', spacing: 'normal' },
  },
  'almost-black': {
    personal: {
      name: 'Zara Osei',
      email: 'zara.osei@email.com',
      phone: '(917) 555-6621',
      address: 'Brooklyn, NY',
      summary: 'Creative director and brand strategist working at the intersection of culture, technology, and design. Clients include Apple, Nike, and Netflix.',
      website: 'zaraosei.studio',
      linkedin: 'linkedin.com/in/zaraosei',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Creative Director', company: 'Instrument', location: 'New York, NY', startDate: 'Jan 2021', endDate: '', current: true, description: 'Lead multi-disciplinary creative team of 30. Directed campaigns for Apple Music, Snap, and Hulu earning 4 Cannes Lions awards.' },
      { id: 2, title: 'Senior Art Director', company: 'Wieden+Kennedy', location: 'Portland, OR', startDate: 'May 2017', endDate: 'Dec 2020', current: false, description: 'Art directed Nike and Coca-Cola global campaigns reaching 500M+ impressions.' },
    ],
    education: [{ id: 1, school: 'Parsons School of Design', degree: 'B.F.A.', field: 'Communication Design', startDate: '2011', endDate: '2015', description: '' }],
    skills: ['Creative Direction', 'Brand Strategy', 'Art Direction', 'Figma', 'After Effects', 'Conceptual Thinking', 'Leadership'],
    projects: [{ id: 1, title: 'Apple Music Campaign', description: 'Global launch campaign reaching 1B impressions.', technologies: ['Brand', 'Motion', 'OOH'], link: '' }],
    customization: { primaryColor: '#38bdf8', fontSize: 'medium', spacing: 'normal' },
  },
  'typewriter-photo': {
    personal: {
      name: 'Sebastian Novak',
      email: 'sebastian.novak@email.com',
      phone: '+1 (604) 555-3377',
      address: 'Vancouver, BC',
      summary: 'Documentary filmmaker and visual storyteller with 12 years of experience capturing compelling narratives across 40+ countries.',
      website: 'sebastiannovak.film',
      linkedin: 'linkedin.com/in/sebastiannovak',
      profileImage: '',
    },
    experience: [
      { id: 1, title: 'Director & Cinematographer', company: 'Freelance / Self-Employed', location: 'Vancouver, BC', startDate: 'Jan 2018', endDate: '', current: true, description: 'Produced three award-winning feature documentaries screened at Sundance, TIFF, and Hot Docs. Commercial work for NRDC, Red Cross, and National Geographic.' },
      { id: 2, title: 'Senior Producer', company: 'Vice Media', location: 'Toronto, ON', startDate: 'Mar 2014', endDate: 'Dec 2017', current: false, description: 'Produced 12-part documentary series for Vice/HBO reaching 8M viewers globally.' },
    ],
    education: [{ id: 1, school: 'Emily Carr University', degree: 'B.F.A.', field: 'Film & Screen Arts', startDate: '2009', endDate: '2013', description: '' }],
    skills: ['Documentary Direction', 'Cinematography', 'Final Cut Pro', 'DaVinci Resolve', 'Storytelling', 'Aerial Drone'],
    projects: [{ id: 1, title: '"Borderlands" — Feature Documentary', description: 'Sundance 2023 Official Selection. Migration documentary across 8 countries.', technologies: ['Film', 'Distribution'], link: '' }],
    customization: { primaryColor: '#111827', fontSize: 'medium', spacing: 'normal' },
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE NAME MAPPING (template selector ID → template key)
// ═══════════════════════════════════════════════════════════════

// Derived from the registry — do NOT hand-edit this mapping;
// add/remove templates via src/templates/registry.ts instead.
export const templateNames: Record<string, string> = Object.fromEntries(
  TEMPLATE_REGISTRY.flatMap((t) => [
    [t.key, t.key],
    ...t.legacyIds.map((id) => [id, t.key]),
  ])
);

// ═══════════════════════════════════════════════════════════════
// EXAMPLE RESUMES (for template gallery previews)
// ═══════════════════════════════════════════════════════════════

export const exampleResumes = templateMockData;

// ═══════════════════════════════════════════════════════════════
// RESUME TEMPLATE COMPONENT
// ═══════════════════════════════════════════════════════════════

const ResumeTemplate = ({
  data,
  templateName = 'clean-slate',
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
  const resolvedKey = resolveTemplateKey(templateName);
  const baseStyles = templateStyles[resolvedKey] || templateStyles['clean-slate'];
  const styles = applyCustomization(baseStyles, resumeData.customization);

  // ─── 5-dot proficiency helper ─────────────────────────────────
  const proficiencyLevels: Record<string, number> = {
    'native': 5, 'c2': 5, 'fluent': 5, 'bilingual': 5,
    'c1': 4, 'advanced': 4, 'professional': 4,
    'b2': 3, 'upper intermediate': 3, 'intermediate': 3,
    'b1': 2, 'pre-intermediate': 2, 'elementary': 2,
    'a2': 1, 'beginner': 1, 'a1': 1, 'basic': 1,
  };

  const renderProficiencyDots = (proficiency: string, dotColor: string = '#ffffff') => {
    const level = proficiencyLevels[proficiency.toLowerCase()] ?? 3;
    return (
      <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '8px', verticalAlign: 'middle' }}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <span key={dot} style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: dot <= level ? dotColor : 'transparent',
            border: `1.5px solid ${dotColor}`,
          }} />
        ))}
      </span>
    );
  };

  const headerContent = (
    <>
      {resumeData.personal.profileImage && styles.profilePhoto && styles.profilePhoto.display !== 'none' && (
        <img 
          src={resumeData.personal.profileImage} 
          alt={`${resumeData.personal.name || 'Profile'}`}
          style={styles.profilePhoto}
        />
      )}
      <div>
        <div style={styles.name}>{resumeData.personal.name || 'Your Name'}</div>
        <div style={{ ...styles.contact, wordBreak: 'break-word' as const, overflowWrap: 'break-word' as const }}>
          {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
          {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
          {resumeData.personal.address && <span>{resumeData.personal.address}</span>}
          {resumeData.personal.website && <span>{resumeData.personal.website}</span>}
          {resumeData.personal.linkedin && <span>{resumeData.personal.linkedin}</span>}
        </div>
      </div>
    </>
  );

	  const renderSection = (key: string, titleStyle?: CSSProperties) => {
	    if (hiddenSections && hiddenSections.includes(key)) return null;
	    const secTitle = titleStyle ?? styles.sectionTitle;
	    const sectionName = resumeData.customization?.sectionTitles?.[key];
	    const title = (d: string) => sectionName || d;
	    switch (key) {
      case "summary":
        if (resumeData.personal.summary) {
          return (
            <div style={styles.section} key="summary">
              <div style={secTitle}>{title('Summary')}</div>
              <div style={{ ...styles.itemDescription, wordBreak: 'break-word' as const, overflowWrap: 'break-word' as const }}>{resumeData.personal.summary}</div>
            </div>
          );
        }
        break;
      case "experience":
        if (resumeData.experience && resumeData.experience.length > 0) {
          return (
            <div style={styles.section} key="experience">
              <div style={secTitle}>{title('Experience')}</div>
              <div style={styles.sectionContent}>
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} style={styles.item} data-resume-item>
                    <div style={styles.itemTitle}>{exp.title}</div>
                    <div style={styles.itemSubtitle}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                    <div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                    <div style={{ ...styles.itemDescription, wordBreak: 'break-word' as const, overflowWrap: 'break-word' as const }}>{exp.description}</div>
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
              <div style={secTitle}>{title('Education')}</div>
              <div style={styles.sectionContent}>
                {resumeData.education.map((edu) => (
                  <div key={edu.id} style={styles.item} data-resume-item>
                    <div style={styles.itemTitle}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                    <div style={styles.itemSubtitle}>{edu.school}</div>
                    <div style={styles.itemDate}>{edu.startDate} - {edu.endDate}</div>
                    {edu.description && <div style={{ ...styles.itemDescription, wordBreak: 'break-word' as const, overflowWrap: 'break-word' as const }}>{edu.description}</div>}
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
              <div style={secTitle}>{title('Skills')}</div>
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
              <div style={secTitle}>{title('Projects')}</div>
              <div style={styles.sectionContent}>
                {resumeData.projects.map((project) => (
                  <div key={project.id} style={styles.item} data-resume-item>
                    <div style={styles.itemTitle}>
                      {project.title}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', fontSize: '14px' }}>↗</a>
                      )}
                    </div>
                    <div style={{ ...styles.itemDescription, wordBreak: 'break-word' as const, overflowWrap: 'break-word' as const }}>{project.description}</div>
                    {project.technologies && project.technologies.length > 0 && (
                      <div style={{ ...styles.skillsList, marginTop: '5px' }}>
                        {project.technologies.map((tech, i) => (
                          <div key={i} style={{ ...styles.skill, fontSize: '11px' }}>{tech}</div>
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
      case "languages":
        if (resumeData.languages && resumeData.languages.length > 0) {
          const sectionTitleStr = (resumeData.customization?.sectionTitles?.languages) || "Languages";
          return (
            <div style={styles.section} key="languages">
              <div style={secTitle}>{sectionTitleStr}</div>
              <div style={styles.sectionContent}>
                {resumeData.languages.map((lang, idx) => (
                  <div key={idx} style={{ ...styles.item, marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} data-resume-item>
                    <span style={styles.itemTitle}>{lang.language}</span>
                    {lang.proficiency && renderProficiencyDots(lang.proficiency, styles.itemSubtitle?.color || '#4b5563')}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        break;
      case "interests":
        if (resumeData.interests && resumeData.interests.length > 0) {
          const sectionTitleStr = (resumeData.customization?.sectionTitles?.interests) || "Interests";
          return (
            <div style={styles.section} key="interests">
              <div style={secTitle}>{sectionTitleStr}</div>
              <div style={styles.skillsList}>
                {resumeData.interests.map((interest, idx) => (
                  <div key={idx} style={styles.skill}>{interest}</div>
                ))}
              </div>
            </div>
          );
        }
        break;
      case "certifications":
        if (resumeData.certifications && resumeData.certifications.length > 0) {
          const sectionTitleStr = (resumeData.customization?.sectionTitles?.certifications) || "Certifications";
          return (
            <div style={styles.section} key="certifications">
              <div style={secTitle}>{sectionTitleStr}</div>
              <div style={styles.sectionContent}>
                {resumeData.certifications.map((cert, idx) => (
                  <div key={idx} style={styles.item} data-resume-item>
                    <div style={styles.itemTitle}>
                      {cert.name}
                      {cert.url && (
                        <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', fontSize: '14px' }}>↗</a>
                      )}
                    </div>
                    <div style={styles.itemSubtitle}>{cert.issuer} {cert.date ? `| ${cert.date}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        break;
      case "volunteer":
        if (resumeData.volunteer && resumeData.volunteer.length > 0) {
          const sectionTitleStr = (resumeData.customization?.sectionTitles?.volunteer) || "Volunteer Work";
          return (
            <div style={styles.section} key="volunteer">
              <div style={secTitle}>{sectionTitleStr}</div>
              <div style={styles.sectionContent}>
                {resumeData.volunteer.map((vol, idx) => (
                  <div key={idx} style={styles.item} data-resume-item>
                    <div style={styles.itemTitle}>{vol.role}</div>
                    <div style={styles.itemSubtitle}>{vol.organization}</div>
                    <div style={styles.itemDate}>{vol.startDate} - {vol.endDate}</div>
                    {vol.description && <div style={{ ...styles.itemDescription, wordBreak: 'break-word' as const, overflowWrap: 'break-word' as const }}>{vol.description}</div>}
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

  const defaultOrder = ["summary", "experience", "education", "skills", "projects", "languages", "interests", "certifications", "volunteer"];
  const useOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  const templateDef = getTemplate(resolvedKey);
  const layout = templateDef.layout;

  if (layout === 'sidebar-left' || layout === 'sidebar-right') {
    const isLeft = layout === 'sidebar-left';
    return (
      <div style={{ display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', ...styles.container }}>
        <aside style={styles.sidebar}>
          {resumeData.personal.profileImage && styles.profilePhoto && styles.profilePhoto.display !== 'none' && (
            <img src={resumeData.personal.profileImage} alt={`${resumeData.personal.name || 'Profile'}`} style={styles.profilePhoto}/>
          )}
          {resumeData.personal.name && (
            <div style={{ ...styles.name, color: styles.sidebar?.color || styles.name?.color, fontSize: styles.name?.fontSize ? String(parseFloat(String(styles.name.fontSize)) * 0.75) + 'px' : '20px' }}>
              {resumeData.personal.name}
            </div>
          )}
          <div style={{ ...styles.contact, wordBreak: 'break-word' as const, overflowWrap: 'break-word' as const }}>
            {resumeData.personal.email && <div style={{ display: 'block', marginBottom: '6px' }}>{resumeData.personal.email}</div>}
            {resumeData.personal.phone && <div style={{ display: 'block', marginBottom: '6px' }}>{resumeData.personal.phone}</div>}
            {resumeData.personal.address && <div style={{ display: 'block', marginBottom: '6px' }}>{resumeData.personal.address}</div>}
            {resumeData.personal.website && <div style={{ display: 'block', marginBottom: '6px' }}>{resumeData.personal.website}</div>}
            {resumeData.personal.linkedin && <div style={{ display: 'block', marginBottom: '6px' }}>{resumeData.personal.linkedin}</div>}
          </div>
          {renderSection('summary', styles.sidebarSectionTitle)}
          {renderSection('skills', styles.sidebarSectionTitle)}
          {renderSection('languages', styles.sidebarSectionTitle)}
          {renderSection('certifications', styles.sidebarSectionTitle)}
          {renderSection('interests', styles.sidebarSectionTitle)}
        </aside>
        <div style={styles.mainContent}>
          {useOrder.filter(k => !['skills', 'languages', 'certifications', 'interests', 'summary'].includes(k)).map((sectionKey) => renderSection(sectionKey))}
        </div>
      </div>
    );
  }

  if (layout === 'header-band') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>{headerContent}</div>
        {styles.sidebar ? (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <aside style={styles.sidebar}>
              {renderSection('skills', styles.sidebarSectionTitle)}
              {renderSection('languages', styles.sidebarSectionTitle)}
              {renderSection('certifications', styles.sidebarSectionTitle)}
              {renderSection('interests', styles.sidebarSectionTitle)}
            </aside>
            <div style={styles.mainContent}>
              {useOrder.filter(k => !['skills', 'languages', 'certifications', 'interests'].includes(k)).map((sectionKey) => renderSection(sectionKey))}
            </div>
          </div>
        ) : (
          <div style={styles.mainContent}>{useOrder.map((sectionKey) => renderSection(sectionKey))}</div>
        )}
      </div>
    );
  }

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
