
-- Fix WARN 1: tighten downloads INSERT
DROP POLICY IF EXISTS "downloads_insert_all" ON public.downloads;
CREATE POLICY "downloads_insert_own_or_anon" ON public.downloads FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Fix WARN 2-5: lock down SECURITY DEFINER function execution to service_role only
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
