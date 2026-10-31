# Brightloop repository instructions

- Read README.md and docs/TASKS.md before implementing changes.
- Inspect the existing files, routes, layouts and schema before editing.
- Reuse shared components and the current Brightloop design system.
- Do not recreate the app or overwrite teammate work.
- Work only on the assigned feature branch.
- Keep feature code in its assigned directory.
- Do not change shared routing, shared layouts, or database migrations without coordination.
- Use Supabase Auth and PostgreSQL for auth, authorization and data access.
- Enforce authorization and validation on the trusted backend/database layer.
- Never expose service-role secrets in browser code.
- Use versioned SQL migrations for any schema updates.
- Avoid mock data for completed production functionality.
- Run npm run build before committing.
- Report changed files, checks run, missing config and unresolved dependencies.
- Do not invent API endpoints or columns that have not been agreed on.
- Do not claim deployment or live Supabase success without verification.
