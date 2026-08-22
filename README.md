# Sharda Minority Convent — School ERP

Production-oriented school management application with managed email/phone password authentication, role-based permissions, PostgreSQL storage and validated CSV imports.

## Included modules

- Admin, Teacher, Student and Parent roles
- Student admission and guardian records
- Attendance and class timetable
- Fee collection and receipt trail
- Exams, marks and report-card data
- Homework and school notices
- Staff and salary records
- Admin-controlled user provisioning
- Students/staff CSV import with validation preview
- Forced password change after first login
- PostgreSQL Row Level Security (RLS)

## Technology

- Next.js App Router + TypeScript
- Supabase Auth and PostgreSQL
- Cookie-based server-side sessions
- RLS authorization on every application table
- Vercel-ready production build

Supabase supports `signInWithPassword` using either email/password or phone/password. The app follows Supabase's current SSR pattern with separate browser/server clients and cookie refresh.

## Quick start

1. Create a Supabase project.
2. Run `supabase/migrations/0001_production_schema.sql` in its SQL Editor.
3. Copy `.env.example` to `.env.local` and add your project values.
4. Install and run:

```bash
npm install
npm run dev
```

5. Follow `DEPLOYMENT.md` to create the first admin and publish.

## Required environment values

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in browser code, commit it, or paste it into documentation.

## Data import

Use the templates in `public/templates/`. The dashboard validates headers and rows before inserting records. Duplicate admission or employee IDs are rejected by the database.

## Security model

- Authentication passwords remain inside Supabase Auth.
- The dashboard validates server sessions before rendering.
- New users are created only by an active Admin.
- Every temporary password must be changed before dashboard access.
- Database RLS decides which student records each role can read or change.
- The service-role key is used only by the server-side user-provisioning endpoint.

Before processing real student information, add the school's privacy notice, retention policy, consent process and legally required safeguards for minors in the jurisdiction where the school operates.
