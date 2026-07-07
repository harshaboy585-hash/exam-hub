# TechMaster

A/L Technology students සඳහා Past Papers, Model Papers, Online MCQ Exams, Leaderboard, Admin Panel සහ Tools ඇති web app එක.

## This version includes

- Login/register flow improved for Supabase email/password authentication.
- Google login removed. Email/password registration now uses Supabase email verification.
- Sinhala / English language switch button added in the header.
- Main subject medium options now show only Sinhala Medium and English Medium in the UI. Tamil Medium is hidden from paper filters/admin forms.
- Global Google AdSense placeholder added under the main header on every page, including above the online exam page.
- Online exam result page keeps correct answers hidden until the student submits.
- Answer review shows correct/wrong cards after Submit only.

## Run locally

```bash
npm install
npm run dev
```

## Environment

Put `.env` in the project root, same place as `package.json`:

```env
SUPABASE_URL="your_supabase_project_url"
SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_key"
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_key"
```

Do not put the Supabase service role key in frontend/client env files.

## Supabase setup

Run the SQL setup in Supabase SQL Editor. If you already half-ran the setup, first run the clean reset query that does not directly delete storage tables.

Then register a normal account on the website at `/auth`.

After registering, make that user admin:

```sql
insert into public.user_roles (user_id, role)
values ('YOUR_AUTH_USER_ID', 'admin')
on conflict (user_id, role) do nothing;
```

`YOUR_AUTH_USER_ID` must be the real Supabase Auth user ID from:

Supabase Dashboard → Authentication → Users → copy User ID.

Do not put email or password in this query.

Then open `/admin/login` to log in as admin, or open `/admin` directly if you are already logged in.

## Email verification login setup in Supabase

Google login has been removed. The app now uses email/password sign up with email confirmation.

1. Supabase Dashboard → Authentication → Providers → Email.
2. Enable Email provider.
3. Turn ON `Confirm email` if you want users to verify their email before login.
4. Supabase Dashboard → Authentication → URL Configuration.
5. Set Site URL for local development:
   - `http://localhost:5173`
6. Add Redirect URLs:
   - `http://localhost:5173/auth`
   - `http://localhost:5173/dashboard`
   - your deployed domain equivalents, for example `https://your-domain.com/dashboard`.
7. In Supabase email templates, keep the confirmation link enabled.
8. Test flow: `/auth` → Register → check inbox/spam → click confirmation link → login.

Admin login still uses the same email/password account. After registering and verifying email, copy the Supabase Auth User ID and run the admin query below.

## Admin panel login steps

1. Run project: `npm run dev`.
2. Open `/auth`.
3. Register a user.
4. Go to Supabase → Authentication → Users.
5. Copy the user ID.
6. Run the admin query above.
7. Refresh website.
8. Open `/admin/login` and log in. After admin role is confirmed, it redirects to `/admin`.

## Notes

- Correct answers must not be shown during the exam. They are only displayed after Submit.
- Global ad placeholders are outside the question card, so they do not reveal answers or disturb the exam flow.
- Tamil Medium is intentionally removed from UI selections.

## Profile image / avatar setup

This version supports a circular profile image in the navbar and dashboard. Run the latest Supabase migration or run this SQL if your existing database does not have avatar support:

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "avatars_storage_public_read" ON storage.objects;
CREATE POLICY "avatars_storage_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_storage_own_write" ON storage.objects;
CREATE POLICY "avatars_storage_own_write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_storage_own_update" ON storage.objects;
CREATE POLICY "avatars_storage_own_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## Profile image persistence fix

This version uses a shared `ProfileProvider` so the navbar and dashboard always read the same Supabase profile data.

Profile images are uploaded to Supabase Storage bucket `avatars`, then the public URL is saved in `public.profiles.avatar_url`.

If avatars do not show after refresh, run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "avatars_storage_public_read" ON storage.objects;
CREATE POLICY "avatars_storage_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_storage_own_write" ON storage.objects;
CREATE POLICY "avatars_storage_own_write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_storage_own_update" ON storage.objects;
CREATE POLICY "avatars_storage_own_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_storage_own_delete" ON storage.objects;
CREATE POLICY "avatars_storage_own_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```


## Analytics + leaderboard update

This build adds:

- Student dashboard analytics cards.
- Performance trend chart for each student's exam attempts.
- Subject-wise average chart.
- Paper completion progress showing completed and pending online papers.
- Smart study suggestions based on weak subjects and pending papers.
- Leaderboard modes:
  - Overall total leaderboard: sums each student's best marks across all matching papers.
  - Paper leaderboard: select a paper to rank students for that exact paper.
- Leaderboard filters for subject, medium, paper, and district.

No new Supabase tables are required for this update. It uses existing `exam_results`, `papers`, and `subjects` data.

## Short Notes Image System

If you already created the Supabase database before this update, run this migration in Supabase SQL Editor:

```sql
-- copy contents from supabase/migrations/20260707022000_short_notes_images.sql
```

This creates:
- `public.short_notes` table
- `short-notes` storage bucket
- admin-only upload/edit/delete policies
- public read access for published short notes

Admin path: `/admin` → Short Notes Images section.
Student path: `/subjects/<subject-slug>/short-notes`.

## Auth guard update

This version protects the full student website. Public users can only access `/auth` and `/admin/login`.
If a visitor is not signed in and tries to open Home, Subjects, Papers, Exams, Tools, Leaderboard, Dashboard, or Admin pages, the app redirects to `/auth` and shows the sign in/register screen.

Run:

```bash
npm install
npm run dev
```

## Admin Student Details SQL

If the Admin Panel student details table does not show registered users, run this migration in Supabase SQL Editor:

```sql
-- Run: supabase/migrations/20260707105000_admin_student_details.sql
```

This makes registered users visible only to admins in the Admin Panel while normal students can only view their own profile.
