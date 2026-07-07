-- =========================================================
-- AL Tech Exam Hub - Auth + Result Review support fix
-- =========================================================
-- Use after the main setup migrations. This keeps sign-up profile/role creation stable.

GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, district, school, stream, subject_combination, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'district',
    NEW.raw_user_meta_data->>'school',
    NEW.raw_user_meta_data->>'stream',
    NEW.raw_user_meta_data->>'subject_combination',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    district = EXCLUDED.district,
    school = EXCLUDED.school,
    stream = EXCLUDED.stream,
    subject_combination = EXCLUDED.subject_combination,
    phone = EXCLUDED.phone,
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Keep this policy so authenticated students can load question text/options through the app.
-- The app's exam page only selects id, question text, options and marks, not correct_answer/explanation.
DROP POLICY IF EXISTS "questions_select_authenticated" ON public.questions;
CREATE POLICY "questions_select_authenticated" ON public.questions
  FOR SELECT TO authenticated USING (true);
