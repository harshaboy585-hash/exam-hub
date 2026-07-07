-- =========================================================
-- TechMaster Short Notes PDF support
-- Replaces the old image-based UI with a single PDF URL per short note.
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

-- Keep the old image_urls column if it exists, but it is no longer used by the app.
-- The app now stores and reads short note PDFs from public.short_notes.pdf_url.

INSERT INTO storage.buckets (id, name, public)
VALUES ('short-notes', 'short-notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "short_notes_storage_public_read" ON storage.objects;
CREATE POLICY "short_notes_storage_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'short-notes');

DROP POLICY IF EXISTS "short_notes_storage_admin_write" ON storage.objects;
CREATE POLICY "short_notes_storage_admin_write"
ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'short-notes'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'short-notes'
  AND public.has_role(auth.uid(), 'admin')
);


GRANT SELECT ON public.short_notes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.short_notes TO authenticated;
GRANT ALL ON public.short_notes TO service_role;
