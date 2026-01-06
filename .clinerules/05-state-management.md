# 🔄 State Management

## Overview
The application uses a combination of React Query for server state and React Context for client state.

## Server State (React Query)

### Setup
```typescript
// src/App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
});
```

### Key Query Hooks

#### `useUserProfile` (src/hooks/useUserProfile.ts)
Manages user profile data.
```typescript
const { data: profile, isLoading, updateProfile } = useUserProfile();
```

#### `useResumeData` (src/hooks/useResumeData.ts)
Manages resume document data.
```typescript
const { resumeData, updateResumeData, saveResume } = useResumeData();
```

#### `usePremiumStatus` (src/hooks/usePremiumStatus.ts)
Checks user's subscription status.
```typescript
const { isPremium, isLoading } = usePremiumStatus();
```

#### `useTemplates` (src/hooks/useTemplates.ts)
Fetches available resume templates.

#### `useAdminStatus` (src/hooks/useAdminStatus.ts)
Checks if user has admin role.

## Client State (React Context)

### AuthContext (src/hooks/useAuth.tsx)
Provides authentication state and methods.
```typescript
const { user, session, loading, signIn, signUp, signOut } = useAuth();
```

**Provider**: `<AuthProvider>` wraps the app.

### ThemeContext (src/components/ThemeProvider.tsx)
Manages light/dark theme.
```typescript
const { theme, setTheme } = useTheme();
// theme: 'light' | 'dark' | 'system'
```

**Provider**: `<ThemeProvider defaultTheme="light">`

### DesignModeContext (src/hooks/useDesignMode.tsx)
Manages neo-brutalism design mode toggle.
```typescript
const { isNeoBrutalism, toggleDesignMode } = useDesignMode();
```

**Provider**: `<DesignModeProvider>`

## Local Component State

### Form State
Use React Hook Form for complex forms:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... }
});
```

### Resume Builder State
The resume builder uses local state for the current editing session:
```typescript
const [resumeData, setResumeData] = useState<ResumeData>(initialData);
const [activeSection, setActiveSection] = useState('personal');
const [selectedTemplate, setSelectedTemplate] = useState('modern');
```

## Auto-Save Pattern

### useAutoSave Hook (src/hooks/useAutoSave.ts)
Implements debounced auto-save for profile/resume data.
```typescript
const { isSaving, lastSaved, saveNow } = useAutoSave({
  data: profileData,
  onSave: async (data) => await saveToDatabase(data),
  debounceMs: 2000,
});
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                    React Query                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ useUserProfile│  │ useResumeData│  │ useTemplates│ │
│  └──────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                  Supabase Client                     │
│              src/integrations/supabase/client.ts     │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 PostgreSQL Database                  │
│                 (with RLS policies)                  │
└─────────────────────────────────────────────────────┘
```

## Best Practices

1. **Use React Query for server data** - profiles, resumes, subscriptions
2. **Use Context for app-wide client state** - auth, theme, design mode
3. **Use local state for ephemeral UI state** - form inputs, modals, active tabs
4. **Implement optimistic updates** for better UX
5. **Use `staleTime` to prevent unnecessary refetches**
