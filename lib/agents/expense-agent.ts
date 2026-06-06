import { geminiVisionJSON } from '@/lib/gemini';
import { groqJSON } from '@/lib/groq';
import type { Profile } from '@/lib/supabase';

export type ExpenseItem = {
  merchant: string;
  amount: number;
  currency: string;
  category: 'food' | 'transport' | 'books' | 'education' | 'shopping' | 'health' | 'entertainment' | 'other';
  date: string | null; // YYYY-MM-DD
  description: string;
};

export type ExpenseAgentOutput = {
  expenses: ExpenseItem[];
  total: number;
  summary: string;
  budget_tip: string;
};

export async function runExpenseAgent(
  profile: Profile,
  imageBase64?: string,
  mimeType?: string,
  textInput?: string
): Promise<ExpenseAgentOutput> {
  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are the LifeOS Expense Agent. Extract expense data from receipts, bills, or text descriptions and categorize them for an Indian student.

Categories:
- food: Canteen, restaurants, snacks, beverages
- transport: Bus, auto, metro, cab, fuel
- books: Textbooks, stationery, course materials
- education: Fees, exam fees, coaching, online courses
- shopping: Clothes, electronics, accessories
- health: Medicine, doctor, gym
- entertainment: Movies, games, subscriptions
- other: Anything else

Today: ${today}
Student: ${profile.name} | ${profile.branch} Year ${profile.year}

Return ONLY valid JSON:
{
  "expenses": [
    {
      "merchant": "Store/place name",
      "amount": 150.00,
      "currency": "INR",
      "category": "food",
      "date": "YYYY-MM-DD or null",
      "description": "What was purchased"
    }
  ],
  "total": 150.00,
  "summary": "One line summary of the expense(s)",
  "budget_tip": "A practical money-saving tip for this category"
}

For receipts: extract every line item if multiple. For text: parse amounts mentioned.
Always use INR unless explicitly another currency. Amounts in numbers, not strings.`;

  if (imageBase64 && mimeType) {
    return geminiVisionJSON<ExpenseAgentOutput>(systemPrompt, imageBase64, mimeType);
  } else if (textInput) {
    const userPrompt = `Extract expenses from this text:\n${textInput}`;
    return groqJSON<ExpenseAgentOutput>(systemPrompt, userPrompt);
  }

  throw new Error('Either imageBase64 or textInput must be provided');
}
