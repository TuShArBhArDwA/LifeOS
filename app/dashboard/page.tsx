import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const isGuest = params.guest === 'true';

  let userId: string | null = null;
  if (!isGuest) {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) redirect('/sign-in');
  }

  if (isGuest) {
    const guestProfile = {
      id: 'guest_user',
      name: 'Guest Student',
      email: 'guest@lifeos.ai',
      cgpa: 9.2,
      branch: 'CSE',
      skills: ['React', 'TypeScript', 'Python', 'Tailwind', 'Node.js'],
      year: 3,
      college: 'iQOO Institute of Tech',
      created_at: new Date().toISOString(),
    };
    return (
      <DashboardClient
        profile={guestProfile}
        tasks={[]}
        events={[]}
        reminders={[]}
        intakes={[]}
      />
    );
  }

  const supabase = createServerSupabaseClient();

  // Check profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId!)
    .single();

  if (!profile) redirect('/onboarding');

  // Fetch tasks, events, reminders
  const [{ data: tasks }, { data: events }, { data: reminders }, { data: intakes }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId!).order('created_at', { ascending: false }).limit(20),
    supabase.from('events').select('*').eq('user_id', userId!).order('start_time', { ascending: true }).limit(10),
    supabase.from('reminders').select('*').eq('user_id', userId!).eq('sent', false).order('remind_at', { ascending: true }).limit(5),
    supabase.from('intakes').select('*').eq('user_id', userId!).order('created_at', { ascending: false }).limit(5),
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
