-- =========================================================
-- TechMaster Admin Student Details Security
-- Registered user details should be visible only inside admin panel.
-- =========================================================

-- Profiles: students can see/update their own profile, admins can see all profiles.
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR public.has_role(auth.uid(), 'admin')
);

REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT ON public.profiles TO authenticated;

-- User roles: students can see their own role, admins can see all roles for student management.
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_own_or_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_own_or_admin"
ON public.user_roles
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

GRANT SELECT ON public.user_roles TO authenticated;

-- Exam results are already readable for leaderboard/admin analytics.
-- This index helps admin student details load faster.
CREATE INDEX IF NOT EXISTS exam_results_user_paper_score_idx
ON public.exam_results(user_id, paper_id, score DESC, percentage DESC, time_taken ASC);
