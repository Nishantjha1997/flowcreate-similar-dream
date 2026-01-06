# 🛠️ Technology Stack

## Frontend

### Core Framework
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities
- **class-variance-authority (CVA)** - Component variant management
- **clsx & tailwind-merge** - Conditional class handling

### UI Component Library
- **shadcn/ui** - Pre-built accessible components
- **Radix UI** - Headless UI primitives (Dialog, Dropdown, Tabs, etc.)
- **Lucide React** - Icon library

### State Management
- **TanStack React Query v5** - Server state management, caching
- **React Context** - App-level state (Auth, Theme, Design Mode)
- **React Hook Form + Zod** - Form handling and validation

### Routing
- **React Router DOM v6** - Client-side routing with lazy loading

### Additional Libraries
- **html2pdf.js** - PDF generation from HTML
- **date-fns** - Date manipulation
- **recharts** - Charts and data visualization
- **react-beautiful-dnd** - Drag and drop functionality
- **embla-carousel-react** - Carousel component
- **sonner** - Toast notifications
- **framer-motion** - Animations (via vaul drawer)

## Backend

### Supabase
- **Supabase JS v2.49.4** - Client SDK
- **PostgreSQL** - Database
- **Row Level Security (RLS)** - Data access control
- **Edge Functions** - Serverless backend logic (Deno)
- **Auth** - User authentication
- **Storage** - File storage (planned)

### Edge Functions
Located in `supabase/functions/`:
1. `admin-create-user` - Admin user creation
2. `create-razorpay-order` - Payment order creation
3. `verify-razorpay-payment` - Payment verification
4. `extract-resume-data` - PDF resume parsing with AI
5. `gemini-suggest` - AI suggestions for resume content

### External Services
- **Razorpay** - Payment gateway (Indian market)
- **Google Gemini AI** - Resume suggestions and PDF parsing

## Project Configuration

### Build & Dev
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Path Aliases
```typescript
// vite.config.ts & tsconfig.json
"@/*" → "./src/*"
```

### Important Files
- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `supabase/config.toml` - Supabase local config
- `components.json` - shadcn/ui configuration
