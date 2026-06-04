-- LifeOS Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- Profiles table (synced from Clerk)
-- ─────────────────────────────────────────
create table if not exists profiles (
  id           text primary key,           -- Clerk user ID
  name         text not null,
  email        text,
  cgpa         numeric(4,2) default 0,
  branch       text default 'CSE',
  skills       text[] default '{}',
  year         int default 1,
  college      text,
  created_at   timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles
  for select using (auth.uid()::text = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid()::text = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid()::text = id);

-- ─────────────────────────────────────────
-- Intakes table (each upload event)
-- ─────────────────────────────────────────
create table if not exists intakes (
  id             uuid primary key default uuid_generate_v4(),
  user_id        text references profiles(id) on delete cascade,
  input_type     text check (input_type in ('screenshot', 'pdf', 'text', 'voice')) default 'text',
  storage_url    text,
  raw_extracted  jsonb default '{}',
  intent         text default 'general',
  summary        text default '',
  created_at     timestamptz default now()
);

alter table intakes enable row level security;
create policy "Users manage own intakes" on intakes
  for all using (auth.uid()::text = user_id);

-- ─────────────────────────────────────────
-- Tasks table
-- ─────────────────────────────────────────
create table if not exists tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      text references profiles(id) on delete cascade,
  intake_id    uuid references intakes(id) on delete set null,
  title        text not null,
  description  text default '',
  priority     int check (priority in (1, 2, 3)) default 2,
  due_date     date,
  status       text check (status in ('pending', 'done', 'snoozed')) default 'pending',
  agent_source text default 'task_agent',
  created_at   timestamptz default now()
);

alter table tasks enable row level security;
create policy "Users manage own tasks" on tasks
  for all using (auth.uid()::text = user_id);

create index tasks_user_status on tasks(user_id, status);

-- ─────────────────────────────────────────
-- Events table (calendar)
-- ─────────────────────────────────────────
create table if not exists events (
  id           uuid primary key default uuid_generate_v4(),
  user_id      text references profiles(id) on delete cascade,
  intake_id    uuid references intakes(id) on delete set null,
  title        text not null,
  start_time   timestamptz not null,
  end_time     timestamptz,
  event_type   text check (event_type in ('deadline', 'study_block', 'reminder', 'interview')) default 'deadline',
  description  text,
  created_at   timestamptz default now()
);

alter table events enable row level security;
create policy "Users manage own events" on events
  for all using (auth.uid()::text = user_id);

create index events_user_start on events(user_id, start_time);

-- ─────────────────────────────────────────
-- Reminders table
-- ─────────────────────────────────────────
create table if not exists reminders (
  id         uuid primary key default uuid_generate_v4(),
  user_id    text references profiles(id) on delete cascade,
  task_id    uuid references tasks(id) on delete set null,
  message    text not null,
  remind_at  timestamptz not null,
  sent       boolean default false,
  created_at timestamptz default now()
);

alter table reminders enable row level security;
create policy "Users manage own reminders" on reminders
  for all using (auth.uid()::text = user_id);

-- ─────────────────────────────────────────
-- Note: We bypass RLS from API routes using
-- the service role key (SUPABASE_SERVICE_ROLE_KEY)
-- So RLS only protects direct client-side access.
-- ─────────────────────────────────────────
