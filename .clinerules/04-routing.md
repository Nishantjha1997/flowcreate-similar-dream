# 🛤️ Routing Structure

## Router Setup
Uses React Router DOM v6 with lazy loading for code splitting.

```typescript
// src/App.tsx
<BrowserRouter>
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      {/* Routes here */}
    </Routes>
  </Suspense>
</BrowserRouter>
```

## Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Index` | Landing page with hero, features, testimonials |
| `/templates` | `Templates` | Browse resume templates |
| `/examples` | `Examples` | Resume examples gallery |
| `/features` | `Features` | Feature showcase |
| `/pricing` | `Pricing` | Pricing plans |
| `/about` | `About` | About page |
| `/login` | `Login` | User login |
| `/register` | `Register` | User registration |
| `/forgot-password` | `ForgotPassword` | Password reset |
| `/terms` | `Terms` | Terms of service |
| `/privacy` | `Privacy` | Privacy policy |
| `/refund-policy` | `RefundPolicy` | Refund policy |
| `/shipping-policy` | `ShippingPolicy` | Shipping policy |

## Protected Routes (Require Auth)

| Path | Component | Description |
|------|-----------|-------------|
| `/resume-builder` | `ResumeBuilder` | Main resume builder |
| `/account` | `Account` | User profile management |
| `/account/settings` | `AccountSettings` | Account settings |
| `/admin` | `Admin` | Admin dashboard (admin role required) |

## ATS Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/ats` | `ATSLanding` | ATS marketing page |
| `/ats/login` | `ATSLogin` | ATS login |
| `/ats/signup` | `ATSSignup` | ATS registration |
| `/ats/onboarding` | `ATSOnboarding` | Organization setup |
| `/ats/dashboard` | `ATSDashboard` | ATS main dashboard |
| `/ats/jobs` | `ATSJobs` | Job listings |
| `/ats/jobs/new` | `ATSJobCreate` | Create new job |
| `/ats/jobs/:jobId` | `ATSJobDetail` | Job details & pipeline |
| `/ats/applications/:applicationId` | `ATSApplicationDetail` | Application details |
| `/ats/settings` | `ATSSettings` | Organization settings |
| `/ats/jobs/browse` | `ATSPublicJobs` | Public job board |
| `/ats/apply/:jobId` | `ATSApply` | Job application form |

## 404 Route
| Path | Component | Description |
|------|-----------|-------------|
| `*` | `NotFound` | 404 error page |

## Route Guards
Authentication is handled via `useAuth` hook. Protected routes should check:
```typescript
const { user, loading } = useAuth();

if (loading) return <LoadingFallback />;
if (!user) return <Navigate to="/login" />;
```

## Navigation Components
- `Header.tsx` - Main navigation header
- `Footer.tsx` - Site footer with links
- `ResumeNavigation.tsx` - Resume builder navigation
- `Breadcrumbs.tsx` - Breadcrumb navigation
