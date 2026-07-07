-- =========================================================
-- AL Tech Exam Hub seed data + student exam read policy
-- =========================================================

-- Keep only the 4 official A/L Technology main subjects.
DELETE FROM public.subjects WHERE slug IN ('automobile-technology', 'automobile');

INSERT INTO public.subjects (slug, name, description, icon, sort_order)
VALUES
  ('engineering-technology', 'Engineering Technology', 'ඉංජිනේරු තාක්ෂණවේදය සඳහා past papers, model papers, online exams සහ tools.', 'settings', 1),
  ('science-for-technology', 'Science for Technology', 'තාක්ෂණය සඳහා විද්‍යාව විෂය සඳහා papers, quizzes සහ formulas.', 'atom', 2),
  ('bio-systems-technology', 'Bio Systems Technology', 'ජෛව පද්ධති තාක්ෂණවේදය සඳහා papers සහ practice exams.', 'leaf', 3),
  ('ict', 'ICT', 'තොරතුරු හා සන්නිවේදන තාක්ෂණය සඳහා papers, online exams සහ tools.', 'monitor', 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Let authenticated students load exam questions through the app.
-- The app only displays questions before submit; correct answers are shown only after result review.
DROP POLICY IF EXISTS "questions_select_authenticated" ON public.questions;
CREATE POLICY "questions_select_authenticated" ON public.questions
  FOR SELECT TO authenticated USING (true);

-- Demo papers. PDF URLs are placeholders; admin can replace with real uploads.
WITH ict_subject AS (SELECT id FROM public.subjects WHERE slug = 'ict')
INSERT INTO public.papers (title, subject_id, medium, year, paper_type, difficulty, description, pdf_url, has_online_exam, duration_minutes, is_published)
SELECT
  '2023 A/L ICT Past Paper',
  ict_subject.id,
  'sinhala',
  2023,
  'past',
  'Medium',
  'Demo ICT past paper with online MCQ practice.',
  NULL,
  true,
  90,
  true
FROM ict_subject
WHERE NOT EXISTS (SELECT 1 FROM public.papers WHERE title = '2023 A/L ICT Past Paper');

WITH et_subject AS (SELECT id FROM public.subjects WHERE slug = 'engineering-technology')
INSERT INTO public.papers (title, subject_id, medium, year, paper_type, difficulty, description, pdf_url, has_online_exam, duration_minutes, is_published)
SELECT
  '2023 A/L Engineering Technology Past Paper',
  et_subject.id,
  'sinhala',
  2023,
  'past',
  'Medium',
  'Demo Engineering Technology past paper.',
  NULL,
  false,
  90,
  true
FROM et_subject
WHERE NOT EXISTS (SELECT 1 FROM public.papers WHERE title = '2023 A/L Engineering Technology Past Paper');

WITH ict_subject AS (SELECT id FROM public.subjects WHERE slug = 'ict')
INSERT INTO public.papers (title, subject_id, medium, year, paper_type, difficulty, description, pdf_url, has_online_exam, duration_minutes, is_published)
SELECT
  'ICT Model Paper 01',
  ict_subject.id,
  'sinhala',
  2026,
  'model',
  'Easy',
  'Demo ICT model paper with online practice.',
  NULL,
  true,
  60,
  true
FROM ict_subject
WHERE NOT EXISTS (SELECT 1 FROM public.papers WHERE title = 'ICT Model Paper 01');

-- 10 demo MCQs for the ICT paper. Admin can add up to 50 questions.
WITH p AS (SELECT id FROM public.papers WHERE title = '2023 A/L ICT Past Paper' LIMIT 1)
INSERT INTO public.questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, marks, explanation)
SELECT p.id, qn, question, a, b, c, d, correct, 1, explanation
FROM p, (VALUES
  (1, 'CPU යන්නෙන් අදහස් කරන්නේ කුමක්ද?', 'Central Processing Unit', 'Computer Power Unit', 'Control Program Unit', 'Central Program Utility', 'A', 'CPU යනු පරිගණකයේ ප්‍රධාන processing unit එකයි.'),
  (2, 'RAM මතකයේ ලක්ෂණයක් වන්නේ?', 'Permanent memory', 'Volatile memory', 'Optical memory', 'Read only memory', 'B', 'RAM volatile memory එකක් නිසා power off වුණාම data නැතිවෙයි.'),
  (3, 'URL එකක ප්‍රධාන භාවිතය කුමක්ද?', 'Website address identify කිරීම', 'File compress කිරීම', 'Virus scan කිරීම', 'Printer connect කිරීම', 'A', 'URL එක website/resource address එක identify කරයි.'),
  (4, 'Database table එකක row එකක් සාමාන්‍යයෙන් gọi කරන්නේ?', 'Field', 'Record', 'Column', 'Query', 'B', 'Table row එක record එකක් ලෙස හඳුන්වයි.'),
  (5, 'HTML භාවිත කරන්නේ?', 'Web page structure සෑදීමට', 'Database encrypt කිරීමට', 'Network cable test කිරීමට', 'Image resize කිරීමට', 'A', 'HTML web page structure define කරයි.'),
  (6, 'IP address එක භාවිතා වන්නේ?', 'Network device identify කිරීමට', 'Sound edit කිරීමට', 'Power supply control කිරීමට', 'Keyboard layout set කිරීමට', 'A', 'IP address එක network තුළ device එක හඳුනාගැනීමට භාවිත වේ.'),
  (7, 'Algorithm එකක් කියන්නේ?', 'Problem solve කිරීමට step-by-step method එකක්', 'Computer virus එකක්', 'Hardware device එකක්', 'Image format එකක්', 'A', 'Algorithm එකක් problem solving steps පැහැදිලි කරයි.'),
  (8, 'Spreadsheet software එකකට උදාහරණයක් වන්නේ?', 'MS Excel', 'MS Paint', 'VLC Player', 'Notepad only', 'A', 'MS Excel spreadsheet application එකකි.'),
  (9, 'Primary key එකක ප්‍රධාන ලක්ෂණය?', 'Duplicate values allow කරයි', 'Unique value එකක් වේ', 'Always empty වේ', 'Only images store කරයි', 'B', 'Primary key එක row එක uniquely identify කරයි.'),
  (10, 'Cloud storage එකේ භාවිතයක් වන්නේ?', 'Internet හරහා files store/access කිරීම', 'Monitor brightness වැඩි කිරීම', 'Keyboard repair කිරීම', 'CPU fan speed බල කිරීම', 'A', 'Cloud storage internet හරහා files store කර access කිරීමට ඉඩ දෙයි.')
) AS x(qn, question, a, b, c, d, correct, explanation)
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE paper_id = p.id AND question_number = qn);

-- Demo formulas.
INSERT INTO public.formulas (subject, topic, formula_name, formula, explanation, example, related_calculator)
SELECT * FROM (VALUES
  ('Engineering Technology', 'Mechanics', 'Torque', 'T = F × d', 'බලය සහ ලම්බ දුර ගුණ කිරීමෙන් torque ලැබේ.', 'F = 20 N, d = 0.5 m නම් T = 10 Nm', '/tools/calculators'),
  ('Engineering Technology', 'Hydraulics', 'Pressure', 'P = F / A', 'ඒකක ප්‍රදේශයකට ක්‍රියා කරන බලය pressure වේ.', 'F = 100 N, A = 0.02 m² නම් P = 5000 Pa', '/tools/calculators'),
  ('Science for Technology', 'Power', 'Power', 'P = W / t', 'කාල ඒකකයක කරන වැඩ ප්‍රමාණය power වේ.', 'W = 100 J, t = 5 s නම් P = 20 W', '/tools/calculators'),
  ('ICT', 'Digital Logic', 'Ohm’s Law', 'V = I × R', 'Voltage, current, resistance අතර සම්බන්ධතාවය.', 'I = 2 A, R = 5 Ω නම් V = 10 V', '/tools/calculators')
) AS v(subject, topic, formula_name, formula, explanation, example, related_calculator)
WHERE NOT EXISTS (SELECT 1 FROM public.formulas WHERE formula_name = v.formula_name AND subject = v.subject);

-- Demo tools.
INSERT INTO public.tools (title, category, subject, description, tool_type, route, is_published)
SELECT * FROM (VALUES
  ('Ohm’s Law Calculator', 'Calculators', 'ICT / SFT', 'Voltage, current, resistance calculate කරන්න.', 'calculator', '/tools/calculators', true),
  ('Torque Calculator', 'Calculators', 'Engineering Technology', 'Torque = Force × Distance.', 'calculator', '/tools/calculators', true),
  ('Unit Converter', 'Unit Converters', 'All', 'Length, mass, pressure, power conversions.', 'converter', '/tools/converters', true),
  ('Formula Book', 'Formula Tools', 'All', 'A/L Tech formulas with Sinhala explanations.', 'formula', '/tools/formulas', true),
  ('Topic MCQ Quiz', 'MCQ Quiz Tools', 'All', 'Topic-wise practice MCQ quiz.', 'quiz', '/tools/mcq-quiz', true)
) AS v(title, category, subject, description, tool_type, route, is_published)
WHERE NOT EXISTS (SELECT 1 FROM public.tools WHERE title = v.title);

-- Optional PDF storage bucket for admin uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('papers', 'papers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "papers_storage_public_read" ON storage.objects;
CREATE POLICY "papers_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'papers');

DROP POLICY IF EXISTS "papers_storage_admin_write" ON storage.objects;
CREATE POLICY "papers_storage_admin_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'papers' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'papers' AND public.has_role(auth.uid(), 'admin'));
