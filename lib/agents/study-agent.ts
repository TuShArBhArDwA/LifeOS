import { geminiVisionJSON } from '@/lib/gemini';
import { groqJSON } from '@/lib/groq';
import type { Profile } from '@/lib/supabase';

export type Flashcard = {
  question: string;
  answer: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];   // exactly 4 options
  correct: number;     // 0-indexed
  explanation: string;
};

export type StudyAgentOutput = {
  subject: string;
  summary_points: string[];   // 5 concise bullet points
  flashcards: Flashcard[];    // 5-8 Q&A pairs
  quiz: QuizQuestion[];       // 3-5 MCQ
  study_tip: string;
};

export async function runStudyAgent(
  profile: Profile,
  imageBase64?: string,
  mimeType?: string,
  textInput?: string
): Promise<StudyAgentOutput> {
  const systemPrompt = `You are the LifeOS Study Agent. Analyze student notes or study material and generate a complete study kit.

Student: ${profile.name} | ${profile.branch} Year ${profile.year}

Return ONLY valid JSON:
{
  "subject": "Subject/topic name",
  "summary_points": [
    "Key point 1 — keep it concise and exam-relevant",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  "flashcards": [
    { "question": "What is X?", "answer": "X is Y because Z" }
  ],
  "quiz": [
    {
      "question": "Which of the following best describes X?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Option A is correct because..."
    }
  ],
  "study_tip": "A specific, actionable study tip for this topic"
}

Rules:
- summary_points: exactly 5, max 20 words each, exam-focused
- flashcards: 5-8 pairs, cover key definitions + concepts + formulas
- quiz: 3-5 MCQ, exactly 4 options each, correct is 0-indexed
- study_tip: specific to the topic, not generic ("Review chapter 3" is bad)
- If content is an image of handwritten notes, extract and structure them
- Focus on what's most likely to appear in Indian university exams`;

  if (imageBase64 && mimeType) {
    return geminiVisionJSON<StudyAgentOutput>(systemPrompt, imageBase64, mimeType);
  } else if (textInput) {
    const userPrompt = `Study material to analyze:\n${textInput}`;
    return groqJSON<StudyAgentOutput>(systemPrompt, userPrompt);
  }

  throw new Error('Either imageBase64 or textInput must be provided');
}
