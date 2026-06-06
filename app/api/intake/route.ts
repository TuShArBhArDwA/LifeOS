import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { runOrchestrator } from '@/lib/agents/orchestrator';
import { runTaskAgent } from '@/lib/agents/task-agent';
import { runScheduleAgent } from '@/lib/agents/schedule-agent';
import { runPlacementAgent } from '@/lib/agents/placement-agent';
import { runReminderAgent } from '@/lib/agents/reminder-agent';
import { runExpenseAgent } from '@/lib/agents/expense-agent';
import type { Profile } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const isGuest = req.headers.get('x-guest-mode') === 'true';
    let userId = '';
    let profile: Profile | null = null;
    let supabase;

    if (isGuest) {
      userId = 'guest_user';
      profile = {
        id: 'guest_user',
        name: 'Guest Student',
        email: 'guest@lifeos.ai',
        cgpa: 9.2,
        branch: 'CSE',
        skills: ['React', 'TypeScript', 'Python'],
        year: 3,
        college: 'iQOO Institute of Tech',
        created_at: new Date().toISOString()
      };
    } else {
      const authResult = await auth();
      if (!authResult.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = authResult.userId;
      supabase = createServerSupabaseClient();

      // Fetch student profile
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !dbProfile) {
        return NextResponse.json(
          { error: 'Profile not found. Please complete your profile first.' },
          { status: 404 }
        );
      }
      profile = dbProfile;
    }

    // Parse request — supports JSON (base64 image) or FormData (file upload)
    let imageBase64: string | undefined;
    let mimeType: string | undefined;
    let textInput: string | undefined;
    let inputType: 'screenshot' | 'pdf' | 'text' | 'voice' = 'text';

    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('text') as string | null;

      if (file) {
        const buffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
        mimeType = file.type;
        if (file.type === 'application/pdf') {
          inputType = 'pdf';
        } else if (file.type.startsWith('audio/')) {
          inputType = 'voice';
        } else {
          inputType = 'screenshot';
        }
      } else if (text) {
        textInput = text;
        inputType = 'text';
      }
    } else {
      const body = await req.json();
      imageBase64 = body.imageBase64;
      mimeType = body.mimeType;
      textInput = body.text;
      inputType = body.inputType ?? 'text';
    }

    if (!imageBase64 && !textInput) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    // Step 1: Orchestrator
    const orchestratorOutput = await runOrchestrator(
      profile as Profile,
      imageBase64,
      mimeType,
      textInput
    );

    // Step 2: Run agents in parallel based on orchestrator decision
    const agentsToRun = orchestratorOutput.invoke_agents;

    const [taskResult, scheduleResult, placementResult, reminderResult, expenseResult] = await Promise.allSettled([
      agentsToRun.includes('task')
        ? runTaskAgent(profile as Profile, orchestratorOutput)
        : Promise.resolve(null),
      agentsToRun.includes('schedule')
        ? runScheduleAgent(profile as Profile, orchestratorOutput)
        : Promise.resolve(null),
      agentsToRun.includes('placement') && orchestratorOutput.intent === 'placement_notice'
        ? runPlacementAgent(profile as Profile, orchestratorOutput)
        : Promise.resolve(null),
      agentsToRun.includes('reminder')
        ? runReminderAgent(profile as Profile, orchestratorOutput)
        : Promise.resolve(null),
      agentsToRun.includes('expense') && orchestratorOutput.intent === 'expense_receipt'
        ? runExpenseAgent(profile as Profile, imageBase64, mimeType, textInput)
        : Promise.resolve(null),
    ]);

    const tasks = taskResult.status === 'fulfilled' ? taskResult.value : null;
    const schedule = scheduleResult.status === 'fulfilled' ? scheduleResult.value : null;
    const placement = placementResult.status === 'fulfilled' ? placementResult.value : null;
    const reminders = reminderResult.status === 'fulfilled' ? reminderResult.value : null;
    const expense = expenseResult.status === 'fulfilled' ? expenseResult.value : null;

    // Step 3: Save to Supabase (only for authenticated users)
    let intakeId = 'guest_intake_' + Date.now();

    if (!isGuest && supabase) {
      const { data: intake } = await supabase
        .from('intakes')
        .insert({
          user_id: userId,
          input_type: inputType,
          raw_extracted: orchestratorOutput.extracted,
          intent: orchestratorOutput.intent,
          summary: orchestratorOutput.summary,
        })
        .select()
        .single();

      if (intake) intakeId = intake.id;

      // Save tasks
      if (tasks?.tasks?.length) {
        await supabase.from('tasks').insert(
          tasks.tasks.map((t) => ({
            user_id: userId,
            intake_id: intakeId,
            title: t.title,
            description: t.description,
            priority: t.priority,
            due_date: t.due_date,
            status: 'pending',
            agent_source: t.agent_source,
          }))
        );
      }

      // Save calendar events
      if (schedule?.events?.length) {
        await supabase.from('events').insert(
          schedule.events.map((e) => ({
            user_id: userId,
            intake_id: intakeId,
            title: e.title,
            start_time: e.start_time,
            end_time: e.end_time,
            event_type: e.event_type,
            description: e.description,
          }))
        );
      }

      // Save reminders
      if (reminders?.reminders?.length) {
        await supabase.from('reminders').insert(
          reminders.reminders.map((r) => ({
            user_id: userId,
            message: r.message,
            remind_at: r.remind_at,
            sent: false,
          }))
        );
      }
    }

    return NextResponse.json({
      success: true,
      orchestrator: orchestratorOutput,
      tasks: tasks?.tasks ?? [],
      events: schedule?.events ?? [],
      placement: placement ?? null,
      reminders: reminders?.reminders ?? [],
      expense: expense ?? null,
      intake_id: intakeId,
    });
  } catch (error) {
    console.error('Intake API error:', error);

    // Propagate Gemini rate-limit as a clean 429 with retry hint
    const status = (error as { status?: number })?.status;
    if (status === 429) {
      const msg = String((error as { message?: string })?.message ?? '');
      const delayMatch = msg.match(/(\d+(?:\.\d+)?)\s*s/i);
      const retryAfter = delayMatch ? Math.ceil(parseFloat(delayMatch[1])) : 30;
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: `The AI is temporarily busy. Please wait ${retryAfter} seconds and try again.`,
          retryAfter,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Processing failed', details: String(error) },
      { status: 500 }
    );
  }
}
