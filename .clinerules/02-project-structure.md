# 📁 Project Structure

```
├── public/                    # Static assets
│   ├── images/               # Public images
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── App.tsx               # Main app with routes and providers
│   ├── main.tsx              # Entry point
│   ├── index.css             # Global styles, CSS variables, theme tokens
│   │
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (button, card, dialog, etc.)
│   │   ├── admin/            # Admin dashboard components
│   │   ├── profile/          # User profile form components
│   │   ├── resume/           # Resume builder components
│   │   └── templates/        # Template-related components
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.tsx       # Authentication context & hook
│   │   ├── useDesignMode.tsx # Neo-brutalism theme toggle
│   │   ├── useResumeData.ts  # Resume data management
│   │   ├── useUserProfile.ts # User profile CRUD
│   │   ├── usePremiumStatus.ts
│   │   └── ...
│   │
│   ├── pages/                # Route page components
│   │   ├── Index.tsx         # Landing page
│   │   ├── Account.tsx       # User profile/account page
│   │   ├── ResumeBuilder.tsx # Main resume builder
│   │   ├── Admin.tsx         # Admin dashboard
│   │   ├── ats/              # ATS module pages
│   │   │   ├── ATSDashboard.tsx
│   │   │   ├── ATSJobs.tsx
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client instance
│   │       └── types.ts      # Auto-generated DB types (READ-ONLY)
│   │
│   ├── lib/
│   │   └── utils.ts          # Utility functions (cn, etc.)
│   │
│   └── utils/
│       ├── types.ts          # Shared TypeScript types
│       ├── resumeTemplates.tsx   # Template definitions
│       ├── templateStyles.ts     # Template styling
│       ├── resumeAdapterUtils.ts # Data transformation
│       └── ai/
│           └── gemini.ts     # Gemini AI client utility
│
├── supabase/
│   ├── config.toml           # Supabase configuration
│   ├── migrations/           # Database migrations (READ-ONLY)
│   └── functions/            # Edge functions
│       ├── _shared/          # Shared utilities
│       │   └── aiKeyManager.ts
│       ├── admin-create-user/
│       ├── create-razorpay-order/
│       ├── verify-razorpay-payment/
│       ├── extract-resume-data/
│       └── gemini-suggest/
│
├── .clinerules/              # AI development documentation
│   ├── 00-project-overview.md
│   ├── 01-tech-stack.md
│   ├── 02-project-structure.md
│   └── ...
│
└── Configuration Files
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    └── eslint.config.js
```

## Key Directories Explained

### `/src/components/ui/`
Contains shadcn/ui components. These are copied from the shadcn library and can be customized. Common components: Button, Card, Dialog, Input, Select, Tabs, Toast, etc.

### `/src/components/profile/`
User profile management components for the Account page:
- `PersonalInfoForm.tsx` - Name, email, phone, address
- `ProfessionalInfoForm.tsx` - Summary, current position
- `WorkExperienceForm.tsx` - Job history
- `EducationForm.tsx` - Education entries
- `SkillsForm.tsx` - Technical and soft skills
- `ProjectsForm.tsx` - Portfolio projects
- `CertificationsForm.tsx` - Certifications
- `VolunteerForm.tsx` - Volunteer experience
- `ProfileCompletenessCard.tsx` - Progress indicator

### `/src/components/resume/`
Resume builder components:
- `ResumeBuilderSidebar.tsx` - Left sidebar with form sections
- `ResumePreviewSection.tsx` - Live preview panel
- `OptimizedResumePreview.tsx` - Performant preview renderer
- `TemplateSelector.tsx` - Template picker
- `SectionDragDropCustomizer.tsx` - Section reordering
- Section components: PersonalInfoSection, ExperienceSection, etc.

### `/src/pages/ats/`
ATS (Applicant Tracking System) module:
- `ATSLanding.tsx` - ATS marketing page
- `ATSDashboard.tsx` - Main ATS dashboard
- `ATSJobs.tsx` - Job listings management
- `ATSJobCreate.tsx` - Create new job
- `ATSJobDetail.tsx` - Job details with pipeline
- `ATSApplicationDetail.tsx` - Candidate application view
- `ATSSettings.tsx` - Organization settings
