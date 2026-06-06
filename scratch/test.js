const { runOrchestrator } = require('../lib/agents/orchestrator');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  const mockProfile = {
    name: 'Test Student',
    branch: 'CSE',
    year: 3,
    cgpa: 9.2,
    skills: ['React', 'TypeScript'],
    college: 'Test College',
    email: 'test@lifeos.ai'
  };

  try {
    console.log("Running Orchestrator...");
    const out = await runOrchestrator(
      mockProfile,
      undefined,
      undefined,
      "TCS NQT placement drive registration is open until June 7. Required CGPA is 6.5. CSE/IT branch only."
    );
    console.log("Success:", JSON.stringify(out, null, 2));
  } catch (e) {
    console.error("FAILED WITH ERROR:", e);
  }
}

run();
