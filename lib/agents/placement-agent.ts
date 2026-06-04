import { geminiJSON } from '@/lib/gemini';
import type { OrchestratorOutput } from './orchestrator';
import type { Profile } from '@/lib/supabase';

export type EligibilityCheck = {
  eligible: boolean;
  cgpa_check: { required: number | null; actual: number; passed: boolean };
  branch_check: { required: string[] | null; actual: string; passed: boolean };
  backlog_check: { backlogs_allowed: boolean | null; message: string };
  overall_reasons: string[];
  missing_criteria: string[];
};

export type PrepWeek = {
  week: number;
  label: string;
  focus: string;
  tasks: string[];
};

export type PlacementAgentOutput = {
  company: string;
  role?: string;
  registration_deadline: string | null;
  eligibility: EligibilityCheck;
  missing_documents: string[];
  documents_checklist: Array<{ doc: string; status: 'required' | 'likely_available' | 'needs_update' }>;
  prep_plan: PrepWeek[];
  quick_tips: string[];
};

export async function runPlacementAgent(
  profile: Profile,
  orchestratorOutput: OrchestratorOutput
): Promise<PlacementAgentOutput> {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
You are the LifeOS Placement Agent. Analyze a placement notice and generate a complete placement action plan.

Student Profile:
- Name: ${profile.name}
- Branch: ${profile.branch}
- Year: ${profile.year}
- CGPA: ${profile.cgpa}
- Skills: ${profile.skills.join(', ')}

Today: ${today}
Extracted Placement Data: ${JSON.stringify(orchestratorOutput.extracted, null, 2)}

Perform a complete analysis. Return ONLY valid JSON:
{
  "company": "Company name",
  "role": "Role/position if mentioned",
  "registration_deadline": "YYYY-MM-DD or null",
  "eligibility": {
    "eligible": true/false,
    "cgpa_check": {
      "required": number or null,
      "actual": ${profile.cgpa},
      "passed": true/false
    },
    "branch_check": {
      "required": ["CSE", "IT"] or null,
      "actual": "${profile.branch}",
      "passed": true/false
    },
    "backlog_check": {
      "backlogs_allowed": true/false/null,
      "message": "explanation"
    },
    "overall_reasons": ["Reason 1", "Reason 2"],
    "missing_criteria": ["Criteria not met"]
  },
  "missing_documents": ["doc1", "doc2"],
  "documents_checklist": [
    { "doc": "Updated Resume", "status": "needs_update" },
    { "doc": "10th Marksheet", "status": "likely_available" }
  ],
  "prep_plan": [
    {
      "week": 1,
      "label": "Week 1",
      "focus": "Aptitude & Reasoning",
      "tasks": ["Complete 50 quant questions daily", "Take 2 mock tests"]
    }
  ],
  "quick_tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Be honest about eligibility. Check CGPA vs min_cgpa strictly.
Generate 2-3 week prep plan covering: aptitude, technical, HR prep.
Documents checklist should include standard placement docs + any specifically mentioned.
`;

  return geminiJSON<PlacementAgentOutput>(prompt);
}
