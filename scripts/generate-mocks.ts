import * as fs from 'fs';
import * as path from 'path';
import type { Profile } from '../lib/supabase';

// Manually load env from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = val;
  });
}

const EXAMPLES = [
  {
    id: 'example-all',
    text: `ALERT: TCS NQT campus placement notice received! Registration deadline: June 9, 2026. Venue: Auditorium B at 10:00 AM. Eligibility requirements: Minimum 6.5 CGPA, no active backlogs. Documents needed: Resume draft, Marks card.\n\nLet's also summarize the required placement study topics: "Aptitude consists of Quantitative reasoning, logical puzzles, and verbal sections. DBMS study requires understanding SQL Joins, Indexing, Normalization (1NF to BCNF), and ACID properties."\n\nLastly, spent ₹120 for HOD signatures travel auto fare and Xerox printouts. Draft a request letter to the HOD for NOC certificate to attend the campus drive on June 12.`,
  },
  {
    id: 'example-tcs',
    text: 'TCS NQT Drive — Register by June 7, 2026. Eligibility: 60% aggregate, No active backlogs. Required documents: Updated resume, College ID, 10th & 12th marksheets. Venue: Auditorium A. Reporting time: 9:00 AM.',
  },
  {
    id: 'example-assignment',
    text: 'DBMS Mini Project submission is due this Friday. You need to submit a working prototype + 5-page report to the college portal. Late submissions will not be accepted.',
  },
  {
    id: 'example-exam',
    text: 'End Semester Exams start June 15, 2026. Data Structures: June 15, Operating Systems: June 18, Computer Networks: June 20, DBMS: June 22. Exam time: 10 AM - 1 PM.',
  },
  {
    id: 'example-expense',
    text: 'Spent today: Canteen lunch ₹80, Auto to college ₹45, Xerox of notes ₹30, Amazon order — DSA book ₹350. Total: ₹505.',
  },
  {
    id: 'example-study',
    text: 'CPU Scheduling Notes: Scheduling is the process of deciding which process gets CPU time. Preemptive scheduling allows interrupting a process mid-execution (e.g. Round Robin, SRTF), while Non-Preemptive runs until done (e.g. FCFS, SJF). Gantt charts are used to calculate average waiting time and turnaround time. Turnaround Time = Completion Time - Arrival Time. Waiting Time = Turnaround Time - Burst Time.',
  },
  {
    id: 'example-content',
    text: "Draft a leave application to the HOD of CSE department requesting 2 days of leave (June 8th and 9th) because I have to travel out of station for a cousin's wedding.",
  },
];

const mockProfile: Profile = {
  id: 'guest_user',
  name: 'Guest Student',
  email: 'guest@lifeos.ai',
  cgpa: 9.2,
  branch: 'CSE',
  skills: ['React', 'TypeScript', 'Python'],
  year: 3,
  college: 'iQOO Institute of Tech',
  created_at: new Date().toISOString(),
};

async function main() {
  console.log('Generating prestored answers for examples...');
  
  // Dynamically import agents to prevent premature evaluation of Groq SDK before env vars are set
  const { runOrchestrator } = await import('../lib/agents/orchestrator');
  const { runTaskAgent } = await import('../lib/agents/task-agent');
  const { runScheduleAgent } = await import('../lib/agents/schedule-agent');
  const { runPlacementAgent } = await import('../lib/agents/placement-agent');
  const { runReminderAgent } = await import('../lib/agents/reminder-agent');
  const { runExpenseAgent } = await import('../lib/agents/expense-agent');
  const { runStudyAgent } = await import('../lib/agents/study-agent');
  const { runContentAgent } = await import('../lib/agents/content-agent');

  const results: Record<string, any> = {};

  for (const ex of EXAMPLES) {
    console.log(`Processing: ${ex.id}...`);
    try {
      const orchestratorOutput = await runOrchestrator(mockProfile as any, undefined, undefined, ex.text);
      const agentsToRun = orchestratorOutput.invoke_agents;

      const [taskResult, scheduleResult, placementResult, reminderResult, expenseResult, studyResult, contentResult] = await Promise.allSettled([
        agentsToRun.includes('task')
          ? runTaskAgent(mockProfile as any, orchestratorOutput)
          : Promise.resolve(null),
        agentsToRun.includes('schedule')
          ? runScheduleAgent(mockProfile as any, orchestratorOutput)
          : Promise.resolve(null),
        agentsToRun.includes('placement')
          ? runPlacementAgent(mockProfile as any, orchestratorOutput)
          : Promise.resolve(null),
        agentsToRun.includes('reminder')
          ? runReminderAgent(mockProfile as any, orchestratorOutput)
          : Promise.resolve(null),
        agentsToRun.includes('expense')
          ? runExpenseAgent(mockProfile as any, undefined, undefined, ex.text)
          : Promise.resolve(null),
        agentsToRun.includes('study')
          ? runStudyAgent(mockProfile as any, undefined, undefined, ex.text)
          : Promise.resolve(null),
        agentsToRun.includes('content')
          ? runContentAgent(mockProfile as any, ex.text)
          : Promise.resolve(null),
      ]);

      const tasks = taskResult.status === 'fulfilled' ? taskResult.value : null;
      const schedule = scheduleResult.status === 'fulfilled' ? scheduleResult.value : null;
      const placement = placementResult.status === 'fulfilled' ? placementResult.value : null;
      const reminders = reminderResult.status === 'fulfilled' ? reminderResult.value : null;
      const expense = expenseResult.status === 'fulfilled' ? expenseResult.value : null;
      const study = studyResult.status === 'fulfilled' ? studyResult.value : null;
      const content = contentResult.status === 'fulfilled' ? contentResult.value : null;

      results[ex.id] = {
        success: true,
        orchestrator: orchestratorOutput,
        tasks: tasks?.tasks ?? [],
        events: schedule?.events ?? [],
        placement: placement ?? null,
        reminders: reminders?.reminders ?? [],
        expense: expense ?? null,
        study: study ?? null,
        content: content ?? null,
      };
      console.log(`✓ Completed: ${ex.id}`);
    } catch (err) {
      console.error(`✗ Error on ${ex.id}:`, err);
    }
  }

  const outputFilePath = path.join(process.cwd(), 'lib', 'prestored-answers.ts');
  const fileContent = `// Prestored answers generated from Groq for demographic examples.
// This allows immediate response times and zero API usage for demo examples.

export const PRESTORED_ANSWERS: Record<string, any> = ${JSON.stringify(results, null, 2)};
`;

  fs.writeFileSync(outputFilePath, fileContent, 'utf-8');
  console.log(`Prestored answers written to: ${outputFilePath}`);
}

main().catch(console.error);
