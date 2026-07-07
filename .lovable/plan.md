# AL Tech Exam Hub — Build Plan

This is a large full-stack app. I'll build it in phased milestones so you get a working, testable app at each stage rather than one huge unreviewable drop. Confirm and I'll start with Phase 1 immediately in this same session; Phases 2–4 will follow in subsequent turns.

## Stack
- TanStack Start + React 19 + Tailwind v4 (already scaffolded)
- Lovable Cloud (Supabase) for DB, auth, storage (PDF uploads), RLS
- Sinhala UI (Noto Sans Sinhala), 4 subjects only, mobile-first
- Design: dark navy header, white content, teal PDF btn, gold Online Exam btn, blue subject cards, rounded, soft shadows

## Phase 1 — Foundation, Public Site, Exam Engine (this turn)
1. Enable Lovable Cloud
2. Database schema + RLS + seed:
   - `profiles` (linked to auth.users: full_name, district, school, stream, subject_combination, phone)
   - `user_roles` + `app_role` enum + `has_role()` SECURITY DEFINER
   - `subjects` (4 rows seeded)
   - `papers` (title, subject_id, medium, year, paper_type, pdf_url, has_online_exam, is_published)
   - `questions` (paper_id, q_number, text, image, A/B/C/D, correct, marks, explanation)
   - `exam_results` (user_id, paper_id, score, %, correct/wrong, time_taken, answers jsonb)
   - `downloads`, `quiz_questions`, `formulas`, `tools`, `ad_settings`
   - Storage bucket `papers-pdf` (public read, admin write)
   - Seed: 4 subjects, 1 ET past paper, 1 ICT past paper (+ 10 MCQs), 1 model paper, 5 formulas, 5 tools, sample leaderboard rows
3. Design system in `src/styles.css` (navy/white/teal/gold tokens, Sinhala font, card/shadow tokens)
4. Layout: Header (Sinhala nav), Footer, AdSlot component
5. Routes:
   - `/` Home (hero, 4 subject cards, latest papers, top-10 leaderboard preview, ad slots)
   - `/subjects`, `/subjects/$slug` (dashboard: 4 action cards)
   - `/subjects/$slug/past-papers`, `/model-papers`, `/exams` (paper cards with **PDF Download** + **Online ලියන්න** buttons, filters)
   - `/exam/$paperId` (instructions), `/exam/$paperId/start` (50 MCQ, timer, confirm-submit)
   - `/exam-result/$resultId` (marks, %, rank, answer review with green/red, retry)
   - `/leaderboard` (filters: subject/paper/district/medium/year; best attempt per user)
   - `/auth` (login/register with all required fields)

## Phase 2 — Student area + Admin panel (next turn)
- `/dashboard` student dashboard (attempts, best/avg marks, recent, downloads, recommended)
- `_authenticated/admin/*` routes gated by `has_role('admin')`
- Admin: overview, papers CRUD, PDF upload to storage, question builder (add 50), students, results, leaderboard mgmt, ad settings

## Phase 3 — Tools (next turn)
- `/tools` hub + subpages
- Calculators (Engineering, Electrical, Hydraulic/Pneumatic, Automobile) — ~20 tools
- Formula book with search + related calculator link
- Unit converters (length, mass, time, pressure, power, energy, temperature, speed)
- Diagram tools + diagram quiz mode
- Topic MCQ Quiz Tool (10-question quizzes)

## Phase 4 — Polish
- SEO head() per route, sitemap.xml, robots.txt
- Mobile QA pass, ad placement audit (no ads inside exam)
- Sample data top-up, empty-state messages ("PDF තවම upload කර නැත", "ප්‍රශ්න තවම add කර නැත")

## Technical notes
- Auth: email/password + Google (Lovable-managed). Roles in `user_roles`, never on profile.
- PDF: Supabase Storage bucket, admin-only upload via server function using `supabaseAdmin` inside handler.
- Exam grading: server function validates answers server-side (client never sees correct answers until after submit) and writes `exam_results`.
- Leaderboard: SQL view or query ordering by score DESC, time_taken ASC; best attempt per (user, paper) via `DISTINCT ON`.
- Public reads (papers list, leaderboard) use narrow `TO anon` SELECT policies + server publishable client.
- All protected server fns use `requireSupabaseAuth`; admin fns additionally check `has_role`.

## What I need from you
Just approve and I'll start Phase 1 now. Two small defaults I'll assume unless you object:
- Auth methods: **Email/password + Google** (Lovable Cloud defaults)
- Timer default: **90 minutes** for a 50-MCQ paper

Reply "go" (or with changes) and I'll begin.
