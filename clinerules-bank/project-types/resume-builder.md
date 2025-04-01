
# Resume Builder Features

## Resume Templates
- Multiple template styles are available: modern, classic, creative, technical, professional
- Each template has its own styling defined in templateStyles.ts
- Templates can be customized for font, color, spacing, etc.

## Customization Options
- **Color**: Primary, secondary, and accent colors
- **Typography**: Font family, size, line height
- **Spacing**: Section margins, element spacing
- **Layout**: Different layout types (creative, compact, standard, minimal)
- **Photo**: Option to show/hide profile photo

## Resume Sections
- Personal Information
- Skills
- Work Experience
- Education
- Projects
- Additional sections can be added/removed

## Avatar Upload
- Users can upload profile photos
- Photos are displayed in real-time in the resume preview
- Avatar uploader uses the AvatarUploader component

## Preview & Export
- Live preview of the resume shows changes in real-time
- Resumes can be printed or exported to PDF

## Data Structure
- The ResumeData interface defines the structure of resume data
- This includes personal information, skills, education, work experience, etc.
- The customization property contains all styling options

## UI Components
- TemplatesSection: Displays available templates
- CustomizationPanel: Controls for customizing the resume
- ResumePreview: Shows a live preview of the resume
- AvatarUploader: For uploading and cropping profile photos
