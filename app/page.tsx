import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import LandingClient from './landing-client';

export const metadata = {
  title: 'LifeOS — AI Chief of Staff for Students',
  description:
    'Drop a screenshot, notice, or PDF. LifeOS reads it, checks your eligibility, creates tasks, sets reminders, and builds your study plan — in under 10 seconds.',
};

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return <LandingClient />;
}
