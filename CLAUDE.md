# Brightloop AI agent instructions

Before changing code, read:
- README.md
- docs/TASKS.md

Then inspect the relevant existing files and schema before making any edit.

Repository rules
- Reuse the shared layouts, components, routing and styling already in the app.
- Never recreate the application or overwrite another teammate’s work.
- Stay on the assigned feature branch for the task.
- Keep feature logic in its assigned directory and avoid modifying unrelated feature areas.
- Do not change shared routing, layouts or database migrations without coordinating with the team.
- Use Supabase Auth and PostgreSQL for authentication and authorization.
- Enforce authorization and validation on the trusted backend/database layer.
- Never expose service-role secrets in browser code.
- Use versioned SQL migrations for schema changes.
- Avoid mock data for completed production functionality.
- Run npm run build before committing.

Required reporting
- Report the files changed.
- Report the tests or build checks run.
- Call out missing configuration or unresolved dependencies.
- Note unresolved database schema decisions and integration risks.

Conflict guardrails
- Do not invent API endpoints, tables, or columns without team agreement.
- Do not implement across feature branches without coordination.
- Do not claim a Supabase deployment is live unless it has been verified in the real environment.
- Do not bypass the team workflow for branch-based feature work.
