import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabaseClient();

  // Check profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) redirect('/onboarding');

  // Fetch tasks, events, reminders
  const [{ data: tasks }, { data: events }, { data: reminders }, { data: intakes }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    supabase.from('events').select('*').eq('user_id', userId).order('start_time', { ascending: true }).limit(10),
    supabase.from('reminders').select('*').eq('user_id', userId).eq('sent', false).order('remind_at', { ascending: true }).limit(5),
    supabase.from('intakes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
  ]);

  return (
    <DashboardClient
      profile={profile}
      tasks={tasks ?? []}
      events={events ?? []}
      reminders={reminders ?? []}
      intakes={intakes ?? []}
    />
  );
}
