import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
 * Primary for all structured agent outputs. Very high free-tier rate limits.
 */
export async function groqJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
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
}
