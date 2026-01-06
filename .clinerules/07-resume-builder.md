# 📄 Resume Builder Feature

## Overview
The core feature of the application - a real-time resume builder with multiple templates, customization options, and PDF export.

## Main Components

### Page Component
`src/pages/ResumeBuilder.tsx` - Main resume builder page

### Key Components

#### Sidebar (Left Panel)
`src/components/resume/ResumeBuilderSidebar.tsx`
- Section navigation tabs
- Form inputs for each section
- Template selector
- Customization options

#### Preview (Right Panel)
`src/components/resume/ResumePreviewSection.tsx`
`src/components/resume/OptimizedResumePreview.tsx`
- Live preview of the resume
- Updates in real-time as user types
- Supports all templates

#### Form Sections
Located in `src/components/resume/`:
- `PersonalInfoSection.tsx` - Name, email, phone, links
- `ExperienceSection.tsx` - Work experience entries
- `EducationSection.tsx` - Education entries
- `SkillsSection.tsx` - Skills list
- `ProjectsSection.tsx` - Project entries

#### Template System
- `TemplateSelector.tsx` - Template picker carousel
- `src/utils/resumeTemplates.tsx` - Template definitions
- `src/utils/templateStyles.ts` - Template styling

## Resume Data Structure

```typescript
interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
    website?: string;
    summary?: string;
    photo?: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    location?: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    description?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  customization: ResumeCustomization;
}

interface ResumeCustomization {
  template: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  sectionSpacing: number;
  showPhoto: boolean;
  layout: 'standard' | 'compact' | 'creative' | 'minimal';
}
```

## Templates

### Available Templates
1. **Modern** - Clean, contemporary design
2. **Classic** - Traditional professional layout
3. **Creative** - Bold, design-focused
4. **Technical** - Developer/engineer focused
5. **Professional** - Corporate style

### Template Definition
```typescript
// src/utils/resumeTemplates.tsx
export const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary',
    preview: '/templates/modern.png',
    isPremium: false,
  },
  // ...
];
```

## Customization Options

### Colors
- Primary color (headings, accents)
- Secondary color (subheadings, links)

### Typography
- Font family selection
- Font size (base)
- Line height

### Layout
- Section spacing
- Layout type (standard, compact, creative, minimal)
- Show/hide photo

## Key Hooks

### useResumeData
```typescript
const {
  resumeData,
  updateResumeData,
  updatePersonalInfo,
  addExperience,
  updateExperience,
  removeExperience,
  // ... similar for other sections
} = useResumeData();
```

### useResumeSave
```typescript
const { saveResume, isSaving, lastSaved } = useResumeSave(resumeData);
```

### useResumeProfileSync
```typescript
const { fillFromProfile, isSyncing } = useResumeProfileSync();
// Populates resume from user profile data
```

### usePDFGenerator
```typescript
const { generatePDF, isGenerating } = usePDFGenerator();
// Generates PDF from resume preview
```

## Features

### 1. Real-Time Preview
Changes reflect immediately in the preview panel.

### 2. Fill from Profile
Button to auto-populate resume from user's saved profile.

### 3. Section Reordering
Drag-and-drop to reorder resume sections.
Component: `SectionDragDropCustomizer.tsx`

### 4. PDF Export
Uses html2pdf.js to generate downloadable PDF.

### 5. Template Switching
Change templates while preserving content.

### 6. Auto-Save
Automatically saves resume to database with debouncing.

## Data Flow

```
User Input → ResumeBuilderSidebar → useResumeData (state update)
                                           ↓
                                   OptimizedResumePreview (re-render)
                                           ↓
                                   useResumeSave (debounced save to DB)
```

## File Structure
```
src/components/resume/
├── ResumeBuilderSidebar.tsx    # Main sidebar container
├── ResumePreviewSection.tsx    # Preview container
├── OptimizedResumePreview.tsx  # Optimized preview renderer
├── ResumeFormSection.tsx       # Section wrapper
├── ResumeHeaderSection.tsx     # Header with name/title
├── PersonalInfoSection.tsx     # Personal info form
├── ExperienceSection.tsx       # Experience entries form
├── EducationSection.tsx        # Education entries form
├── SkillsSection.tsx           # Skills input
├── ProjectsSection.tsx         # Projects form
├── TemplateSelector.tsx        # Template picker
├── SectionNav.tsx              # Section navigation
├── SectionDragDropCustomizer.tsx # Drag-drop reorder
├── AiSuggestionButton.tsx      # AI enhancement button
├── ResumeData.ts               # Type definitions
└── ResumeNavigation.tsx        # Top navigation
```
