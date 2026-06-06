const Groq = require('groq-sdk');
const fs = require('fs');

// Simple manual parsing of .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

async function run() {
  try {
    console.log("Calling Groq API...");
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond with JSON.' },
        { role: 'user', content: 'Say hello in JSON' },
      ],
      response_format: { type: 'json_object' },
    });
    console.log("Response:", completion.choices[0].message.content);
  } catch (err) {
    console.error("GROQ ERROR:", err);
  }
}

run();
