# 📄 FlowCreate - Professional Resume Builder & ATS Platform

A modern, full-stack resume builder application with an integrated Applicant Tracking System (ATS), rebuilt for high performance, maintainability, and exceptional UX.

## 🌟 Key Features

### Resume Builder
- **Premium Templates**: 7 ATS-optimized templates supporting multiple layouts.
- **Customization Engine**: Advanced theming, font pairing, density controls, and live color palettes.
- **Real-time Preview**: A4-paged live preview with interactive zoom controls.
- **Robust PDF Export**: High-fidelity export using `html2canvas` + `jspdf`.

### Subscriptions & Features
- **Entitlements System**: Granular access control based on active subscription tiers.
- **Metered AI**: AI enhancements driven by Gemini, metered securely at the edge.
- **Premium Gating**: Certain templates and features seamlessly upsell to a Razorpay-powered checkout.

### Applicant Tracking System (ATS)
- Organization & member management
- Job posting and candidate pipeline Kanban
- Automated notifications on application submission

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Vite)                       │
│                                                             │
│  ┌────────────────┐    ┌─────────────────┐    ┌──────────┐  │
│  │   UI & Pages   │    │  Template Engine│    │ Adapters │  │
│  │ (shadcn, React)│    │ (registry.ts)   │    │ (utils)  │  │
│  └───────┬────────┘    └────────┬────────┘    └────┬─────┘  │
│          │                      │                  │        │
│  ┌───────▼──────────────────────▼──────────────────▼─────┐  │
│  │                 React Query / Hooks                   │  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │ Supabase JS Client
┌─────────────────────────────▼───────────────────────────────┐
│                    Supabase Backend                         │
│                                                             │
│  ┌─────────────────┐ ┌────────────────┐ ┌────────────────┐  │
│  │   Edge Functions│ │ Postgres (RLS) │ │ Auth / Storage │  │
│  └─────────────────┘ └────────────────┘ └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm (v9+)

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   npm install
   ```

2. **Environment Variables (`.env`):**
   Create a `.env` file in the root based on `.env.example`.
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   # If running Edge Functions locally:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   GEMINI_API_KEY=your_gemini_key
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

- `npm run dev` — Starts the Vite development server.
- `npm run build` — Builds the production assets.
- `npm run preview` — Previews the production build locally.
- `npm run lint` — Runs ESLint across the codebase.
- `npm run test` — Runs the Vitest unit test suite (templates, math logic, adapters).

## 📖 Overhaul Documentation

The codebase has undergone a major 9-phase overhaul for stability, feature-completeness, and monetization:
- **[OVERHAUL_PLAN.md](./OVERHAUL_PLAN.md)** - The master phase-by-phase implementation plan.
- **[PROGRESS.md](./PROGRESS.md)** - The chronological execution log of the overhaul.
- **[GEMINI_MASTER_PROMPT.md](./GEMINI_MASTER_PROMPT.md)** - The architectural guidelines and agent instructions used during the overhaul.
