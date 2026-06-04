-- LifeOS Demo Seed Data
-- Run AFTER supabase-schema.sql
-- Populates a demo student profile + sample tasks, events, and reminders
-- Useful for testing the dashboard without going through the full intake flow

-- ─────────────────────────────────────────
-- Demo profile (replace 'demo-user-id' with a real Clerk user ID)
-- ─────────────────────────────────────────
INSERT INTO profiles (id, name, email, cgpa, branch, skills, year, college)
VALUES (
  'demo-user-id',
  'Riya Sharma',
  'riya.sharma@example.com',
  7.8,
  'CSE',
  ARRAY['Python', 'React', 'SQL', 'Machine Learning'],
  3,
  'Delhi Technological University'
) ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- Demo intake (TCS NQT placement notice)
-- ─────────────────────────────────────────
INSERT INTO intakes (id, user_id, input_type, intent, summary, raw_extracted)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'demo-user-id',
  'text',
  'placement_notice',
  'TCS NQT drive registration closes June 7. You are eligible (CGPA 7.8 ≥ 6.0, CSE branch eligible).',
  '{
    "company": "TCS",
    "deadline": "2026-06-07",
    "eligibility": {
      "min_cgpa": 6.0,
      "branches": ["CSE", "IT", "ECE"],
      "backlogs_allowed": false
    },
    "documents_required": ["Resume", "College ID", "10th Marksheet", "12th Marksheet"]
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- Demo tasks
-- ─────────────────────────────────────────
INSERT INTO tasks (user_id, intake_id, title, description, priority, due_date, status, agent_source)
VALUES
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Register for TCS NQT on official portal',
  'Complete registration at tcs.com/careers. Keep your college ID and marksheets ready.',
  1,
  '2026-06-07',
  'pending',
  'task_agent'
),
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Update resume with latest projects',
  'Add your ML project and React portfolio to resume. Keep it under 1 page.',
  1,
  '2026-06-06',
  'pending',
  'task_agent'
),
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Complete TCS NQT mock test on PrepInsta',
  'Focus on quant, verbal, and programming sections. Target 75%+ to be safe.',
  2,
  '2026-06-09',
  'pending',
  'task_agent'
),
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Gather all required documents',
  'Scan and keep digital copies of: College ID, 10th & 12th marksheets, updated resume.',
  2,
  '2026-06-06',
  'pending',
  'task_agent'
),
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Practice coding problems on LeetCode',
  'Solve 10 easy + 5 medium problems. Focus on arrays, strings, and basic DP.',
  3,
  '2026-06-14',
  'pending',
  'task_agent'
);

-- ─────────────────────────────────────────
-- Demo calendar events
-- ─────────────────────────────────────────
INSERT INTO events (user_id, intake_id, title, start_time, end_time, event_type, description)
VALUES
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'TCS NQT Registration Deadline',
  '2026-06-07T23:59:00',
  '2026-06-07T23:59:00',
  'deadline',
  'Last day to register for TCS NQT drive'
),
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Aptitude Prep — Session 1',
  '2026-06-05T09:00:00',
  '2026-06-05T11:00:00',
  'study_block',
  'Quant: Percentages, Ratios, Time & Work'
),
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Aptitude Prep — Session 2',
  '2026-06-06T19:00:00',
  '2026-06-06T21:00:00',
  'study_block',
  'Verbal: Reading comprehension + Sentence completion'
),
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Registration Reminder',
  '2026-06-06T09:00:00',
  '2026-06-06T09:00:00',
  'reminder',
  'One day left to register for TCS NQT'
),
(
  'demo-user-id',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'TCS NQT Exam Day',
  '2026-06-15T09:00:00',
  '2026-06-15T12:00:00',
  'interview',
  'Exam at Main Auditorium. Carry college ID + printed registration slip.'
);

-- ─────────────────────────────────────────
-- Demo reminders
-- ─────────────────────────────────────────
INSERT INTO reminders (user_id, message, remind_at, sent)
VALUES
(
  'demo-user-id',
  'Hey Riya! Just a heads up — TCS NQT registration is open and you''re eligible. Deadline is June 7, so register soon before slots fill up.',
  '2026-06-05T20:00:00',
  false
),
(
  'demo-user-id',
  'Riya, TCS NQT registration closes TOMORROW. Your CGPA (7.8) meets the cutoff. Take 10 minutes tonight to register and upload your resume.',
  '2026-06-06T09:00:00',
  false
),
(
  'demo-user-id',
  '🚨 Last day! TCS NQT registration closes today at midnight. Missing this means waiting another year. Register now at tcs.com/careers.',
  '2026-06-07T09:00:00',
  false
);
