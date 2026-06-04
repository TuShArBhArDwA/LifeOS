import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/** Fast text generation via Groq (llama-3.1-8b-instant) */
export async function groqText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content ?? '';
}

/** Fast JSON generation via Groq */
export async function groqJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: systemPrompt + '\n\nAlways respond with valid JSON only. No markdown, no explanation.',
      },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2048,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  const text = completion.choices[0]?.message?.content ?? '{}';
  return JSON.parse(text) as T;
}
