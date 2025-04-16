
export interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    website?: string;
    linkedin?: string;
    profileImage?: string;
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
  languages?: {
    language: string;
    proficiency: string;
  }[];
  interests?: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }[];
  volunteer?: {
    organization: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  customization: {
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    textColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontSize?: 'small' | 'medium' | 'large';
    spacing?: 'compact' | 'normal' | 'spacious';
    sectionMargins?: 'small' | 'medium' | 'large';
    lineHeight?: 'tight' | 'normal' | 'relaxed';
    layoutType?: 'standard' | 'compact' | 'minimal' | 'creative';
    headingStyle?: 'bold' | 'underlined' | 'capitalized' | 'minimal';
    showPhoto?: boolean;
    paperType?: 'standard' | 'textured' | 'minimal';
    textDensity?: number;
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
