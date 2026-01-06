# 📄 ResumeForge - Professional Resume Builder & ATS Platform

A full-stack resume builder application with an integrated Applicant Tracking System (ATS). Built with React, TypeScript, and Supabase.

## 🌟 Features

### Resume Builder
- **Multiple Templates**: Modern, Classic, Creative, Technical, Professional
- **Real-time Preview**: See changes instantly as you type
- **Customization**: Colors, fonts, spacing, layout options
- **PDF Export**: Download your resume as PDF
- **Profile Sync**: Fill resume from saved profile data
- **Section Reordering**: Drag-and-drop section arrangement

### User Profile
- Comprehensive profile management
- Auto-save functionality
- Profile completeness tracking
- PDF resume upload with AI parsing

### ATS (Applicant Tracking System)
- Organization management
- Job posting and publishing
- Candidate pipeline (Kanban-style)
- Interview scheduling
- Talent pools
- Team collaboration

### AI Features
- Resume content suggestions
- PDF resume parsing
- Match scoring (planned)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: TanStack React Query, React Context
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Razorpay
- **AI**: Google Gemini

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── admin/        # Admin dashboard
│   ├── profile/      # User profile forms
│   ├── resume/       # Resume builder
│   └── templates/    # Template components
├── hooks/            # Custom React hooks
├── pages/            # Route pages
│   └── ats/          # ATS module pages
├── integrations/     # Supabase client
├── utils/            # Utilities and types
└── lib/              # Helper functions

supabase/
├── functions/        # Edge functions
└── migrations/       # Database migrations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
The project uses Supabase for backend. Required secrets are configured in Supabase:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `GEMINI_API_KEY`

## 📖 Documentation

Detailed documentation is available in `.clinerules/`:
- `00-project-overview.md` - Project summary
- `01-tech-stack.md` - Technology details
- `02-project-structure.md` - File organization
- `03-database-schema.md` - Database documentation
- `04-routing.md` - Routes and navigation
- `05-state-management.md` - State patterns
- `06-theming-styling.md` - Design system
- `07-resume-builder.md` - Resume feature docs
- `08-authentication.md` - Auth system
- `09-edge-functions.md` - Backend functions
- `10-ats-module.md` - ATS documentation
- `11-payments.md` - Payment integration
- `12-ai-features.md` - AI capabilities
- `13-development-guidelines.md` - Coding standards

## 🎨 Theming

The application supports:
- **Light/Dark Mode**: System-aware theme switching
- **Neo-Brutalism Mode**: Bold, high-contrast design option

## 🔒 Security

- Row Level Security (RLS) on all tables
- Role-based access control
- Secure API key management
- Payment signature verification

## 📱 Responsive Design

Fully responsive across:
- Desktop (1280px+)
- Tablet (768px - 1279px)
- Mobile (< 768px)

## 🤝 Contributing

1. Check `.clinerules/TASK.md` for current tasks
2. Follow guidelines in `.clinerules/13-development-guidelines.md`
3. Test in both light and dark modes
4. Ensure neo-brutalism compatibility

## 📄 License

[Add your license here]

## 🔗 Links

- [Lovable Project](https://lovable.dev/projects/d8cf94cf-ef67-4735-8e54-18b509204d5e)
- [Documentation](https://docs.lovable.dev)
