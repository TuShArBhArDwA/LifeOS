import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.3,
  },
});

export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: { temperature: 0.5 },
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

/** Simple text-only Gemini call returning JSON */
export async function geminiJSON<T>(prompt: string): Promise<T> {
  const result = await geminiFlash.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    // try to extract JSON from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1]) as T;
    throw new Error(`Gemini returned non-JSON: ${text.slice(0, 200)}`);
  }
}

/** Multimodal Gemini call (image + prompt) returning JSON */
export async function geminiVisionJSON<T>(
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<T> {
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
}
