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
  modern: {
    container: {
      fontFamily: "'Roboto', sans-serif",
      color: '#333',
      lineHeight: '1.5',
      maxWidth: '100%',
      height: '100%',
      padding: '30px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #eaeaea',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #2563eb',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '8px',
      color: '#2563eb',
      letterSpacing: '0.5px',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px',
      color: '#666',
    },
    section: {
      marginBottom: '25px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      borderBottom: '2px solid #2563eb',
      paddingBottom: '6px',
      marginBottom: '15px',
      color: '#2563eb',
    },
    sectionContent: {
      marginTop: '16px',
    },
    item: {
      marginBottom: '20px',
    },
    itemTitle: {
      fontSize: '17px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '4px',
    },
    itemSubtitle: {
      fontSize: '15px',
      fontWeight: 500,
      color: '#555',
    },
    itemDate: {
      fontSize: '14px',
      color: '#666',
      fontStyle: 'italic',
      marginBottom: '8px',
    },
    itemDescription: {
      fontSize: '14px',
      whiteSpace: 'pre-line',
      lineHeight: '1.6',
      color: '#444',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '12px',
    },
    skill: {
      padding: '5px 12px',
      fontSize: '13px',
      borderRadius: '4px',
      background: '#e6effe',
      color: '#2563eb',
    },
  },
  
  classic: {
    container: {
      fontFamily: "'Georgia', serif",
      color: '#333',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '30px',
      backgroundColor: '#fafafa',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center',
      marginBottom: '25px',
      borderBottom: '1px solid #ccc',
      paddingBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    profilePhoto: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '15px',
      border: '3px solid #000',
    },
    name: {
      fontSize: '30px',
      fontWeight: 600,
      marginBottom: '8px',
      color: '#000',
      textTransform: 'uppercase',
      letterSpacing: '2px',
    },
    contact: {
      fontSize: '14px',
      textAlign: 'center',
      marginTop: '10px',
      color: '#555',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '15px',
    },
    section: {
      marginBottom: '28px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '15px',
      color: '#000',
      borderBottom: '1px solid #ccc',
      paddingBottom: '8px',
    },
    sectionContent: {
      marginTop: '16px',
    },
    item: {
      marginBottom: '22px',
      position: 'relative',
    },
    itemTitle: {
      fontSize: '17px',
      fontWeight: 600,
      color: '#000',
      marginBottom: '4px',
    },
    itemSubtitle: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#333',
      fontStyle: 'italic',
    },
    itemDate: {
      fontSize: '14px',
      color: '#666',
      fontStyle: 'italic',
      marginBottom: '8px',
    },
    itemDescription: {
      fontSize: '15px',
      whiteSpace: 'pre-line',
      lineHeight: '1.7',
      color: '#333',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      justifyContent: 'center',
      marginTop: '12px',
    },
    skill: {
      fontSize: '14px',
      color: '#333',
      position: 'relative',
      padding: '0 10px',
    },
  },

  creative: {
    container: {
      fontFamily: "'Poppins', sans-serif",
      color: '#333',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '35px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '30px',
      background: 'linear-gradient(90deg, #FF6B6B, #FFE66D)',
      padding: '30px',
      borderRadius: '12px',
      color: '#fff',
      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '25px',
    },
    profilePhoto: {
      width: '110px',
      height: '110px',
      borderRadius: '12px',
      objectFit: 'cover',
      border: '4px solid #fff',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    },
    name: {
      fontSize: '32px',
      fontWeight: 700,
      marginBottom: '8px',
      color: '#fff',
      textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '15px',
      color: '#fff',
    },
    section: {
      marginBottom: '30px',
      position: 'relative',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      padding: '8px 20px',
      backgroundColor: '#FF6B6B',
      color: '#fff',
      borderRadius: '25px',
      display: 'inline-block',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
    },
    sectionContent: {
      marginTop: '20px',
      paddingLeft: '20px',
    },
    item: {
      marginBottom: '25px',
      position: 'relative',
      paddingLeft: '20px',
      borderLeft: '2px solid #FFE66D',
    },
    itemTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '4px',
    },
    itemSubtitle: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#FF6B6B',
    },
    itemDate: {
      fontSize: '14px',
      color: '#666',
      fontStyle: 'italic',
      marginBottom: '8px',
    },
    itemDescription: {
      fontSize: '15px',
      whiteSpace: 'pre-line',
      lineHeight: '1.7',
      color: '#444',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '15px',
    },
    skill: {
      padding: '6px 16px',
      fontSize: '14px',
      borderRadius: '30px',
      background: 'linear-gradient(90deg, #FF6B6B, #FFE66D)',
      color: '#fff',
      fontWeight: '500',
      boxShadow: '0 2px 5px rgba(255, 107, 107, 0.2)',
    },
  },

  technical: {
    container: {
      fontFamily: "'Roboto Mono', monospace",
      color: '#333',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '30px',
      backgroundColor: '#f8f9fa',
      boxSizing: 'border-box',
      borderTop: '5px solid #4CAF50',
    },
    header: {
      marginBottom: '25px',
      backgroundColor: '#222',
      padding: '25px',
      color: '#fff',
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '100px',
      height: '100px',
      borderRadius: '5px',
      objectFit: 'cover',
      border: '2px solid #4CAF50',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '8px',
      color: '#4CAF50',
      letterSpacing: '1px',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      marginTop: '15px',
      color: '#aaa',
      fontFamily: "'Roboto Mono', monospace",
    },
    section: {
      marginBottom: '30px',
      borderLeft: '3px solid #4CAF50',
      paddingLeft: '20px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color: '#4CAF50',
      marginBottom: '18px',
      fontFamily: "'Roboto Mono', sans-serif",
    },
    sectionContent: {
      marginTop: '18px',
    },
    item: {
      marginBottom: '20px',
      borderBottom: '1px dotted #ddd',
      paddingBottom: '20px',
    },
    itemTitle: {
      fontSize: '17px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '5px',
      fontFamily: "'Roboto Mono', sans-serif",
    },
    itemSubtitle: {
      fontSize: '15px',
      fontWeight: 500,
      color: '#555',
    },
    itemDate: {
      fontSize: '14px',
      color: '#666',
      fontStyle: 'italic',
      marginBottom: '8px',
      borderLeft: '2px solid #4CAF50',
      paddingLeft: '10px',
    },
    itemDescription: {
      fontSize: '14px',
      whiteSpace: 'pre-line',
      lineHeight: '1.7',
      color: '#333',
      fontFamily: "'Roboto Mono', monospace",
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '15px',
    },
    skill: {
      padding: '5px 12px',
      fontSize: '13px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      borderRadius: '3px',
      fontFamily: "'Roboto Mono', sans-serif",
      letterSpacing: '0.5px',
    },
  },

  professional: {
    container: {
      fontFamily: "'Montserrat', sans-serif",
      color: '#333',
      lineHeight: '1.5',
      maxWidth: '100%',
      height: '100%',
      padding: '30px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
      borderLeft: '8px solid #003366',
    },
    header: {
      marginBottom: '30px',
      borderBottom: '2px solid #003366',
      paddingBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '25px',
    },
    profilePhoto: {
      width: '120px',
      height: '120px',
      borderRadius: '8px',
      objectFit: 'cover',
      border: '2px solid #003366',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    name: {
      fontSize: '32px',
      fontWeight: 700,
      marginBottom: '8px',
      color: '#003366',
      letterSpacing: '0.5px',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '12px',
      color: '#555',
    },
    section: {
      marginBottom: '28px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color: '#003366',
      marginBottom: '15px',
      paddingBottom: '8px',
      borderBottom: '2px solid #003366',
    },
    sectionContent: {
      marginTop: '16px',
    },
    item: {
      marginBottom: '20px',
    },
    itemTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#333',
      marginBottom: '4px',
    },
    itemSubtitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#003366',
    },
    itemDate: {
      fontSize: '14px',
      color: '#666',
      fontWeight: 500,
      marginBottom: '8px',
    },
    itemDescription: {
      fontSize: '15px',
      whiteSpace: 'pre-line',
      lineHeight: '1.7',
      color: '#444',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '15px',
    },
    skill: {
      padding: '6px 14px',
      fontSize: '14px',
      backgroundColor: '#003366',
      color: '#fff',
      borderRadius: '4px',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
  },

  minimalist: {
    container: {
      fontFamily: "'Roboto', sans-serif",
      color: '#333',
      lineHeight: '1.5',
      maxWidth: '100%',
      height: '100%',
      padding: '30px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '25px',
      borderBottom: '1px solid #ddd',
      paddingBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profilePhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1px solid #eaeaea',
    },
    name: {
      fontSize: '24px',
      fontWeight: 600,
      marginBottom: '5px',
      color: '#333',
    },
    contact: {
      fontSize: '13px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '8px',
      color: '#666',
    },
    section: {
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#333',
      marginBottom: '12px',
      paddingBottom: '5px',
      borderBottom: '1px solid #eee',
    },
    sectionContent: {
      marginTop: '14px',
    },
    item: {
      marginBottom: '18px',
    },
    itemTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '3px',
    },
    itemSubtitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#666',
    },
    itemDate: {
      fontSize: '13px',
      color: '#777',
      marginBottom: '6px',
    },
    itemDescription: {
      fontSize: '14px',
      whiteSpace: 'pre-line',
      lineHeight: '1.6',
      color: '#555',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '10px',
    },
    skill: {
      padding: '4px 10px',
      fontSize: '12px',
      backgroundColor: '#f5f5f5',
      color: '#555',
      borderRadius: '3px',
    }
  },

  executive: {
    container: {
      fontFamily: "'Times New Roman', serif",
      color: '#222',
      lineHeight: '1.5',
      maxWidth: '100%',
      height: '100%',
      padding: '30px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
      borderTop: '4px solid #00008B',
    },
    header: {
      marginBottom: '30px',
      borderBottom: '2px solid #00008B',
      paddingBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '25px',
    },
    profilePhoto: {
      width: '130px',
      height: '130px',
      borderRadius: '0',
      objectFit: 'cover',
      border: '2px solid #00008B',
    },
    name: {
      fontSize: '32px',
      fontWeight: 700,
      marginBottom: '8px',
      color: '#00008B',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      marginTop: '10px',
      color: '#444',
    },
    section: {
      marginBottom: '28px',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#00008B',
      marginBottom: '15px',
      borderBottom: '1px solid #ccc',
      paddingBottom: '8px',
    },
    sectionContent: {
      marginTop: '16px',
    },
    item: {
      marginBottom: '22px',
    },
    itemTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#222',
      marginBottom: '4px',
    },
    itemSubtitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#444',
    },
    itemDate: {
      fontSize: '14px',
      color: '#555',
      fontStyle: 'italic',
      marginBottom: '8px',
    },
    itemDescription: {
      fontSize: '15px',
      whiteSpace: 'pre-line',
      lineHeight: '1.7',
      color: '#333',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '12px',
    },
    skill: {
      padding: '5px 12px',
      fontSize: '14px',
      backgroundColor: '#00008B',
      color: '#fff',
      borderRadius: '0',
    }
  },

  elegant: {
    container: {
      fontFamily: "'Cormorant Garamond', serif",
      color: '#333',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '35px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    },
    header: {
      marginBottom: '30px',
      borderBottom: '1px solid #ccc',
      paddingBottom: '25px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    profilePhoto: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #f3f3f3',
      marginBottom: '15px',
    },
    name: {
      fontSize: '34px',
      fontWeight: 600,
      marginBottom: '8px',
      color: '#333',
      letterSpacing: '1px',
    },
    contact: {
      fontSize: '15px',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '15px',
      marginTop: '12px',
      color: '#555',
    },
    section: {
      marginBottom: '28px',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 600,
      textAlign: 'center',
      color: '#333',
      marginBottom: '18px',
      position: 'relative',
      paddingBottom: '10px',
    },
    sectionContent: {
      marginTop: '18px',
    },
    item: {
      marginBottom: '22px',
    },
    itemTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '4px',
    },
    itemSubtitle: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#555',
      fontStyle: 'italic',
    },
    itemDate: {
      fontSize: '15px',
      color: '#666',
      marginBottom: '8px',
    },
    itemDescription: {
      fontSize: '16px',
      whiteSpace: 'pre-line',
      lineHeight: '1.7',
      color: '#444',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      justifyContent: 'center',
      marginTop: '15px',
    },
    skill: {
      padding: '5px 15px',
      fontSize: '14px',
      border: '1px solid #ccc',
      borderRadius: '20px',
      color: '#555',
    }
  },
};

const ResumeTemplate = ({ 
  data, 
  templateName = 'modern',
  sectionOrder, // <-- Add this
}: { 
  data: ResumeData | TypesResumeData; 
  templateName?: string;
  sectionOrder?: string[];
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

  // Helper to render each section based on key
  const renderSection = (key: string) => {
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
      // Add more dynamic custom sections as needed using similar logic
      default:
        return null;
    }
    return null;
  };

  // Determine section order: if provided, use; else, default.
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
