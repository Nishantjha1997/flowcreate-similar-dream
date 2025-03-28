
import { CSSProperties } from 'react';

export type ResumeData = {
  personal: {
    name: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    website?: string;
    linkedin?: string;
  };
  experience: Array<{
    id: number;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: number;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: Array<string>;
  projects?: Array<{
    id: number;
    title: string;
    description: string;
    link?: string;
    technologies?: string[];
  }>;
};

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
};

// Define template styles
const templateStyles: Record<string, TemplateStyles> = {
  // 1. Modern Minimalist
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
      marginBottom: '20px',
      borderBottom: '1px solid #eaeaea',
      paddingBottom: '20px',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '5px',
      color: '#2563eb',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px',
    },
    section: {
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderBottom: '2px solid #2563eb',
      paddingBottom: '5px',
      marginBottom: '15px',
      color: '#2563eb',
    },
    sectionContent: {
      marginTop: '10px',
    },
    item: {
      marginBottom: '15px',
    },
    itemTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '2px',
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
      marginBottom: '5px',
    },
    itemDescription: {
      fontSize: '14px',
      whiteSpace: 'pre-line',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '10px',
    },
    skill: {
      padding: '4px 10px',
      fontSize: '13px',
      borderRadius: '4px',
      background: '#e6effe',
      color: '#2563eb',
    },
  },
  
  // 2. Classic Elegance
  classic: {
    container: {
      fontFamily: "'Georgia', serif",
      color: '#333',
      lineHeight: '1.6',
      maxWidth: '100%',
      height: '100%',
      padding: '30px',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center',
      marginBottom: '25px',
      borderBottom: '1px solid #ccc',
      paddingBottom: '20px',
    },
    name: {
      fontSize: '28px',
      fontWeight: 600,
      marginBottom: '5px',
      color: '#000',
      textTransform: 'uppercase',
      letterSpacing: '2px',
    },
    contact: {
      fontSize: '14px',
      textAlign: 'center',
      marginTop: '10px',
    },
    section: {
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '15px',
      color: '#000',
      borderBottom: '1px solid #ccc',
      paddingBottom: '5px',
    },
    sectionContent: {
      marginTop: '10px',
    },
    item: {
      marginBottom: '15px',
    },
    itemTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#000',
      marginBottom: '2px',
    },
    itemSubtitle: {
      fontSize: '15px',
      fontWeight: 500,
      color: '#333',
    },
    itemDate: {
      fontSize: '14px',
      color: '#666',
      fontStyle: 'italic',
      marginBottom: '5px',
    },
    itemDescription: {
      fontSize: '14px',
      whiteSpace: 'pre-line',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      marginTop: '10px',
    },
    skill: {
      fontSize: '14px',
      color: '#333',
    },
  },

  // 3. Creative Spark
  creative: {
    container: {
      fontFamily: "'Poppins', sans-serif",
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
      background: 'linear-gradient(90deg, #FF6B6B, #FFE66D)',
      padding: '25px',
      borderRadius: '8px',
      color: '#fff',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '5px',
      color: '#fff',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px',
      color: '#fff',
    },
    section: {
      marginBottom: '25px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      padding: '8px 15px',
      backgroundColor: '#FF6B6B',
      color: '#fff',
      borderRadius: '20px',
      display: 'inline-block',
      marginBottom: '15px',
    },
    sectionContent: {
      marginTop: '15px',
      paddingLeft: '15px',
    },
    item: {
      marginBottom: '20px',
      position: 'relative',
      paddingLeft: '20px',
    },
    itemTitle: {
      fontSize: '17px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '2px',
    },
    itemSubtitle: {
      fontSize: '15px',
      fontWeight: 500,
      color: '#FF6B6B',
    },
    itemDate: {
      fontSize: '14px',
      color: '#666',
      fontStyle: 'italic',
      marginBottom: '5px',
    },
    itemDescription: {
      fontSize: '14px',
      whiteSpace: 'pre-line',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px',
    },
    skill: {
      padding: '5px 12px',
      fontSize: '13px',
      borderRadius: '20px',
      background: 'linear-gradient(90deg, #FF6B6B, #FFE66D)',
      color: '#fff',
    },
  },

  // 4. Tech Innovator
  technical: {
    container: {
      fontFamily: "'Orbitron', 'Arial', sans-serif",
      color: '#333',
      lineHeight: '1.5',
      maxWidth: '100%',
      height: '100%',
      padding: '30px',
      backgroundColor: '#f8f9fa',
      boxSizing: 'border-box',
      borderTop: '5px solid #4CAF50',
    },
    header: {
      marginBottom: '25px',
      backgroundColor: '#333',
      padding: '20px',
      color: '#fff',
    },
    name: {
      fontSize: '26px',
      fontWeight: 700,
      marginBottom: '5px',
      color: '#4CAF50',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px',
    },
    section: {
      marginBottom: '25px',
      borderLeft: '3px solid #4CAF50',
      paddingLeft: '20px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#4CAF50',
      marginBottom: '15px',
    },
    sectionContent: {
      marginTop: '15px',
    },
    item: {
      marginBottom: '15px',
      borderBottom: '1px dotted #ddd',
      paddingBottom: '15px',
    },
    itemTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '5px',
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
      marginBottom: '5px',
      borderLeft: '2px solid #4CAF50',
      paddingLeft: '8px',
    },
    itemDescription: {
      fontSize: '14px',
      whiteSpace: 'pre-line',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px',
    },
    skill: {
      padding: '5px 12px',
      fontSize: '13px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      borderRadius: '3px',
    },
  },

  // 5. Bold Professional
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
    },
    header: {
      marginBottom: '25px',
      borderBottom: '2px solid #003366',
      paddingBottom: '20px',
    },
    name: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '5px',
      color: '#003366',
    },
    contact: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px',
    },
    section: {
      marginBottom: '25px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#003366',
      marginBottom: '15px',
      paddingBottom: '5px',
      borderBottom: '2px solid #003366',
    },
    sectionContent: {
      marginTop: '15px',
    },
    item: {
      marginBottom: '15px',
    },
    itemTitle: {
      fontSize: '17px',
      fontWeight: 700,
      color: '#333',
      marginBottom: '2px',
    },
    itemSubtitle: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#003366',
    },
    itemDate: {
      fontSize: '14px',
      color: '#666',
      fontWeight: 500,
      marginBottom: '5px',
    },
    itemDescription: {
      fontSize: '14px',
      whiteSpace: 'pre-line',
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px',
    },
    skill: {
      padding: '5px 12px',
      fontSize: '13px',
      backgroundColor: '#003366',
      color: '#fff',
      borderRadius: '3px',
      fontWeight: 500,
    },
  },
};

// Resume Template Component
const ResumeTemplate = ({ 
  data, 
  templateName = 'modern' 
}: { 
  data: ResumeData; 
  templateName?: string;
}) => {
  const styles = templateStyles[templateName] || templateStyles.modern;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.name}>{data.personal.name || 'Your Name'}</div>
        <div style={styles.contact}>
          {data.personal.email && (
            <span>{data.personal.email}</span>
          )}
          {data.personal.phone && (
            <span>{data.personal.phone}</span>
          )}
          {data.personal.address && (
            <span>{data.personal.address}</span>
          )}
          {data.personal.website && (
            <span>{data.personal.website}</span>
          )}
          {data.personal.linkedin && (
            <span>{data.personal.linkedin}</span>
          )}
        </div>
      </div>
      
      {/* Summary */}
      {data.personal.summary && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Summary</div>
          <div style={styles.itemDescription}>{data.personal.summary}</div>
        </div>
      )}
      
      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Experience</div>
          <div style={styles.sectionContent}>
            {data.experience.map((exp) => (
              <div key={exp.id} style={styles.item}>
                <div style={styles.itemTitle}>{exp.title}</div>
                <div style={styles.itemSubtitle}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                <div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                <div style={styles.itemDescription}>{exp.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Education</div>
          <div style={styles.sectionContent}>
            {data.education.map((edu) => (
              <div key={edu.id} style={styles.item}>
                <div style={styles.itemTitle}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                <div style={styles.itemSubtitle}>{edu.school}</div>
                <div style={styles.itemDate}>{edu.startDate} - {edu.endDate}</div>
                {edu.description && <div style={styles.itemDescription}>{edu.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Skills</div>
          <div style={styles.skillsList}>
            {data.skills.map((skill, index) => (
              <div key={index} style={styles.skill}>{skill}</div>
            ))}
          </div>
        </div>
      )}
      
      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Projects</div>
          <div style={styles.sectionContent}>
            {data.projects.map((project) => (
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
      )}
    </div>
  );
};

export default ResumeTemplate;
