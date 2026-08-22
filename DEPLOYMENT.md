# Production deployment guide

## 1. Create the managed database and authentication project

Create a new Supabase project for Sharda Minority Convent. Use a strong database password and enable multi-factor authentication on the owner account.

In Supabase SQL Editor, run:

```text
supabase/migrations/0001_production_schema.sql
```

The migration creates the complete database, triggers, indexes and RLS policies.

## 2. Configure authentication

In Authentication settings:

- Keep public/self sign-up disabled; school accounts must be issued by an Admin.
- Enable email authentication.
- Configure a supported SMS provider only if phone-number onboarding or phone verification is required.
- Set the production Site URL after deployment.
- Add local development URL `http://localhost:3000/auth/confirm` when testing locally.

Supabase's password sign-in API accepts either an email or an international-format phone number. The app automatically converts an Indian 10-digit number to `+91` format.

## 3. Create the first Super Admin

Create the first user manually in Supabase Authentication → Users. Use the school owner's/admin's email and a strong password.

Then run this SQL once, replacing the email:

```sql
update public.profiles
set role = 'admin', must_change_password = false, status = 'active'
where email = 'ADMIN_EMAIL_HERE';
```

After login, that Admin can create Teacher, Student, Parent and additional Admin accounts from **Users & access**.

## 4. Add deployment environment values

Create a new Vercel project from this code and configure:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

Find the URL and publishable key in the Supabase project Connect dialog. Keep the service-role key only in Vercel's encrypted server environment.

## 5. Deploy and verify

Run locally before publishing:

```bash
npm run lint
npm run build
```

After deployment, verify:

1. Signed-out users are redirected to `/login`.
2. The first Admin can sign in.
3. A newly created Teacher receives a temporary password and must replace it.
4. Teacher cannot open fee, staff, import or user-management sections.
5. Student/Parent database queries return only linked student records.
6. CSV import accepts the included templates and rejects duplicate IDs.
7. Sign out removes the session.

## 6. Import the real Excel/CSV data

Download the template inside **Data import**, copy records from Excel, export as CSV UTF-8 and upload it. Start with a small batch of 5–10 rows, verify the results, and then import the remainder.

Required student headers:

```text
admission_no,full_name,class_name,section,roll_no,guardian_name,guardian_phone,fee_due
```

Required staff headers:

```text
employee_id,full_name,designation,email,phone,salary,joined_at
```

## 7. Production safeguards

- Restrict Admin accounts to trusted adults and enable account-owner MFA.
- Do not collect information that the school does not need.
- Establish parental consent, privacy notice, data retention and deletion procedures.
- Keep routine encrypted backups and test restoration.
- Review RLS policies after adding any new module.
- Never store card numbers, passwords or identity-document scans in this app.
