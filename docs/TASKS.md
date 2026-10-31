# Brightloop hackathon task breakdown

## Team workflow
- Branches are feature-scoped and should remain isolated.
- Shared foundation and core app shell should be treated as common infrastructure.
- Each feature branch should coordinate with the database owner before changing schema or RLS.
- All branches should keep the project buildable and mergeable.

## Member 1 — part1-access
Scope
- Authentication and session handling with Supabase Auth
- Roles: admin, staff, customer
- Protected frontend routes
- Customer signup with validation and unique email checks
- Forgotten password reset flow
- Customer subscriptions and invoices pages scoped to the signed-in customer
- Admin-only staff account creation through a trusted backend endpoint

Primary folders
- src/features/access
- src/features/customer
- src/features/admin
- src/context
- src/components/ProtectedRoute.jsx
- src/lib/supabase.js

Dependencies
- Supabase Auth
- shared UI layout and navigation
- profiles table and RLS in the database

Acceptance criteria
- Login, signup, logout and reset flows work in the frontend
- Unauthorized access is blocked
- Customer data queries are restricted to the logged-in customer
- Admin-only staff creation does not expose service-role secrets
- Build passes locally

Integration responsibilities
- Coordinate schema and RLS with the database owner
- Keep routes aligned with the shared router and layout structure
- Avoid changing billing or finance modules

## Member 2 — part2-setup
Scope
- Product catalog and variants
- Plans and pricing setup
- Taxes and discount configuration
- Schema coordination for catalog entities
- Validation and admin-only setup permissions

Primary folders
- src/features/setup
- src/lib
- supabase/migrations

Dependencies
- profiles and auth model from part1-access
- shared admin layout and routing
- eventual billing integration

Acceptance criteria
- Setup screens operate from the shared admin shell
- Product and pricing data is validated and stored using agreed schema
- Tax and discount logic is coordinated with billing and invoicing work
- RLS and ownership are consistent with the shared database model

Integration responsibilities
- Coordinate with billing for tax and discount application rules
- Keep admin setup screens separated from runtime billing logic

## Member 3 — part3-billing
Scope
- Subscription lifecycle management
- Quotation templates and pricing calculations
- Recurring billing logic
- Tax and discount application to subscriptions and invoices
- Duplicate prevention rules

Primary folders
- src/features/billing
- src/lib
- supabase/migrations

Dependencies
- setup data from part2-setup
- customer and admin profile data from part1-access
- payment and invoice integration from part4-money

Acceptance criteria
- Billing actions are consistent with validated plans and discounts
- No duplicate subscription creation or billing events
- Tax/discount calculations match the agreed schema
- Customer-facing and admin-facing states are clear and consistent

Integration responsibilities
- Align with finance for invoice and payment processing
- Coordinate any schema changes that affect subscriptions and invoices

## Member 4 — part4-money
Scope
- Invoice management and payment status
- Financial dashboard and charts
- Overdue list and review views
- Pagination and large-data handling
- Seeded data for 2000+ records

Primary folders
- src/features/finance
- src/features/billing
- src/lib
- supabase/migrations

Dependencies
- billing lifecycle data
- customer and admin auth model
- shared dashboard and chart components

Acceptance criteria
- Finance dashboard is readable and performant at scale
- Invoices and payments list only correctly authorized records
- Overdue and collection states are clear and filterable
- Large record sets are paginated and stable

Integration responsibilities
- Coordinate invoice data contracts with billing
- Keep front-end display logic separate from auth and setup concerns
- Ensure real database performance and query limits are considered

## Open schema decisions to resolve
- Final naming and ownership of plan, product and tax tables
- Whether tax rules are stored as a reusable catalog vs. inline invoice calculation data
- Final invoice/payment status enum values across roles and files
- Seed data strategy for large finance datasets
- Whether staff accounts are created by the app, a backend service, or a secure admin script
