# FixNear — Development Tasks & Implementation Tracking

## Project Overview
**FixNear** is an AI-powered home services marketplace connecting customers with verified independent service professionals across India (electricians, plumbers, carpenters, AC technicians, cleaning, etc.) with real booking lifecycles, transparent pricing, Razorpay test payments, provider verification, and administrative controls.

---

## Phase Breakdown & Status Summary

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Workspace Inspection, Architecture, & TASKS.md | ✅ Completed |
| **Phase 2** | Responsive Frontend & Shared Design System | ✅ Completed |
| **Phase 3** | Supabase, Auth, Database Migrations, & RLS Policies | ✅ Completed |
| **Phase 4** | Customer & Provider Profiles, Onboarding, Verification | ✅ Completed |
| **Phase 5** | Service Discovery, Search, & Booking Engine | ✅ Completed |
| **Phase 6** | Provider Dashboard, Job Workflow, & Admin Approvals | ✅ Completed |
| **Phase 7** | Razorpay Payment Integration (Test Mode & Demo Mode) | ✅ Completed |
| **Phase 8** | Cloud Storage, Maps, & In-App / Email Notifications | ✅ Completed |
| **Phase 9** | AI Booking Assistant, Smart Search, & Job Summarization | ✅ Completed |
| **Phase 10** | Testing, Security Hardening, & CI Pipeline | ✅ Completed |
| **Phase 11** | Cloud Deployment Preparation (Docker, Vercel, Render) | ✅ Completed |
| **Phase 12** | Documentation & User Journey Verification | ✅ Completed |
| **Phase 13** | Authentication, Password Hashing & Strict RBAC | ✅ Completed |

---

## Detailed Task Checklist

### Phase 1: Workspace Inspection & Architecture Finalization
- [x] Inspect workspace and development tools (Node v24.18.1, npm 11.16.0, Git 2.55.0)
- [x] Initialize Git repository
- [x] Create project layout and root configuration (`package.json`, `.gitignore`, `.env.example`, `TASKS.md`)
- [x] Define comprehensive architectural specification (`docs/ARCHITECTURE.md`)

### Phase 2: Responsive Frontend & Shared Design System
- [x] Initialize Vite + React + TypeScript in `client/`
- [x] Configure Tailwind CSS with customized FixNear theme (clean warm-neutral, forest/emerald green `#059669` / `#047857`, accessible typography)
- [x] Install and configure Lucide icons, React Router, TanStack Query, React Hook Form, Zod
- [x] Create core design components (`Button`, `Card`, `Badge`, `Modal`, `StatusStepper`, `CategoryIcon`)
- [x] Build public pages:
  - [x] Home landing page (Hero, Categories, Value Proposition, Top Rated Pros, How it Works, CTA)
  - [x] All Services catalog & Category filter page (`/services`)
  - [x] Service Detail page with pricing breakdown & booking preview (`/services/:slug`)
  - [x] Search Results page (`/search?q=...`)
  - [x] Provider Public Profile page (`/providers/:id`)
  - [x] How It Works page (`/how-it-works`)
  - [x] Become a Professional landing page (`/become-a-pro`)
  - [x] Help & Support (FAQ + AI Support Assistant) (`/help`)
  - [x] Privacy Policy & Terms of Service pages (`/privacy`, `/terms`)
- [x] Responsive header with search, location picker, role badges, notifications, and navigation
- [x] Accessible footer with trust assurances and Indian market sitemap

### Phase 3: Supabase, Auth, Database Migrations, & RLS Policies
- [x] Create complete PostgreSQL migration files in `supabase/migrations/`:
  - [x] `001_initial_schema.sql` with all 20 required tables
  - [x] `002_rls_policies.sql` with comprehensive Row Level Security policies
  - [x] `003_indexes_and_triggers.sql` for anti-double-booking partial indexes and updated_at triggers
  - [x] `004_seed_data.sql` with Bengaluru home services, categories, mock providers, and addresses
- [x] Configure Supabase client (frontend and backend) with robust fallback/in-memory adapter for smooth development and testing without blocking on remote credentials
- [x] Setup Express backend in `server/` with TypeScript, helmet, cors, morgan, zod, rate limiting, and centralized error handling

### Phase 4: Customer & Provider Profiles
- [x] Customer profile management (name, phone, avatar)
- [x] Customer address book (Bengaluru locations: Bellandur, Indiranagar, Koramangala)
- [x] Provider onboarding flow (`/become-a-pro` -> `/api/v1/providers/onboarding`)
- [x] Provider verification status tracker (Pending, Verified, Rejected)
- [x] Provider availability scheduling & service radius

### Phase 5: Service Discovery & Booking Engine
- [x] Full-text search and category-based filtering
- [x] Booking Engine server-side workflow:
  - [x] Service selection & problem description
  - [x] Address selection & coverage validation
  - [x] Eligible provider matching & slot availability check
  - [x] Anti-double-booking validation constraint
  - [x] Transparent price calculation (Base + Addons + Taxes + Platform Fee)
  - [x] Booking creation & reference code generation (`FIX-2026-XXXX`)
- [x] Multi-step Booking wizard on client
- [x] Explicit booking status lifecycle:
  - `pending` -> `confirmed` -> `provider_assigned` -> `provider_en_route` -> `in_progress` -> `completed`
  - Cancellation & dispute branches (`cancellation_requested`, `cancelled`, `disputed`)
- [x] Server-side status transition validator and status history logger

### Phase 6: Provider Dashboards & Admin Approval
- [x] Provider Dashboard (`/provider/dashboard`):
  - [x] Incoming booking requests with Accept/Reject actions
  - [x] Active and upcoming jobs with customer details & address
  - [x] Status update buttons (`Mark On The Way`, `Begin Work`, `Complete Job`)
  - [x] Earnings ledger and 15% platform commission breakdown
  - [x] Availability toggle
- [x] Admin Dashboard (`/admin/dashboard`):
  - [x] Marketplace metrics (Total Bookings, Active Providers, Gross Volume, Platform Revenue)
  - [x] Provider verification queue (Inspect documents, Approve, Reject with reason)
  - [x] Audit log timeline

### Phase 7: Razorpay Payment Integration
- [x] Server-side order creation (`/api/v1/payments/create-order`) with server-calculated amounts
- [x] Frontend Razorpay standard checkout integration
- [x] Server-side payment signature verification using HMAC-SHA256
- [x] Razorpay webhook handler (`/api/v1/payments/webhook`) with signature verification and idempotent processing
- [x] Separated Demo/Local Payment Mode for automated testing and offline demos
- [x] Provider earnings ledger calculation (15% platform commission deduction)
- [x] Itemized receipt modal and tax breakdown

### Phase 8: Cloud Storage, Maps, & Notifications
- [x] Storage document link handlers for Aadhaar/PAN verification
- [x] In-app notification system (unread count, drawer, mark-as-read)
- [x] Notification triggers on booking creation, payment success, and status changes

### Phase 9: AI Features
- [x] Server-side AI service layer (`/api/v1/ai/`)
- [x] AI Booking Assistant modal:
  - [x] Natural language problem intake ("My AC is blowing warm air")
  - [x] Service category matching, urgency rating, and structured job description extraction
- [x] Smart Search: Semantic query mapping to catalog services
- [x] Customer Support AI Assistant (explains policies, cancellation rules, booking states)
- [x] Provider Job Summarizer (summarizes customer notes and key issues)
- [x] Graceful deterministic fallbacks when AI key is missing or quota is exhausted

### Phase 10: Testing, Security Hardening, & CI
- [x] Unit & integration tests with Vitest & Supertest (10 integration tests passing)
- [x] Security audits: Input sanitization with Zod, rate limits, CORS, helmet
- [x] TypeScript type checking across client and server (`npm run lint`, `npm run build`)
- [x] GitHub Actions CI workflows for lint, typecheck, and test execution (`.github/workflows/ci.yml`)

### Phase 11: Deployment Preparation
- [x] Dockerfile for server & client
- [x] Client Nginx configuration (`nginx.conf`)
- [x] Docker Compose setup for unified multi-container run (`docker-compose.yml`)

### Phase 12: Documentation & Open Source Readiness
- [x] Comprehensive `README.md` with architecture diagram, local setup, and API guide
- [x] Open-source standard files: `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
- [x] GitHub issue and pull request templates
- [x] Verification of all end-to-end user journeys

### Phase 13: Authentication, Password Hashing & Strict RBAC
- [x] Password hashing using `bcryptjs` with salt rounds = 10
- [x] JWT token generation and verification (`jsonwebtoken`) with 7-day expiration
- [x] Database migration `005_auth_credentials.sql` adding `password_hash` column and hashed seed passwords
- [x] Dedicated Auth Routes in `server/src/routes/auth.ts`:
  - `POST /api/v1/auth/register` (Customer & Worker public registration; Admin role strictly forbidden)
  - `POST /api/v1/auth/login` (Password verification via bcrypt, JWT issuance)
  - `GET /api/v1/auth/me` (Token-based profile retrieval & session re-hydration)
  - `POST /api/v1/auth/admin/create-user` (Admin-only provisioning for new Admin or Worker accounts)
- [x] Server-side authorization middleware (`server/src/middleware/auth.ts`):
  - Strict 401 Unauthorized for missing or invalid tokens (removed silent fallback)
  - Strict 403 Forbidden for mismatched user roles (`requireRole`)
- [x] Client Auth & RBAC State:
  - Token persistence in `localStorage` (`fixnear_token`, `fixnear_user`)
  - Auto-attach `Authorization: Bearer <token>` on all API requests
  - Automatic session restoration on page reload (`/api/v1/auth/me`)
  - Context helpers: `login()`, `register()`, `logout()`, `switchRole()`
- [x] Frontend UI & Route Guards:
  - Accessible, responsive `Login.tsx` and `Register.tsx` pages matching warm-neutral & emerald green theme
  - Form validation with error states and quick demo 1-click login buttons for testing
  - `ProtectedRoute.tsx` wrapper for all dashboard routes:
    - Redirects unauthenticated users to `/login` with `returnUrl`
    - Redirects unauthorized roles to their respective authorized dashboards
  - Navbar updated with conditional Sign In / Register vs. Role Badge / Dashboard link / Sign Out
- [x] Comprehensive API & RBAC Test Suite:
  - 21 integration tests covering public access, registration, login, role restrictions, direct URL/API protection, and admin account provisioning
