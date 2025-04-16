
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
    profileImage?: string; // Add profile image field
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
    fontSize?: 'small' | 'medium' | 'large';
    fontFamily?: string;
    spacing?: 'compact' | 'normal' | 'spacious';
    headingStyle?: 'bold' | 'underlined' | 'capitalized' | 'minimal';
    sectionMargins?: 'small' | 'medium' | 'large';
    lineHeight?: 'tight' | 'normal' | 'relaxed';
    layoutType?: 'standard' | 'compact' | 'minimal' | 'creative';
    showPhoto?: boolean;
    profileImage?: {
      src: string | null;
      size: number;
      shape: 'circle' | 'square' | 'rounded';
    };
    sectionTitles?: Record<string, string>;
    sectionsOrder?: string[];
    hiddenSections?: string[];
  };
  selectedTemplate?: string;
}

// Convert from builder format to types format
export const adaptResumeData = (data: ResumeData): TypesResumeData => {
  return {
    personal: {
      name: data.personal?.name || '',
      email: data.personal?.email || '',
      phone: data.personal?.phone || '',
      address: data.personal?.address || '',
      website: data.personal?.website || '',
      linkedin: data.personal?.linkedin || '',
      summary: data.personal?.summary || '',
      profileImage: data.personal?.profileImage || '',
    },
    skills: data.skills || [],
    education: data.education?.map(edu => ({
      id: edu.id,
      school: edu.school,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description
    })) || [],
    experience: data.experience?.map(exp => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.description
    })) || [],
    projects: data.projects?.map(project => ({
      id: project.id,
      title: project.title,
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
      layoutType: data.customization?.layoutType,
      showPhoto: data.customization?.showPhoto,
      profileImage: data.customization?.profileImage,
      sectionTitles: data.customization?.sectionTitles,
      sectionsOrder: data.customization?.sectionsOrder,
      hiddenSections: data.customization?.hiddenSections
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
      address: data.personal?.address || '',
      summary: data.personal?.summary || '',
      website: data.personal?.website || '',
      linkedin: data.personal?.linkedin || '',
      profileImage: data.personal?.profileImage || ''
    },
    skills: data.skills || [],
    experience: data.experience?.map((exp, index) => ({
      id: exp.id || index + 1,
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: exp.current || false,
      description: exp.description || '',
    })) || [],
    education: data.education?.map((edu, index) => ({
      id: edu.id || index + 1,
      school: edu.school || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      description: edu.description || '',
    })) || [],
    projects: data.projects?.map((project, index) => ({
      id: project.id || index + 1,
      title: project.title || '',
      description: project.description || '',
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
      sectionTitles: data.customization?.sectionTitles,
      sectionsOrder: data.customization?.sectionsOrder,
      hiddenSections: data.customization?.hiddenSections
    }
  };
};
