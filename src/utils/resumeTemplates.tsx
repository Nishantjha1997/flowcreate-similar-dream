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
  sidebar?: CSSProperties;
  mainContent?: CSSProperties;
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
    if (styles.skill?.backgroundColor && styles.skill.backgroundColor !== 'transparent') {
      styles.skill = {...styles.skill, backgroundColor: customization.primaryColor, color: '#fff'};
    } else {
      styles.skill = {...styles.skill, borderColor: customization.primaryColor, color: customization.primaryColor};
    }
  }
  
  if (customization.secondaryColor) {
    styles.itemSubtitle = {...styles.itemSubtitle, color: customization.secondaryColor};
  }
  
  if (customization.accentColor) {
    styles.sectionTitle = {...styles.sectionTitle, borderBottomColor: customization.accentColor};
  }
  
  if (customization.textColor) {
    styles.itemDescription = {...styles.itemDescription, color: customization.textColor};
    styles.contact = {...styles.contact, color: customization.textColor};
  }
  
  if (customization.backgroundColor) {
    styles.container = {...styles.container, backgroundColor: customization.backgroundColor};
  }
  
  if (customization.fontSize) {
    const m = customization.fontSize === 'small' ? 0.9 : customization.fontSize === 'large' ? 1.1 : 1;
    styles.name = {...styles.name, fontSize: `${parseInt(styles.name.fontSize as string) * m}px`};
    styles.itemTitle = {...styles.itemTitle, fontSize: `${parseInt(styles.itemTitle.fontSize as string) * m}px`};
    styles.itemSubtitle = {...styles.itemSubtitle, fontSize: `${parseInt(styles.itemSubtitle.fontSize as string) * m}px`};
    styles.itemDescription = {...styles.itemDescription, fontSize: `${parseInt(styles.itemDescription.fontSize as string) * m}px`};
  }
  
  if (customization.fontFamily && customization.fontFamily !== 'default') {
    styles.container = {...styles.container, fontFamily: customization.fontFamily};
  }
  
  if (customization.spacing) {
    const m = customization.spacing === 'compact' ? 0.75 : customization.spacing === 'spacious' ? 1.25 : 1;
    styles.section = {...styles.section, marginBottom: `${parseInt(styles.section.marginBottom as string) * m}px`};
    styles.item = {...styles.item, marginBottom: `${parseInt(styles.item.marginBottom as string) * m}px`};
  }

  if (customization.lineHeight) {
    styles.itemDescription = {...styles.itemDescription, lineHeight: customization.lineHeight};
  }
  
  return styles;
};

// ═══════════════════════════════════════════════════════════════
// 7 PREMIUM ATS-OPTIMIZED TEMPLATES
// Each is visually distinct with unique layout approach
// ═══════════════════════════════════════════════════════════════

const templateStyles: Record<string, TemplateStyles> = {

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
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE NAME MAPPING (template selector ID → template key)
// ═══════════════════════════════════════════════════════════════

export const templateNames: Record<string, string> = {
  "1": "clean-slate",
  "2": "executive-serif",
  "3": "sidebar-modern",
  "4": "tech-engineer",
  "5": "coral-creative",
  "6": "navy-professional",
  "7": "emerald-minimal",
};

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
  const baseStyles = templateStyles[templateName] || templateStyles['clean-slate'];
  const styles = applyCustomization(baseStyles, resumeData.customization);

  const headerContent = (
    <>
      {resumeData.personal.profileImage && styles.profilePhoto && (styles.profilePhoto as any).display !== 'none' && (
        <img 
          src={resumeData.personal.profileImage} 
          alt={`${resumeData.personal.name || 'Profile'}`}
          style={styles.profilePhoto}
        />
      )}
      <div>
        <div style={styles.name}>{resumeData.personal.name || 'Your Name'}</div>
        <div style={styles.contact}>
          {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
          {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
          {resumeData.personal.address && <span>{resumeData.personal.address}</span>}
          {resumeData.personal.website && <span>{resumeData.personal.website}</span>}
          {resumeData.personal.linkedin && <span>{resumeData.personal.linkedin}</span>}
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
                        <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', fontSize: '14px' }}>↗</a>
                      )}
                    </div>
                    <div style={styles.itemDescription}>{project.description}</div>
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
      default:
        return null;
    }
    return null;
  };

  const defaultOrder = ["summary", "experience", "education", "skills", "projects"];
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
