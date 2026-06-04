import { groqJSON } from '@/lib/groq';
import type { OrchestratorOutput } from './orchestrator';
import type { Profile } from '@/lib/supabase';

export type GeneratedReminder = {
  message: string;
  remind_at: string; // ISO datetime
  tone: 'urgent' | 'encouraging' | 'informational';
  why_it_matters: string;
};

export type ReminderAgentOutput = {
  reminders: GeneratedReminder[];
};

export async function runReminderAgent(
  profile: Profile,
  orchestratorOutput: OrchestratorOutput
): Promise<ReminderAgentOutput> {
  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `
You are the LifeOS Reminder Agent. You write context-aware, motivating reminders for students.
Your reminders explain not just WHAT to do, but WHY it matters and WHAT HAPPENS if they miss it.
You are direct, empathetic, and occasionally urgent. Never write generic reminders.
Always respond with valid JSON only.
`;

  const userPrompt = `
Student: ${profile.name} | ${profile.branch} | CGPA: ${profile.cgpa}
Today: ${today}
Context: ${orchestratorOutput.summary}
Intent: ${orchestratorOutput.intent}
Key Deadline: ${orchestratorOutput.extracted.deadline || orchestratorOutput.extracted.fee_deadline || 'Not specified'}
Extracted: ${JSON.stringify(orchestratorOutput.extracted, null, 2)}

Generate 3 reminders at strategic times before the deadline.
Example schedule for a deadline 5 days away:
- Reminder 1: Today evening (20:00) — awareness
- Reminder 2: 2 days before deadline (09:00) — action
- Reminder 3: 1 day before deadline (09:00) — urgency

Return JSON:
{
  "reminders": [
    {
      "message": "Context-aware reminder message (2-3 sentences, mentions student name and specific event)",
      "remind_at": "YYYY-MM-DDTHH:00:00",
      "tone": "urgent" | "encouraging" | "informational",
      "why_it_matters": "One sentence on consequences of missing this"
    }
  ]
}
`;

  return groqJSON<ReminderAgentOutput>(systemPrompt, userPrompt);
}
