import { geminiVisionJSON, geminiJSON } from '@/lib/gemini';
import type { Profile } from '@/lib/supabase';

export type OrchestratorOutput = {
  intent: 'placement_notice' | 'assignment' | 'exam' | 'timetable' | 'general' | 'fee_notice';
  confidence: number;
  summary: string;
  invoke_agents: Array<'task' | 'schedule' | 'placement' | 'reminder'>;
  extracted: {
    company?: string;
    deadline?: string; // ISO date string
    deadlines?: Array<{ label: string; date: string }>;
    eligibility?: {
      min_cgpa?: number;
      branches?: string[];
      min_percentage?: number;
      backlogs_allowed?: boolean;
    };
    documents_required?: string[];
    event_title?: string;
    event_date?: string;
    subjects?: string[];
    assignment_title?: string;
    fee_amount?: number;
    fee_deadline?: string;
    raw_text?: string;
  };
};

const SYSTEM_PROMPT = (profile: Profile, today: string) => `
You are LifeOS Orchestrator — an AI system that reads student documents and extracts all actionable information.

Student Profile:
- Name: ${profile.name}
- Branch: ${profile.branch}
- Year: ${profile.year}
- CGPA: ${profile.cgpa}
- Skills: ${profile.skills.join(', ')}
- College: ${profile.college || 'Not specified'}

Today's Date: ${today}

Your job: Analyze the provided content and return a structured JSON object.

Return ONLY valid JSON matching this exact schema:
{
  "intent": "placement_notice" | "assignment" | "exam" | "timetable" | "general" | "fee_notice",
  "confidence": 0.0-1.0,
  "summary": "One sentence summary for the student",
  "invoke_agents": ["task", "schedule", "placement", "reminder"],
  "extracted": {
    "company": "string or null",
    "deadline": "YYYY-MM-DD or null",
    "deadlines": [{ "label": "string", "date": "YYYY-MM-DD" }],
    "eligibility": {
      "min_cgpa": number or null,
      "branches": ["string"] or null,
      "min_percentage": number or null,
      "backlogs_allowed": boolean or null
    },
    "documents_required": ["string"] or null,
    "event_title": "string or null",
    "event_date": "YYYY-MM-DD or null",
    "subjects": ["string"] or null,
    "assignment_title": "string or null",
    "fee_amount": number or null,
    "fee_deadline": "YYYY-MM-DD or null",
    "raw_text": "key extracted text"
  }
}

Rules:
- Always include all agents for placement_notice
- For assignment/exam, include task + schedule + reminder
- For general, include task + reminder
- Dates must be in YYYY-MM-DD format
- If a date is relative (e.g., "this Friday"), resolve it from today's date
`;

export async function runOrchestrator(
  profile: Profile,
  imageBase64?: string,
  mimeType?: string,
  textInput?: string
): Promise<OrchestratorOutput> {
  const today = new Date().toISOString().split('T')[0];
  const prompt = SYSTEM_PROMPT(profile, today);

  if (imageBase64 && mimeType) {
    return geminiVisionJSON<OrchestratorOutput>(prompt, imageBase64, mimeType);
  } else if (textInput) {
    return geminiJSON<OrchestratorOutput>(
      `${prompt}\n\nContent to analyze:\n${textInput}`
    );
  }

  throw new Error('Either imageBase64 or textInput must be provided');
}
