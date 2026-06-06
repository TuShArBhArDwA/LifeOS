import { GoogleGenerativeAI } from '@google/generative-ai';
import { groqJSON } from '@/lib/groq';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/** Gemini Flash — used ONLY for vision/multimodal tasks */
export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.3,
  },
});

/** Convert a base64 image string + mimeType into Gemini-compatible part */
export function imageToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

/**
 * Text-only JSON call.
 * PRIMARY: Groq (llama-3.3-70b-versatile) — very high free-tier limits, fast.
 * FALLBACK: Gemini 2.0 Flash — only used if Groq fails.
 *
 * Since groqJSON takes (systemPrompt, userPrompt), we split the prompt at
 * the first blank line: everything before = system, everything after = user.
 * If there's no blank line the whole string becomes the user prompt.
 */
export async function geminiJSON<T>(prompt: string): Promise<T> {
  const splitIdx = prompt.indexOf('\n\n');
  const systemPrompt =
    splitIdx !== -1
      ? prompt.slice(0, splitIdx).trim()
      : 'You are a helpful AI assistant. Always respond with valid JSON.';
  const userPrompt =
    splitIdx !== -1 ? prompt.slice(splitIdx + 2).trim() : prompt.trim();

  try {
    return await groqJSON<T>(systemPrompt, userPrompt);
  } catch (groqError) {
    console.warn('[geminiJSON] Groq failed, falling back to Gemini:', groqError);
    return await geminiJSONDirect<T>(prompt);
  }
}

/** Direct Gemini call (fallback) with one auto-retry on 429 */
async function geminiJSONDirect<T>(prompt: string, attempt = 0): Promise<T> {
  try {
    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) return JSON.parse(match[1]) as T;
      throw new Error(`Gemini returned non-JSON: ${text.slice(0, 200)}`);
    }
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;
    if (status === 429 && attempt === 0) {
      const delay = getRetryDelay(error);
      console.warn(`[Gemini] 429 — retrying in ${delay / 1000}s…`);
      await sleep(delay);
      return geminiJSONDirect<T>(prompt, 1);
    }
    throw error;
  }
}

/**
 * Multimodal Gemini call (image + prompt) → always uses Gemini (Groq can't do vision).
 * Auto-retries once on 429.
 */
export async function geminiVisionJSON<T>(
  prompt: string,
  imageBase64: string,
  mimeType: string,
  attempt = 0
): Promise<T> {
  try {
    const imagePart = imageToGenerativePart(imageBase64, mimeType);
    const result = await geminiFlash.generateContent([prompt, imagePart]);
    const text = result.response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) return JSON.parse(match[1]) as T;
      throw new Error(`Gemini vision returned non-JSON: ${text.slice(0, 200)}`);
    }
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;
    if (status === 429 && attempt === 0) {
      const delay = getRetryDelay(error);
      console.warn(`[Gemini] Vision 429 — retrying in ${delay / 1000}s…`);
      await sleep(delay);
      return geminiVisionJSON<T>(prompt, imageBase64, mimeType, 1);
    }
    throw error;
  }
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getRetryDelay(error: unknown): number {
  try {
    const msg = String((error as { message?: string })?.message ?? '');
    const match = msg.match(/(\d+(?:\.\d+)?)\s*s/i);
    if (match) return Math.ceil(parseFloat(match[1])) * 1000;
  } catch { /* ignore */ }
  return 30_000;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
