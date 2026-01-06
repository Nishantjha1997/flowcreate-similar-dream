# 🔐 Authentication System

## Overview
Authentication is handled via Supabase Auth with a custom React context wrapper.

## Auth Provider

### Location
`src/hooks/useAuth.tsx`

### Setup in App
```typescript
// src/App.tsx
<AuthProvider>
  {/* App content */}
</AuthProvider>
```

## useAuth Hook

### Interface
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

### Usage
```typescript
const { user, session, loading, signIn, signUp, signOut } = useAuth();

// Check if authenticated
if (loading) return <Loading />;
if (!user) return <Navigate to="/login" />;

// Sign in
await signIn(email, password);

// Sign out
await signOut();
```

## Auth Pages

### Login Page
`src/pages/Login.tsx`
- Email/password login form
- Link to registration
- Link to forgot password

### Register Page
`src/pages/Register.tsx`
- Email/password registration
- Creates user in Supabase Auth
- Creates profile entry in `profiles` table

### Forgot Password
`src/pages/ForgotPassword.tsx`
- Password reset email request

## Role-Based Access

### User Roles
Stored in `user_roles` table:
```sql
app_role ENUM: 'admin' | 'moderator' | 'user'
```

### Check Admin Status
```typescript
// src/hooks/useAdminStatus.ts
const { isAdmin, loading } = useAdminStatus();
```

### Database Functions
```sql
-- Check if current user is admin
SELECT is_admin(); -- returns boolean

-- Check if user has specific role
SELECT has_role(user_id, 'admin'); -- returns boolean

-- Get user's role
SELECT get_user_role(user_id); -- returns app_role
```

## Protected Routes Pattern

```typescript
// In a page component
const { user, loading } = useAuth();

if (loading) {
  return <LoadingFallback />;
}

if (!user) {
  return <Navigate to="/login" replace />;
}

return <ProtectedContent />;
```

## Admin Route Protection

```typescript
// src/pages/Admin.tsx
const { isAdmin, loading } = useAdminStatus();

if (loading) return <LoadingFallback />;
if (!isAdmin) return <Navigate to="/" replace />;

return <AdminDashboard />;
```

## Session Management

### Session Persistence
Supabase handles session persistence automatically using localStorage.

### Session Refresh
Sessions are automatically refreshed by Supabase client.

### Auth State Listener
```typescript
// In AuthProvider
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

## Organization-Based Auth (ATS)

### Organization Membership
```sql
-- Check if user is org member
SELECT is_org_member(org_id); -- returns boolean

-- Check org role
SELECT has_org_role(org_id, 'admin'); -- returns boolean
```

### ATS Auth Flow
1. User signs up for ATS
2. Creates or joins an organization
3. Organization membership stored in `organization_members`
4. Role determines access level (owner, admin, recruiter, hiring_manager)

## Security Best Practices

1. **Never expose admin functions client-side** - Use RLS policies
2. **Validate sessions server-side** - Edge functions verify auth
3. **Use RLS for all data access** - Database-level security
4. **Implement proper logout** - Clear session and redirect
