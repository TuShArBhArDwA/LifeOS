import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.3,
  },
});

/** Helper to sleep */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Groq text generation — llama-3.3-70b-versatile (fast + smart, generous free tier).
 * Used as primary for all text-only agent calls.
 */
export async function groqText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content ?? '';
}

/**
 * Groq JSON generation — llama-3.3-70b-versatile with response_format: json_object.
 * Primary for all structured agent outputs. If it fails or gets rate limited,
 * it retries with backoff, then falls back to Gemini Flash.
 */
export async function groqJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  attempt = 0
): Promise<T> {
  try {
    // Stagger start slightly on retries to avoid concurrent bursts
    if (attempt > 0) {
      await sleep(attempt * 400 + Math.random() * 200);
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            systemPrompt +
            '\n\nAlways respond with valid JSON only. No markdown, no explanation.',
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    const text = completion.choices[0]?.message?.content ?? '{}';
    return JSON.parse(text) as T;
  } catch (err: any) {
    const isRateLimit = err?.status === 429 || String(err?.message || '').includes('429');
    
    if (isRateLimit && attempt < 2) {
      console.warn(`[Groq] 429 rate limit hit. Retrying attempt ${attempt + 1}...`);
      return groqJSON<T>(systemPrompt, userPrompt, attempt + 1);
    }

    console.error('[groqJSON] Groq failed:', err);
    throw err;
  }
}
