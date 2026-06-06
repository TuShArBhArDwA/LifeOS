import { geminiVisionJSON } from '@/lib/gemini';
import { groqJSON } from '@/lib/groq';
import type { Profile } from '@/lib/supabase';

export type OrchestratorOutput = {
  intent: 'placement_notice' | 'assignment' | 'exam' | 'timetable' | 'general' | 'fee_notice' | 'expense_receipt' | 'study_notes' | 'content_request';
  confidence: number;
  summary: string;
  invoke_agents: Array<'task' | 'schedule' | 'placement' | 'reminder' | 'expense' | 'study' | 'content'>;
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
  "intent": "placement_notice" | "assignment" | "exam" | "timetable" | "general" | "fee_notice" | "expense_receipt" | "study_notes" | "content_request",
  "confidence": 0.0-1.0,
  "summary": "One sentence summary for the student",
  "invoke_agents": ["task", "schedule", "placement", "reminder", "expense", "study", "content"],
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
- Always include all agents for placement_notice: ["task", "schedule", "placement", "reminder"]
- For assignment/exam, include: ["task", "schedule", "reminder"]
- For general, include: ["task", "reminder"]
- For expense_receipt, invoke only: ["expense"]
- For study_notes (lecture notes, chapter summaries, handwritten notes, textbook content), invoke: ["study"]
- For content_request (user asks to draft email, write leave application, create report, compose message), invoke: ["content"]
- Dates must be in YYYY-MM-DD format
- If a date is relative (e.g., "this Friday"), resolve it from today's date
- Detect content_request when the input contains words like: draft, write, compose, apply for, send email, leave application, internship email, request letter
- Detect study_notes when the input is study/learning material: notes, chapter, topic, formula, theory, syllabus
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
    const systemPrompt = prompt;
    const userPrompt = `Content to analyze:\n${textInput}`;
    return groqJSON<OrchestratorOutput>(systemPrompt, userPrompt);
  }

  throw new Error('Either imageBase64 or textInput must be provided');
}
