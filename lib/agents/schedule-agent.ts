import { groqJSON } from '@/lib/groq';
import type { OrchestratorOutput } from './orchestrator';
import type { Profile } from '@/lib/supabase';

export type GeneratedEvent = {
  title: string;
  start_time: string; // ISO datetime
  end_time: string;   // ISO datetime
  event_type: 'deadline' | 'study_block' | 'reminder' | 'interview';
  description?: string;
};

export type ScheduleAgentOutput = {
  events: GeneratedEvent[];
};

export async function runScheduleAgent(
  profile: Profile,
  orchestratorOutput: OrchestratorOutput
): Promise<ScheduleAgentOutput> {
  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are the LifeOS Schedule Agent. Create calendar events for a student based on document data.

Create 3-8 calendar events. Include:
1. Deadline events (registration close, submission due, etc.)
2. Study/prep blocks in the days leading up to deadlines
3. Reminder events 24-48h before deadlines

Return ONLY valid JSON:
{
  "events": [
    {
      "title": "Event title",
      "start_time": "YYYY-MM-DDTHH:MM:00",
      "end_time": "YYYY-MM-DDTHH:MM:00",
      "event_type": "deadline" | "study_block" | "reminder" | "interview",
      "description": "optional details"
    }
  ]
}

Rules:
- Study blocks should be 2 hours, mornings (09:00-11:00) or evenings (19:00-21:00)
- Deadline events should be at 23:59 on the due date
- Reminder events at 09:00 the day before deadline
- Spread study blocks across multiple days (not all on one day)
- All times in IST (UTC+5:30 — but write without timezone offset)`;

  const userPrompt = `Student: ${profile.name} | ${profile.branch} Year ${profile.year}
Today: ${today}
Document Intent: ${orchestratorOutput.intent}
Extracted Data: ${JSON.stringify(orchestratorOutput.extracted, null, 2)}`;

  return groqJSON<ScheduleAgentOutput>(systemPrompt, userPrompt);
}
