export const templateStyles = {
  modern: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-lg",
    header: "bg-blue-600 text-white p-8",
    headerName: "text-4xl font-bold",
    headerTitle: "text-xl mt-2",
    headerContact: "mt-4 flex flex-wrap gap-4 text-sm",
    section: "p-6 border-b",
    sectionTitle: "text-2xl font-bold text-blue-600 mb-4",
    subsection: "mb-4",
    subsectionTitle: "text-lg font-bold flex justify-between",
    subsectionDate: "text-gray-500",
    subsectionContent: "mt-2 text-gray-700",
    skillsContainer: "flex flex-wrap gap-2",
    skillBadge: "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm",
  },
  classic: {
    container: "font-serif max-w-4xl mx-auto bg-white shadow-lg",
    header: "text-center py-8 border-b-2 border-gray-300",
    headerName: "text-4xl font-bold",
    headerTitle: "text-xl mt-2 text-gray-600",
    headerContact: "mt-4 flex justify-center flex-wrap gap-4 text-sm text-gray-600",
    section: "p-6 border-b border-gray-200",
    sectionTitle: "text-2xl font-bold mb-4 text-gray-800 border-b pb-2",
    subsection: "mb-6",
    subsectionTitle: "text-lg font-bold text-gray-800 flex justify-between",
    subsectionDate: "text-gray-600",
    subsectionContent: "mt-2 text-gray-700",
    skillsContainer: "flex flex-wrap gap-2",
    skillBadge: "border border-gray-300 px-3 py-1 rounded text-sm",
  },
  creative: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-lg",
    header: "bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-t-lg",
    headerName: "text-4xl font-bold",
    headerTitle: "text-xl mt-2",
    headerContact: "mt-4 flex flex-wrap gap-4 text-sm",
    section: "p-6 border-b",
    sectionTitle: "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-4",
    subsection: "mb-6",
    subsectionTitle: "text-lg font-bold flex justify-between",
    subsectionDate: "text-gray-500",
    subsectionContent: "mt-2 text-gray-700",
    skillsContainer: "flex flex-wrap gap-2",
    skillBadge: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-sm",
  },
  technical: {
    container: "font-mono max-w-4xl mx-auto bg-white shadow-lg",
    header: "bg-gray-900 text-white p-8",
    headerName: "text-4xl font-bold",
    headerTitle: "text-xl mt-2 text-gray-300",
    headerContact: "mt-4 flex flex-wrap gap-4 text-sm text-gray-300",
    section: "p-6 border-b border-gray-200",
    sectionTitle: "text-2xl font-bold text-gray-900 mb-4 border-l-4 border-gray-900 pl-2",
    subsection: "mb-6",
    subsectionTitle: "text-lg font-bold flex justify-between",
    subsectionDate: "text-gray-500",
    subsectionContent: "mt-2 text-gray-700",
    skillsContainer: "grid grid-cols-2 md:grid-cols-3 gap-2",
    skillBadge: "bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm border-l-4 border-gray-800",
  },
  professional: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-lg",
    header: "bg-gray-100 p-8 border-b-4 border-blue-700",
    headerName: "text-4xl font-bold text-gray-800",
    headerTitle: "text-xl mt-2 text-blue-700",
    headerContact: "mt-4 flex flex-wrap gap-4 text-sm text-gray-600",
    section: "p-6 border-b border-gray-200",
    sectionTitle: "text-2xl font-bold text-blue-700 mb-4",
    subsection: "mb-6",
    subsectionTitle: "text-lg font-bold text-gray-800 flex justify-between",
    subsectionDate: "text-blue-700",
    subsectionContent: "mt-2 text-gray-700",
    skillsContainer: "flex flex-wrap gap-2",
    skillBadge: "bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm border border-blue-200",
  },
  minimalist: {
    container: "font-sans max-w-[800px] mx-auto p-10 bg-white text-gray-800 shadow-lg min-h-[1100px]",
    header: "mb-6",
    name: "text-2xl font-light text-center",
    contactInfo: "text-sm text-center text-gray-600 mt-1 space-x-2",
    contactItem: "inline-flex items-center",
    summary: "text-sm leading-relaxed border-b pb-4 text-center",
    sectionContainer: "mt-4",
    sectionTitle: "text-sm uppercase tracking-widest mb-3 font-medium",
    experienceItem: "mb-3",
    experienceTitle: "text-base font-medium",
    experienceCompany: "text-sm",
    experienceDates: "text-xs text-gray-600",
    experienceDescription: "text-sm mt-1 whitespace-pre-line",
    educationItem: "mb-3",
    educationSchool: "text-base font-medium",
    educationDegree: "text-sm",
    educationDates: "text-xs text-gray-600",
    skillsContainer: "flex flex-wrap gap-2",
    skill: "text-xs px-2 py-1 bg-gray-100 rounded-sm"
  },
  executive: {
    container: "font-serif max-w-[800px] mx-auto p-10 bg-white text-gray-800 shadow-lg min-h-[1100px] border-t-8 border-gray-700",
    header: "mb-8",
    name: "text-3xl font-bold text-gray-800 border-b-2 pb-2",
    contactInfo: "text-sm text-gray-600 mt-3 flex flex-wrap gap-x-4 gap-y-1",
    contactItem: "inline-flex items-center",
    summary: "text-base leading-relaxed my-4",
    sectionContainer: "mt-6",
    sectionTitle: "text-lg font-bold mb-3 text-gray-800 border-b pb-1",
    experienceItem: "mb-4",
    experienceTitle: "text-base font-bold",
    experienceCompany: "text-base italic",
    experienceDates: "text-sm text-gray-600",
    experienceDescription: "text-sm mt-2 whitespace-pre-line",
    educationItem: "mb-4",
    educationSchool: "text-base font-bold",
    educationDegree: "text-base",
    educationDates: "text-sm text-gray-600",
    skillsContainer: "flex flex-wrap gap-2",
    skill: "text-sm px-3 py-1 bg-gray-200 rounded"
  }
};

export type TemplateStylesKey = keyof typeof templateStyles;

export const getTemplateStyle = (templateKey: string) => {
  return templateStyles[templateKey as TemplateStylesKey] || templateStyles.modern;
};

export const applyCustomization = (
  baseStyles: typeof templateStyles.modern,
  customization: any
) => {
  let customizedStyles = { ...baseStyles };
  
  // Apply font family
  if (customization?.fontFamily && customization.fontFamily !== 'default') {
    const fontFamilyStyle = `font-family: ${customization.fontFamily};`;
    customizedStyles.container = `${customizedStyles.container} style="${fontFamilyStyle}"`;
  }
  
  // Apply font size
  if (customization?.fontSize) {
    let fontSizeClass = '';
    switch (customization.fontSize) {
      case 'small':
        fontSizeClass = 'text-sm';
        break;
      case 'medium':
        fontSizeClass = 'text-base';
        break;
      case 'large':
        fontSizeClass = 'text-lg';
        break;
    }
    customizedStyles.container = `${customizedStyles.container} ${fontSizeClass}`;
  }
  
  // Apply spacing
  if (customization?.spacing) {
    let spacingClass = '';
    switch (customization.spacing) {
      case 'compact':
        spacingClass = 'space-y-2';
        break;
      case 'normal':
        spacingClass = 'space-y-4';
        break;
      case 'spacious':
        spacingClass = 'space-y-6';
        break;
    }
    customizedStyles.container = `${customizedStyles.container} ${spacingClass}`;
  }
  
  // Apply primary color (assuming it's used in headers and titles)
  if (customization?.primaryColor) {
    // We need to handle this in the actual component rendering since it might need inline styles
  }
  
  // Apply secondary color
  if (customization?.secondaryColor) {
    // We need to handle this in the actual component rendering since it might need inline styles
  }
  
  return customizedStyles;
};

export const templateNameMap = {
  modern: "modern",
  classic: "classic", 
  creative: "creative",
  technical: "technical",
  professional: "professional",
  minimalist: "minimalist",
  executive: "executive"
};
