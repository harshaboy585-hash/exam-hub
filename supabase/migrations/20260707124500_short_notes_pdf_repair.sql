-- =========================================================
-- TechMaster Short Notes PDF repair
-- Run this if short note PDFs do not save or display.
-- It safely creates/updates the table, grants permissions, and storage policies.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.short_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.short_notes
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

CREATE INDEX IF NOT EXISTS short_notes_subject_idx ON public.short_notes(subject_id);
CREATE INDEX IF NOT EXISTS short_notes_topic_idx ON public.short_notes(topic);

ALTER TABLE public.short_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "short_notes_select_published" ON public.short_notes;
CREATE POLICY "short_notes_select_published"
ON public.short_notes FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "short_notes_admin_write" ON public.short_notes;
CREATE POLICY "short_notes_admin_write"
ON public.short_notes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.short_notes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.short_notes TO authenticated;
GRANT ALL ON public.short_notes TO service_role;

INSERT INTO storage.buckets (id, name, public)
VALUES ('short-notes', 'short-notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "short_notes_storage_public_read" ON storage.objects;
CREATE POLICY "short_notes_storage_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'short-notes');

DROP POLICY IF EXISTS "short_notes_storage_admin_write" ON storage.objects;
CREATE POLICY "short_notes_storage_admin_write"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'short-notes' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'short-notes' AND public.has_role(auth.uid(), 'admin'));
