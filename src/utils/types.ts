
// Define the ResumeData interface to include all necessary properties for the resume builder

export interface ResumeData {
  personal?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    website?: string;
    location?: string;
    summary?: string;
  };
  skills?: string[];
  education?: {
    institution: string;
    degree: string;
    date: string;
    description?: string;
  }[];
  experience?: {
    company: string;
    position: string;
    date: string;
    description?: string;
    highlights?: string[];
  }[];
  projects?: {
    name: string;
    description: string;
    link?: string;
    technologies?: string[];
  }[];
  customization: {
    primaryColor?: string;
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
    profileImage?: any; // Using any for now, but ideally this should be properly typed
    sectionTitles?: {
      skills?: string;
      education?: string;
      experience?: string;
      projects?: string;
      [key: string]: string | undefined;
    };
  };
  selectedTemplate?: string;
}

export interface CustomizationPanelProps {
  customization: ResumeData["customization"];
  onCustomizationChange: (customization: ResumeData["customization"]) => void;
  resumeData: ResumeData;
  onSectionOrderChange?: (newOrder: string[]) => void;
  onSectionTitleChange?: (sectionId: string, newTitle: string) => void;
}
