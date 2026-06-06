import { groqJSON } from '@/lib/groq';
import type { OrchestratorOutput } from './orchestrator';
import type { Profile } from '@/lib/supabase';

export type GeneratedTask = {
  title: string;
  description: string;
  priority: 1 | 2 | 3; // 1=High, 2=Medium, 3=Low
  due_date: string | null; // YYYY-MM-DD
  agent_source: string;
};

export type TaskAgentOutput = {
  tasks: GeneratedTask[];
};

export async function runTaskAgent(
  profile: Profile,
  orchestratorOutput: OrchestratorOutput
): Promise<TaskAgentOutput> {
  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are the LifeOS Task Agent. Generate actionable tasks for a student based on extracted document data.

Priority: 1=High (due < 3 days), 2=Medium (due < 7 days), 3=Low (due > 7 days)

Return ONLY valid JSON:
{
  "tasks": [
    {
      "title": "Short, action-oriented title (max 60 chars)",
      "description": "Clear description of what to do and why",
      "priority": 1 | 2 | 3,
      "due_date": "YYYY-MM-DD or null",
      "agent_source": "task_agent"
    }
  ]
}

Make tasks specific — not "Prepare for interview" but "Complete TCS NQT mock test on PrepInsta".
If placement notice: include registration, resume update, document gathering, preparation tasks.
If assignment: include research, draft, review, submission tasks.
If exam: include topic-wise study tasks.
Generate 3-6 specific, actionable tasks. Prioritize by urgency.`;

  const userPrompt = `Student: ${profile.name} | ${profile.branch} Year ${profile.year} | CGPA: ${profile.cgpa}
Today: ${today}
Document Intent: ${orchestratorOutput.intent}
Summary: ${orchestratorOutput.summary}
Extracted Data: ${JSON.stringify(orchestratorOutput.extracted, null, 2)}`;

  return groqJSON<TaskAgentOutput>(systemPrompt, userPrompt);
}
