-- =========================================================
-- Fix demo paper cards so Online ලියන්න buttons work
-- =========================================================

-- Make every included demo paper support online practice.
UPDATE public.papers
SET has_online_exam = true,
    is_published = true,
    duration_minutes = COALESCE(duration_minutes, 60)
WHERE title IN (
  '2023 A/L Engineering Technology Past Paper',
  '2023 A/L ICT Past Paper',
  'ICT Model Paper 01'
);

-- Demo MCQs for Engineering Technology paper.
WITH p AS (SELECT id FROM public.papers WHERE title = '2023 A/L Engineering Technology Past Paper' LIMIT 1)
INSERT INTO public.questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, marks, explanation)
SELECT p.id, qn, question, a, b, c, d, correct, 1, explanation
FROM p, (VALUES
  (1, 'Torque formula එක කුමක්ද?', 'T = F × d', 'P = F / A', 'V = IR', 'ρ = m / V', 'A', 'Torque = Force × perpendicular distance.'),
  (2, 'Pressure එකේ SI unit එක කුමක්ද?', 'Watt', 'Pascal', 'Newton metre', 'Ohm', 'B', 'Pressure unit එක Pascal (Pa) වේ.'),
  (3, 'Ohm’s law formula එක?', 'V = IR', 'P = W/t', 'T = Fd', 'η = Output/Input × 100', 'A', 'Voltage = Current × Resistance.'),
  (4, 'Hydraulic system එකේ medium ලෙස වැඩිපුර භාවිත වන්නේ?', 'Air', 'Liquid', 'Light', 'Steam only', 'B', 'Hydraulic systems incompressible liquid භාවිත කරයි.'),
  (5, 'Gear ratio = ?', 'Driver / Driven', 'Driven / Driver', 'Voltage / Current', 'Force / Area', 'B', 'Gear ratio = Driven teeth / Driver teeth.'),
  (6, 'Efficiency unit එක සාමාන්‍යයෙන් දක්වන්නේ?', 'Pa', 'Nm', '%', 'kg', 'C', 'Efficiency ප්‍රතිශතයක් ලෙස දක්වයි.'),
  (7, 'Vernier caliper භාවිත කරන්නේ?', 'Voltage මැනීමට', 'Small lengths මැනීමට', 'Pressure මැනීමට', 'Temperature මැනීමට', 'B', 'Vernier caliper length/diameter/depth මැනීමට භාවිත වේ.'),
  (8, 'Welding වල PPE එකක් වන්නේ?', 'Safety goggles', 'Keyboard', 'Mouse', 'Speaker', 'A', 'Eye protection welding safety සඳහා අත්‍යවශ්‍යයි.'),
  (9, 'Pneumatic system එකේ working medium එක?', 'Compressed air', 'Brake oil', 'Petrol', 'Coolant', 'A', 'Pneumatic systems compressed air භාවිත කරයි.'),
  (10, 'Stress formula එක?', 'σ = F/A', 'V = IR', 'T = Fd', 'P = VI', 'A', 'Stress = Force / Area.')
) AS x(qn, question, a, b, c, d, correct, explanation)
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE paper_id = p.id AND question_number = qn);

-- Demo MCQs for ICT Model Paper 01.
WITH p AS (SELECT id FROM public.papers WHERE title = 'ICT Model Paper 01' LIMIT 1)
INSERT INTO public.questions (paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, marks, explanation)
SELECT p.id, qn, question, a, b, c, d, correct, 1, explanation
FROM p, (VALUES
  (1, 'Algorithm එකක් කියන්නේ?', 'Step-by-step problem solving method', 'Virus type', 'Hardware port', 'Image file', 'A', 'Algorithm එකක් problem එක විසඳන steps පෙළකි.'),
  (2, 'HTML භාවිත කරන්නේ?', 'Web page structure සඳහා', 'Image editing සඳහා', 'Sound recording සඳහා', 'Virus scanning සඳහා', 'A', 'HTML web page structure define කරයි.'),
  (3, 'Primary key එකේ ලක්ෂණය?', 'Duplicate values allow කරයි', 'Unique row identify කරයි', 'Always null වේ', 'Password encrypt කරයි', 'B', 'Primary key එක record එක uniquely identify කරයි.'),
  (4, 'RAM memory එක?', 'Volatile', 'Non-volatile only', 'Optical disk', 'Printer memory only', 'A', 'Power off වුණාම RAM data නැතිවෙයි.'),
  (5, 'URL භාවිතය?', 'Web resource address identify කිරීම', 'CPU cool කිරීම', 'File print කිරීම', 'Keyboard clean කිරීම', 'A', 'URL එක web address එකයි.'),
  (6, 'Binary number system base එක?', '2', '8', '10', '16', 'A', 'Binary system එක 0 සහ 1 භාවිත කරයි.'),
  (7, 'Spreadsheet software උදාහරණයක්?', 'MS Excel', 'MS Paint', 'VLC', 'Notepad', 'A', 'MS Excel spreadsheet application එකකි.'),
  (8, 'Database table row එකක්?', 'Record', 'Field', 'Column name only', 'Formula', 'A', 'Row එක record එකක් වේ.'),
  (9, 'LAN හි full form එක?', 'Local Area Network', 'Large Area Number', 'Logic Access Node', 'Linked Array Net', 'A', 'LAN = Local Area Network.'),
  (10, 'Cloud storage එකේ ප්‍රයෝජනය?', 'Internet හරහා files store/access කිරීම', 'Monitor repair කිරීම', 'CPU speed increase කිරීම', 'Mouse clean කිරීම', 'A', 'Cloud storage internet-based file storage සේවාවකි.')
) AS x(qn, question, a, b, c, d, correct, explanation)
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE paper_id = p.id AND question_number = qn);
