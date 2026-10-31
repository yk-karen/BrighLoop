# Brightloop

Brightloop is a subscription management SaaS application built for an 8-hour hackathon. The project provides a shared React + Vite foundation, a premium SaaS UI, role-based access, and a team-oriented branch structure so multiple developers can work in parallel.

## Stack
- React + Vite
- Tailwind CSS v4
- React Router
- Supabase Auth
- PostgreSQL via Supabase
- Recharts
- Lucide React

## Current repository status
This repository currently includes:
- the shared application shell and design system
- a route setup for login, signup, admin screens and customer portal screens
- a Supabase client and auth context
- a profile/auth migration for role-based access
- the part1-access implementation for authentication and customer portal access

### Implemented and in the repo
- shared layouts and routing foundation
- login, signup, logout, and password reset flow
- admin/staff/customer role handling in the frontend
- protected routes with role checks
- customer-only subscription and invoice views
- profile table and RLS migration skeleton for access control

### Verified locally
- Production build passes with npm run build

### Not yet verified live
- real Supabase project connectivity
- live database auth flow
- real RLS enforcement in a deployed Supabase project
- production service-role usage or backend endpoint deployment

> The app should not be described as deployed or production-verified until the real Supabase environment is confirmed.

## Prerequisites
- Node.js 18+ recommended
- npm
- a Supabase project with Auth enabled
- environment variables for the Supabase client
- database owner access to apply SQL migrations to the project

## Installation
```bash
npm install
```

## Useful commands
```bash
npm run dev
npm run build
npm run preview
```

## Environment variables
Create a local environment file based on the project convention:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_STAFF_ENDPOINT=https://your-trusted-backend.example.com/api/admin/staff/create
```

Important notes:
- Frontend code must never include service-role secrets.
- The trusted admin staff creation flow should be handled by a secure backend endpoint.
- If these values are not configured, auth and database-backed access will not work in the browser.

## Directory structure
```text
src/
  components/
  context/
  features/
    access/
    admin/
    billing/
    customer/
    finance/
    setup/
  layouts/
  lib/
  routes/
  App.jsx
  main.jsx
supabase/
  migrations/
public/
.github/
docs/
```

## Branch workflow
The project is intentionally organized as a branch-based hackathon workflow:
- main: stable shared baseline
- part1-access: authentication, customer access, roles and protected routes
- additional feature branches will be created by other members for setup, billing, and finance work

Developers should keep feature-specific work inside their assigned branch and avoid overwriting shared files without coordination.

## Team coordination rules
- Reuse shared layouts and UI components instead of rebuilding them.
- Do not modify shared routing or database migrations without agreement.
- Keep feature logic inside the correct feature folders.
- Use versioned SQL migration files for schema work.
- Verify the app still builds before committing.

## Current implementation scope
The current branch, part1-access, is responsible for:
- auth and signup flows
- role-based access
- protected routes
- admin-only staff creation route pattern
- customer subscriptions and customer invoices
- password reset flow via Supabase Auth

The following are intentionally not part of this task:
- billing logic implementation
- finance module development
- schema work outside the access model and RLS coordination

## Known unresolved items
- Final database schema decisions for product, plan, tax and payment tables are still pending.
- Live Supabase deployment and database verification are not yet complete.
- Trusted backend endpoint details for admin staff creation are not yet confirmed in a deployed environment.

## Documentation and agent guidance
- AI coding agent guidance: [CLAUDE.md](CLAUDE.md)
- Team task breakdown: [docs/TASKS.md](docs/TASKS.md)
- Copilot repository instructions: [.github/copilot-instructions.md](.github/copilot-instructions.md)
