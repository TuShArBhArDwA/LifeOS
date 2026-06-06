import { groqJSON } from '@/lib/groq';
import type { Profile } from '@/lib/supabase';

export type ContentType =
  | 'leave_application'
  | 'internship_email'
  | 'complaint_letter'
  | 'project_report_abstract'
  | 'noc_request'
  | 'scholarship_essay'
  | 'general_email'
  | 'other';

export type ContentAgentOutput = {
  content_type: ContentType;
  subject: string;       // Email/letter subject line
  recipient: string;     // e.g. "HOD, CSE Department" or "HR Manager, TCS"
  draft: string;         // Full formatted letter/email body
  tone: 'formal' | 'semi-formal' | 'professional';
  word_count: number;
  usage_tip: string;     // How/where to use this draft
};

export async function runContentAgent(
  profile: Profile,
  textInput: string
): Promise<ContentAgentOutput> {
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const systemPrompt = `You are the LifeOS Content Agent. Draft professional letters, emails, and applications for Indian college students.

Student Profile:
- Name: ${profile.name}
- Branch: ${profile.branch}, Year ${profile.year}
- College: ${profile.college || 'ABC Engineering College'}
- Email: ${profile.email}

Today's Date: ${today}

Return ONLY valid JSON:
{
  "content_type": "leave_application" | "internship_email" | "complaint_letter" | "project_report_abstract" | "noc_request" | "scholarship_essay" | "general_email" | "other",
  "subject": "Subject line for the letter/email",
  "recipient": "To whom this is addressed (e.g. 'The HOD, CSE Department')",
  "draft": "Full formatted letter/email body here. Use \\n for line breaks.",
  "tone": "formal" | "semi-formal" | "professional",
  "word_count": 150,
  "usage_tip": "Copy this to Gmail / print and submit to the department office"
}

Rules:
- Use the student's real name throughout the draft
- Indian formal letter format: Date, To, Subject, Salutation, Body, Closing, Signature
- For emails: Subject, Salutation, Body, Regards, Name
- Be specific — include details the student mentioned (dates, reasons, names)
- Infer reasonable details if not given (e.g. "tomorrow" = next working day)
- Keep it professional but not robotic — real Indian student voice
- word_count should be the actual count of words in the draft`;

  const userPrompt = `Student request: "${textInput}"

Draft the appropriate document based on this request.`;

  return groqJSON<ContentAgentOutput>(systemPrompt, userPrompt);
}
