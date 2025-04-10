
import { ResumeData as TypesResumeData } from '@/utils/types';

// Define the internal ResumeData structure used in the Resume Builder
export interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    address?: string; // Make address optional to match with TypesResumeData
    summary: string;
    website?: string;
    linkedin?: string;
  };
  experience: {
    id: number;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }[];
  education: {
    id: number;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: string[];
  projects?: {
    id: number;
    title: string;
    description: string;
    link?: string;
    technologies?: string[];
  }[];
  customization: {
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    spacing?: string;
    headingStyle?: string;
    sectionMargins?: string;
    lineHeight?: string;
    showPhoto?: boolean;
    layoutType?: "creative" | "compact" | "standard" | "minimal";
    profileImage?: any;
    sectionTitles?: {
      [key: string]: string | undefined;
    };
  };
  selectedTemplate?: string;
}

// Convert from builder format to types format
export const adaptResumeData = (data: ResumeData): TypesResumeData => {
  return {
    personal: {
      name: data.personal?.name || '',
      title: data.personal?.name || '',
      email: data.personal?.email || '',
      phone: data.personal?.phone || '',
      website: data.personal?.website || '',
      location: data.personal?.address || '', // Map address to location
      linkedin: data.personal?.linkedin || '',
      summary: data.personal?.summary || '',
    },
    skills: data.skills || [],
    education: data.education?.map(edu => ({
      institution: edu.school,
      degree: `${edu.degree} ${edu.field ? `in ${edu.field}` : ''}`,
      date: `${edu.startDate} - ${edu.endDate}`,
      description: edu.description
    })) || [],
    experience: data.experience?.map(exp => ({
      company: exp.company,
      position: exp.title,
      date: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
      description: exp.description,
      highlights: exp.description?.split('\n').filter(line => line.trim().startsWith('•')) || []
    })) || [],
    projects: data.projects?.map(project => ({
      name: project.title,
      description: project.description,
      link: project.link,
      technologies: project.technologies
    })) || [],
    customization: {
      primaryColor: data.customization?.primaryColor || '#2563eb', // Provide default value
      secondaryColor: data.customization?.secondaryColor,
      accentColor: data.customization?.accentColor,
      textColor: data.customization?.textColor,
      backgroundColor: data.customization?.backgroundColor,
      fontSize: data.customization?.fontSize,
      fontFamily: data.customization?.fontFamily,
      spacing: data.customization?.spacing,
      headingStyle: data.customization?.headingStyle,
      sectionMargins: data.customization?.sectionMargins,
      lineHeight: data.customization?.lineHeight,
      showPhoto: data.customization?.showPhoto,
      layoutType: data.customization?.layoutType,
      profileImage: data.customization?.profileImage,
      sectionTitles: data.customization?.sectionTitles
    },
    selectedTemplate: data.selectedTemplate
  };
};

// Convert from types format to builder format
export const reverseAdaptResumeData = (data: TypesResumeData): Partial<ResumeData> => {
  return {
    personal: {
      name: data.personal?.name || '',
      email: data.personal?.email || '',
      phone: data.personal?.phone || '',
      address: data.personal?.location || '', // Map location to address
      summary: data.personal?.summary || '',
      website: data.personal?.website || '',
      linkedin: data.personal?.linkedin || ''
    },
    skills: data.skills || [],
    experience: data.experience?.map((exp, index) => ({
      id: index + 1,
      title: exp.position || '',
      company: exp.company || '',
      location: '',
      startDate: exp.date?.split('-')[0]?.trim() || '',
      endDate: exp.date?.includes('Present') ? '' : exp.date?.split('-')[1]?.trim() || '',
      current: exp.date?.includes('Present') || false,
      description: exp.description || '',
    })) || [],
    education: data.education?.map((edu, index) => ({
      id: index + 1,
      school: edu.institution || '',
      degree: edu.degree?.split('in')[0]?.trim() || '',
      field: edu.degree?.includes('in') ? edu.degree?.split('in')[1]?.trim() || '' : '',
      startDate: edu.date?.split('-')[0]?.trim() || '',
      endDate: edu.date?.split('-')[1]?.trim() || '',
      description: edu.description || '',
    })) || [],
    projects: data.projects?.map((project, index) => ({
      id: index + 1,
      title: project.name,
      description: project.description,
      link: project.link,
      technologies: project.technologies
    })) || [],
    customization: {
      primaryColor: data.customization?.primaryColor || '#2563eb', // Ensure primaryColor always has a value
      secondaryColor: data.customization?.secondaryColor,
      accentColor: data.customization?.accentColor,
      textColor: data.customization?.textColor,
      backgroundColor: data.customization?.backgroundColor,
      fontSize: data.customization?.fontSize,
      fontFamily: data.customization?.fontFamily,
      spacing: data.customization?.spacing,
      headingStyle: data.customization?.headingStyle,
      sectionMargins: data.customization?.sectionMargins,
      lineHeight: data.customization?.lineHeight,
      showPhoto: data.customization?.showPhoto,
      layoutType: data.customization?.layoutType,
      profileImage: data.customization?.profileImage,
      sectionTitles: data.customization?.sectionTitles
    }
  };
};
