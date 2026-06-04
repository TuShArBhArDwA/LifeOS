import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (service role — only use in API routes)
export function createServerSupabaseClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type Profile = {
  id: string;
  name: string;
  email: string;
  cgpa: number;
  branch: string;
  skills: string[];
  year: number;
  college?: string;
  created_at: string;
};

export type Intake = {
  id: string;
  user_id: string;
  input_type: 'screenshot' | 'pdf' | 'text' | 'voice';
  storage_url?: string;
  raw_extracted: Record<string, unknown>;
  intent: string;
  summary: string;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  intake_id?: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  due_date?: string;
  status: 'pending' | 'done' | 'snoozed';
  agent_source: string;
  created_at: string;
};

export type CalendarEvent = {
  id: string;
  user_id: string;
  intake_id?: string;
  title: string;
  start_time: string;
  end_time?: string;
  event_type: 'deadline' | 'study_block' | 'reminder' | 'interview';
  description?: string;
  created_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  task_id?: string;
  message: string;
  remind_at: string;
  sent: boolean;
};
